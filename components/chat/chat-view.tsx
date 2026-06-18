"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Send, MoreVertical, ArrowLeft, MessageSquare, User, Factory, Globe, CheckCircle, X, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChatProductCard } from "./chat-product-card"

export interface ChatProductReference {
  name: string
  images?: string[]
  description?: string
  minOrder?: string | number
  price?: string
  url: string
}

export interface ChatParticipant {
  id: string
  name: string
  avatar?: string
  role: "buyer" | "manufacturer" | "admin"
  company?: string
  country?: string
}

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  timestamp: string
  isRead: boolean
}

export interface ChatConversation {
  id: string
  participants: ChatParticipant[]
  lastMessage?: ChatMessage
  unreadCount: number
  updatedAt: string
}

interface ChatViewProps {
  conversations: ChatConversation[]
  messages: ChatMessage[]
  currentUser: ChatParticipant
  onSelectConversation: (conversation: ChatConversation) => void
  onSendMessage: (text: string) => void
  selectedConversationId?: string
  isLoading?: boolean
  initialMessage?: string
  initialProductRef?: ChatProductReference | null
}

export function ChatView({
  conversations,
  messages,
  currentUser,
  onSelectConversation,
  onSendMessage,
  selectedConversationId,
  isLoading = false,
  initialMessage = "",
  initialProductRef = null
}: ChatViewProps) {
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState(initialMessage)
  const [productRef, setProductRef] = useState<ChatProductReference | null>(initialProductRef)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialMessage) {
      setNewMessage(initialMessage)
    }
  }, [initialMessage, selectedConversationId])

  useEffect(() => {
    if (initialProductRef) {
      setProductRef(initialProductRef)
    }
  }, [initialProductRef, selectedConversationId])

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  const otherParticipant = selectedConversation?.participants.find(p => p.id !== currentUser.id)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const filteredConversations = conversations.filter(c => {
    const other = c.participants.find(p => p.id !== currentUser.id)
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           other?.company?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleSend = () => {
    let finalMessage = newMessage
    if (productRef) {
      const img = productRef.images?.[0] || ""
      const desc = productRef.description || ""
      const refText = `[Product Reference: ${productRef.name}]\nLink: ${productRef.url}\nImage: ${img}\nDesc: ${desc}\n\n`
      finalMessage = refText + finalMessage
    }

    if (finalMessage.trim()) {
      onSendMessage(finalMessage)
      setNewMessage("")
      setProductRef(null)
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Sidebar */}
      <div className={cn(
        "flex h-full w-full flex-col border-r border-border md:w-80 lg:w-96",
        !showSidebar && "hidden md:flex"
      )}>
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {filteredConversations.map((conv) => {
            const other = conv.participants.find(p => p.id !== currentUser.id)
            const isActive = conv.id === selectedConversationId
            return (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv)
                  setShowSidebar(false)
                }}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all",
                  isActive ? "bg-secondary/10 shadow-sm" : "hover:bg-muted/50"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={other?.avatar} alt={other?.name} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {other?.role === "manufacturer" ? <Factory className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-sm font-semibold truncate",
                      conv.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {other?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {conv.updatedAt}
                    </span>
                  </div>
                  {other?.company && (
                    <p className="text-xs text-muted-foreground truncate">{other.company}</p>
                  )}
                  <p className={cn(
                    "mt-1 text-xs truncate",
                    conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {conv.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex h-full flex-1 flex-col min-w-0",
        showSidebar && "hidden md:flex"
      )}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-card/50 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3 min-w-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden -ml-2"
                  onClick={() => setShowSidebar(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 border border-border shrink-0">
                  <AvatarImage src={otherParticipant?.avatar} />
                  <AvatarFallback className="bg-muted">
                    {otherParticipant?.role === "manufacturer" ? <Factory className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">{otherParticipant?.name}</span>
                    {otherParticipant?.role === "manufacturer" && (
                      <Badge variant="secondary" className="h-5 px-1 text-[10px] bg-emerald-100 text-emerald-700">
                        <CheckCircle className="mr-0.5 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {otherParticipant?.company && <span className="truncate">{otherParticipant.company}</span>}
                    {otherParticipant?.country && (
                      <>
                        <span className="shrink-0">•</span>
                        <span className="flex items-center gap-0.5 truncate">
                          <Globe className="h-3 w-3" />
                          {otherParticipant.country}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scroll-smooth"
            >
              {messages.map((msg, index) => {
                const isMine = msg.senderId === currentUser.id
                
                // Parse Product Reference
                let productRefMatch = null;
                let actualText = msg.text;
                
                const newRefRegex = /^\[Product Reference: (.*?)\]\nLink: (.*?)\nImage: (.*?)\nDesc: (.*?)\n\n([\s\S]*)$/;
                const oldRefRegex = /^\[Product Reference: (.*?)\]\nLink: (.*?)\n\n([\s\S]*)$/;
                
                const newMatch = msg.text.match(newRefRegex);
                if (newMatch) {
                  productRefMatch = { name: newMatch[1], url: newMatch[2], image: newMatch[3], desc: newMatch[4] };
                  actualText = newMatch[5];
                } else {
                  const oldMatch = msg.text.match(oldRefRegex);
                  if (oldMatch) {
                    productRefMatch = { name: oldMatch[1], url: oldMatch[2], image: "", desc: "" };
                    actualText = oldMatch[3];
                  }
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300",
                      isMine ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      isMine 
                        ? "bg-secondary text-secondary-foreground rounded-tr-none" 
                        : "bg-card border border-border text-foreground rounded-tl-none"
                    )}>
                      {productRefMatch ? (
                        <div className="flex flex-col gap-2.5">
                          <ChatProductCard 
                            name={productRefMatch.name} 
                            url={productRefMatch.url} 
                            fallbackImage={productRefMatch.image} 
                            fallbackDesc={productRefMatch.desc} 
                            isMine={isMine} 
                          />
                          <div className="whitespace-pre-wrap">{actualText}</div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 bg-card">
              <div className="flex flex-col rounded-md border border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden transition-colors">
                {productRef && (
                  <div className="border-b border-border bg-muted/30 p-3">
                    <div className="group relative flex items-start gap-4 rounded-lg border border-border/50 bg-background p-3 shadow-sm transition-all hover:border-border hover:shadow-md">
                      <button 
                        type="button" 
                        onClick={() => setProductRef(null)}
                        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Remove product reference"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        {productRef.images && productRef.images[0] ? (
                          <img
                            src={productRef.images[0]}
                            alt={productRef.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center py-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Product Reference</span>
                        <h4 className="font-medium text-foreground line-clamp-1 pr-6 text-sm">{productRef.name}</h4>
                        {productRef.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{productRef.description}</p>
                        )}
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                          {productRef.minOrder && (
                            <span>Min. Order: {productRef.minOrder}</span>
                          )}
                          {productRef.price && (
                             <span className="font-medium text-foreground">
                               {productRef.price}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="relative flex-1 bg-muted/30">
                  <Textarea
                    placeholder="Type a message..."
                    className="pr-12 border-none focus-visible:ring-0 min-h-[60px] py-3 resize-none bg-transparent"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 transition-all",
                      newMessage.trim() || productRef ? "bg-secondary text-secondary-foreground scale-100" : "bg-muted text-muted-foreground scale-90"
                    )}
                    onClick={handleSend}
                    disabled={!newMessage.trim() && !productRef}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
              <MessageSquare className="h-10 w-10 text-secondary" />
            </div>
            <h3 className="text-xl font-serif font-medium text-foreground">Your Messages</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Select a conversation from the list to start messaging with buyers and manufacturers.
            </p>
            <Button variant="outline" className="mt-6 border-secondary text-secondary hover:bg-secondary/10 md:hidden" onClick={() => setShowSidebar(true)}>
              View Conversations
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
