"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChatView, ChatConversation, ChatMessage, ChatParticipant } from "@/components/chat/chat-view"
import { useAuth } from "@/lib/auth-context"
import { getConversations, getMessages, sendMessage, markAsRead, createConversation } from "@/lib/api/messages"
import { getEcho } from "@/lib/echo"
import { Loader2 } from "lucide-react"

export default function BuyerMessagesPage() {
  const { user, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [hasProcessedAutoMessage, setHasProcessedAutoMessage] = useState(false)

  const buildIncomingMessage = (data: any): ChatMessage | null => {
    const msg = data?.message
    if (!msg?.id) return null
    return {
      id: msg.id.toString(),
      senderId: msg.sender_id?.toString() || "",
      text: msg.body || msg.content || msg.message || "",
      timestamp: "Just now",
      isRead: false,
    }
  }

  // Fetch conversations
  useEffect(() => {
    async function loadConversations() {
      if (!isAuthenticated) return
      
      setIsLoading(true)
      try {
        const data = await getConversations()
        setConversations(data)
        if (data.length > 0 && !selectedConvId) {
          setSelectedConvId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to load buyer conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [isAuthenticated])

  // Handle Auto Message
  useEffect(() => {
    async function processAutoMessage() {
      if (!isAuthenticated || hasProcessedAutoMessage || conversations.length === 0) return
      
      const autoMessage = searchParams.get('auto_message')
      const supplierSlug = searchParams.get('supplier')
      const productSlug = searchParams.get('product')
      
      if (autoMessage === '1' && supplierSlug && productSlug) {
        setHasProcessedAutoMessage(true)
        
        // Remove query params to avoid duplicate sending on refresh
        router.replace('/dashboard/buyer/messages')
        
        setIsMessagesLoading(true)
        try {
          // In a real app, we'd lookup the supplier ID. For dummy data, use a static ID or slug
          let conv = conversations.find(c => c.participants.some(p => p.id === supplierSlug || p.name.toLowerCase().includes(supplierSlug.split('-')[0])))
          
          if (!conv) {
            conv = await createConversation([supplierSlug, "buyer-1"], `Inquiry about ${productSlug}`) || undefined;
            if (conv) {
              setConversations(prev => [conv!, ...prev])
            }
          }
          
          if (conv) {
            setSelectedConvId(conv.id)
            const defaultText = `Hello,\n\nI am interested in your product "${productSlug}".\nCould you please provide more details regarding pricing, minimum order quantity, and available shipping options?\n\nI look forward to hearing from you soon.\n\nBest regards.`
            
            // Send the message
            const sentMsg = await sendMessage(conv.id, defaultText)
            if (sentMsg) {
              setMessages(prev => [...prev, sentMsg])
              setConversations(prev => prev.map(c => 
                c.id === conv!.id 
                  ? { ...c, lastMessage: sentMsg, updatedAt: "Just now" } 
                  : c
              ))
            }
          }
        } catch (error) {
          console.error("Auto message failed:", error)
        } finally {
          setIsMessagesLoading(false)
        }
      } else if (!selectedConvId && conversations.length > 0) {
        setSelectedConvId(conversations[0].id)
      }
    }
    processAutoMessage()
  }, [isAuthenticated, searchParams, hasProcessedAutoMessage, conversations, selectedConvId, router])

  // Fetch messages
  useEffect(() => {
    async function loadMessages() {
      if (!selectedConvId) return
      
      setIsMessagesLoading(true)
      try {
        const data = await getMessages(selectedConvId)
        setMessages(data)
      } catch (error) {
        console.error("Failed to load messages:", error)
      } finally {
        setIsMessagesLoading(false)
      }
    }

    loadMessages()
  }, [selectedConvId])

  // Fallback sync when realtime event is not received.
  useEffect(() => {
    if (!selectedConvId) return

    const interval = setInterval(async () => {
      try {
        const latest = await getMessages(selectedConvId)
        setMessages((prev) => {
          if (prev.length === 0) return latest
          const existingIds = new Set(prev.map((m) => m.id))
          const unseen = latest.filter((m) => !existingIds.has(m.id))
          return unseen.length ? [...prev, ...unseen] : prev
        })
      } catch {
        // Silent retry on next tick
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedConvId])

  useEffect(() => {
    if (!selectedConvId) return
    const echo = getEcho()
    if (!echo) return

    const channel = echo.private(`chat.room.${selectedConvId}`)
    channel.listen(".message.sent", (data: any) => {
      const newMsg = buildIncomingMessage(data)
      if (!newMsg) return

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId ? { ...c, lastMessage: newMsg, updatedAt: "Just now" } : c
        )
      )
    })

    return () => {
      echo.leave(`chat.room.${selectedConvId}`)
    }
  }, [selectedConvId])

  const currentUser: ChatParticipant = {
    id: user?.id?.toString() || "buyer-1",
    name: user?.name || "Buyer",
    role: "buyer",
    company: user?.company,
    avatar: user?.avatar
  }

  const handleSendMessage = async (text: string) => {
    if (!selectedConvId) return

    const sentMsg = await sendMessage(selectedConvId, text)
    if (sentMsg) {
      setMessages(prev => [...prev, sentMsg])
      setConversations(prev => prev.map(c => 
        c.id === selectedConvId 
          ? { ...c, lastMessage: sentMsg, updatedAt: "Just now" } 
          : c
      ))
    }
  }

  const handleSelectConversation = async (conv: ChatConversation) => {
    setSelectedConvId(conv.id)
    
    if (conv.unreadCount > 0) {
      const success = await markAsRead(conv.id)
      if (success) {
        setConversations(prev => prev.map(c => 
          c.id === conv.id ? { ...c, unreadCount: 0 } : c
        ))
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-120px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-120px)] w-full max-w-full">
      <ChatView
        conversations={conversations}
        messages={messages}
        currentUser={currentUser}
        onSelectConversation={handleSelectConversation}
        onSendMessage={handleSendMessage}
        selectedConversationId={selectedConvId}
        isLoading={isMessagesLoading}
      />
    </div>
  )
}
