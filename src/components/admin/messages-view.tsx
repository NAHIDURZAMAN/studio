"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import type { Message } from '@/types'
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  User, 
  Phone, 
  Eye, 
  Reply, 
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const statusColors = {
  unread: 'bg-red-500 hover:bg-red-600',
  read: 'bg-yellow-500 hover:bg-yellow-600', 
  replied: 'bg-green-500 hover:bg-green-600'
}

const statusIcons = {
  unread: AlertCircle,
  read: Eye,
  replied: Check
}

export default function MessagesView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
        // Check if it's a table doesn't exist error
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          toast({
            variant: "destructive",
            title: "Messages Table Not Found",
            description: "Please set up the messages table first. Check SETUP_MESSAGES_TABLE.md for instructions.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error Loading Messages",
            description: "Failed to load messages. Please refresh the page.",
          })
        }
        return
      }
      
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        variant: "destructive",
        title: "Error Loading Messages",
        description: "Failed to load messages. Please refresh the page.",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (messageId: number, status: Message['status'], notes?: string) => {
    setIsUpdating(true)
    try {
      const updateData: any = { status }
      if (notes !== undefined) {
        updateData.admin_notes = notes
      }

      const { error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', messageId)

      if (error) throw error

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status, admin_notes: notes !== undefined ? notes : msg.admin_notes }
          : msg
      ))

      toast({
        title: "Message Updated",
        description: `Message marked as ${status}${notes ? ' with notes' : ''}.`,
      })

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { 
          ...prev, 
          status, 
          admin_notes: notes !== undefined ? notes : prev.admin_notes 
        } : null)
      }

    } catch (error) {
      console.error('Error updating message:', error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update message status.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveNotes = () => {
    if (selectedMessage) {
      updateMessageStatus(selectedMessage.id, selectedMessage.status, adminNotes)
    }
  }

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true
    return message.status === filter
  })

  const unreadCount = messages.filter(m => m.status === 'unread').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading messages...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Customer Messages
          </h2>
          <p className="text-muted-foreground">
            {messages.length} total messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'unread', 'read', 'replied'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              <Filter className="w-4 h-4 mr-1" />
              {status}
              {status !== 'all' && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {messages.filter(m => m.status === status).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="grid gap-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === 'all' ? 'No messages yet' : `No ${filter} messages`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => {
            const StatusIcon = statusIcons[message.status]
            return (
              <Card key={message.id} className={`border-l-4 ${
                message.status === 'unread' ? 'border-l-red-500' : 
                message.status === 'read' ? 'border-l-yellow-500' : 
                'border-l-green-500'
              } hover:shadow-md transition-shadow`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {message.first_name} {message.last_name}
                        </CardTitle>
                        <Badge className={statusColors[message.status]} variant="default">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {message.status}
                        </Badge>
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {message.email}
                          </span>
                          {message.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {message.phone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Subject:</h4>
                    <p className="text-sm">{message.subject}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Message:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {message.message.length > 200 
                        ? `${message.message.substring(0, 200)}...`
                        : message.message
                      }
                    </p>
                  </div>
                  
                  {message.admin_notes && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-primary">Admin Notes:</h4>
                      <p className="text-sm bg-primary/5 p-2 rounded border">
                        {message.admin_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {/* View Full Message Dialog */}
                    <Dialog onOpenChange={(open) => {
                      if (open) {
                        setSelectedMessage(message)
                        setAdminNotes(message.admin_notes || '')
                        // Mark as read when opened
                        if (message.status === 'unread') {
                          updateMessageStatus(message.id, 'read')
                        }
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Full
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Message from {message.first_name} {message.last_name}</DialogTitle>
                          <DialogDescription>
                            {message.email} • {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-semibold">Subject</Label>
                            <p className="text-sm mt-1 p-2 bg-muted rounded">{message.subject}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-semibold">Full Message</Label>
                            <p className="text-sm mt-1 p-3 bg-muted rounded whitespace-pre-wrap leading-relaxed">
                              {message.message}
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="adminNotes" className="text-sm font-semibold">
                              Admin Notes
                            </Label>
                            <Textarea
                              id="adminNotes"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add internal notes about this message..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSaveNotes}
                              disabled={isUpdating}
                              size="sm"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-1" />
                              )}
                              Save Notes
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => updateMessageStatus(message.id, 'replied')}
                              disabled={isUpdating}
                              size="sm"
                            >
                              <Reply className="w-4 h-4 mr-1" />
                              Mark Replied
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Quick Status Buttons */}
                    {message.status === 'unread' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMessageStatus(message.id, 'read')}
                        disabled={isUpdating}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    
                    {message.status !== 'replied' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMessageStatus(message.id, 'replied')}
                        disabled={isUpdating}
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Mark Replied
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
