'use client';

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import ChatMessage from "@/components/ChatMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search, Loader2, Trash2, UserPlus, MessageCircle, Users, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversations, useConversation, useSendMessage, useMarkMessagesAsRead, useGetOrCreateConversation, useDeleteConversation } from "@/hooks/use-chat";
import { useAllUsers, useSendConnectionRequest, useUpdateConnectionRequest, useCancelConnectionRequest } from "@/hooks/use-connections";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import type { Message, Conversation } from "@/lib/api/chat";
import type { User } from "@/lib/api/connections";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'conversations' | 'users'>('conversations');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [showChatView, setShowChatView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: isLoadingConversations } = useConversations();
  const { data: selectedConversation, isLoading: isLoadingConversation } = useConversation(selectedConversationId);
  const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useAllUsers(userSearchQuery || undefined);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();
  const getOrCreateConversationMutation = useGetOrCreateConversation();
  const deleteConversationMutation = useDeleteConversation();
  const sendConnectionRequestMutation = useSendConnectionRequest();
  const updateConnectionRequestMutation = useUpdateConnectionRequest();
  const cancelConnectionRequestMutation = useCancelConnectionRequest();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId && selectedConversation) {
      markAsReadMutation.mutate(selectedConversationId);
    }
  }, [selectedConversationId, selectedConversation]);

  // Auto-select first conversation if available (only on desktop)
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId && activeTab === 'conversations') {
      // Only auto-select on desktop (md and above)
      if (window.innerWidth >= 768) {
        setSelectedConversationId(conversations[0]._id);
      }
    }
  }, [conversations, selectedConversationId, activeTab]);

  // Reset chat view when conversation is deselected on mobile
  useEffect(() => {
    if (!selectedConversationId) {
      setShowChatView(false);
    }
  }, [selectedConversationId]);

  // Socket.IO real-time message handling
  useEffect(() => {
    if (!socket) return;

    // Join conversation room when a conversation is selected
    if (selectedConversationId) {
      socket.emit('join_conversation', selectedConversationId);
    }

    // Listen for new messages
    const handleNewMessage = (data: { conversationId: string; message: Message }) => {
      // If this message is for the currently selected conversation, update it
      if (data.conversationId === selectedConversationId) {
        // Invalidate and refetch the conversation to get the new message
        queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      }
      
      // Always update conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    // Listen for conversation updates
    const handleConversationUpdate = (data: { conversationId: string; lastMessage: Conversation['lastMessage'] }) => {
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // If this is the selected conversation, update it too
      if (data.conversationId === selectedConversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_updated', handleConversationUpdate);

    return () => {
      if (selectedConversationId) {
        socket.emit('leave_conversation', selectedConversationId);
      }
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_updated', handleConversationUpdate);
    };
  }, [socket, selectedConversationId, queryClient]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversationId) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        content: message.trim(),
      });
      setMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    try {
      await deleteConversationMutation.mutateAsync(conversationToDelete);
      if (selectedConversationId === conversationToDelete) {
        setSelectedConversationId(null);
        setShowChatView(false);
      }
      setShowDeleteDialog(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      const conversation = await getOrCreateConversationMutation.mutateAsync(userId);
      setSelectedConversationId(conversation._id);
      setActiveTab('conversations');
      setShowChatView(true);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleSendConnectionRequest = async (userId: string) => {
    try {
      await sendConnectionRequestMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  const handleAcceptConnectionRequest = async (requestId: string) => {
    try {
      await updateConnectionRequestMutation.mutateAsync({ requestId, status: 'accepted' });
    } catch (error) {
      console.error('Failed to accept connection request:', error);
    }
  };

  const handleRejectConnectionRequest = async (requestId: string) => {
    try {
      await updateConnectionRequestMutation.mutateAsync({ requestId, status: 'rejected' });
    } catch (error) {
      console.error('Failed to reject connection request:', error);
    }
  };

  const handleCancelConnectionRequest = async (requestId: string) => {
    try {
      await cancelConnectionRequestMutation.mutateAsync(requestId);
    } catch (error) {
      console.error('Failed to cancel connection request:', error);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations?.filter((conv) =>
    conv.otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherParticipant.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const otherParticipant = selectedConversation?.otherParticipant;
  const messages = selectedConversation?.messages || [];

  const getConnectionStatus = (user: User) => {
    if (!user.connectionStatus) return null;
    return user.connectionStatus;
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="pt-16 h-[calc(100vh-4rem)] flex overflow-hidden">
        {/* Sidebar with Conversations and Users */}
        <div className={`w-full md:w-80 lg:w-96 border-r bg-card/30 flex flex-col transition-transform duration-300 ${
          showChatView ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-3 md:p-4 border-b">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'conversations' | 'users')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2 md:mb-3 h-9 md:h-10">
                <TabsTrigger value="conversations" className="text-xs md:text-sm">Messages</TabsTrigger>
                <TabsTrigger value="users" className="text-xs md:text-sm">
                  <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conversations" className="mt-0">
                <div className="relative">
                  <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-8 md:pl-10 text-sm md:text-base h-9 md:h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-chats"
                  />
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <div className="relative">
                  <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="pl-8 md:pl-10 text-sm md:text-base h-9 md:h-10"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'conversations' ? (
              <>
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center p-6 md:p-8">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 md:p-8 text-center text-muted-foreground text-sm md:text-base">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => {
                        setSelectedConversationId(conversation._id);
                        setShowChatView(true);
                      }}
                      className={`p-3 md:p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors active:bg-accent/70 ${
                        selectedConversationId === conversation._id ? "bg-accent/50" : ""
                      }`}
                      data-testid={`contact-${conversation._id}`}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="w-10 h-10 md:w-12 md:h-12">
                            <AvatarFallback className="text-xs md:text-sm">
                              {conversation.otherParticipant.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5 md:mb-1 gap-2">
                            <h3 className="font-semibold text-xs md:text-sm truncate">
                              {conversation.otherParticipant.name}
                            </h3>
                            {conversation.lastMessage?.createdAt && (
                              <span className="text-[10px] md:text-xs text-muted-foreground shrink-0">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground mb-1 truncate">
                            {conversation.otherParticipant.specialization || conversation.otherParticipant.userType}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs md:text-sm text-muted-foreground truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="ml-2 bg-primary text-primary-foreground text-[10px] md:text-xs shrink-0">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center p-6 md:p-8">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : usersError ? (
                  <div className="p-6 md:p-8 text-center text-destructive text-sm md:text-base">
                    Error loading users: {usersError instanceof Error ? usersError.message : 'Unknown error'}
                  </div>
                ) : allUsers && Array.isArray(allUsers) && allUsers.length > 0 ? (
                  allUsers.map((userItem) => {
                    const connectionStatus = getConnectionStatus(userItem);
                    return (
                      <div
                        key={userItem._id}
                        className="p-3 md:p-4 border-b hover:bg-accent/50 transition-colors active:bg-accent/70"
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 shrink-0">
                            <AvatarFallback className="text-xs md:text-sm">
                              {userItem.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs md:text-sm truncate">{userItem.name}</h3>
                            <p className="text-[10px] md:text-xs text-muted-foreground truncate mb-1">{userItem.email}</p>
                            <div className="flex items-center gap-1.5 md:gap-2 mb-2 flex-wrap">
                              {userItem.specialization && (
                                <Badge variant="secondary" className="text-[10px] md:text-xs">
                                  {userItem.specialization}
                                </Badge>
                              )}
                              {userItem.userType && (
                                <Badge variant="outline" className="text-[10px] md:text-xs">
                                  {userItem.userType}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1.5 md:gap-2 mt-2">
                              {connectionStatus?.status === 'accepted' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs md:text-sm h-8 md:h-9"
                                  onClick={() => handleStartChat(userItem._id)}
                                  disabled={getOrCreateConversationMutation.isPending}
                                >
                                  {getOrCreateConversationMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                      <span className="hidden sm:inline">Message</span>
                                      <span className="sm:hidden">Msg</span>
                                    </>
                                  )}
                                </Button>
                              ) : connectionStatus?.status === 'pending' ? (
                                connectionStatus.isRequester ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs md:text-sm h-8 md:h-9"
                                    onClick={() => handleCancelConnectionRequest(connectionStatus.requestId)}
                                    disabled={cancelConnectionRequestMutation.isPending}
                                  >
                                    {cancelConnectionRequestMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                        <span className="hidden sm:inline">Pending</span>
                                        <span className="sm:hidden">Pending</span>
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <div className="flex gap-1.5 md:gap-2 flex-1">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="flex-1 text-xs md:text-sm h-8 md:h-9"
                                      onClick={() => handleAcceptConnectionRequest(connectionStatus.requestId)}
                                      disabled={updateConnectionRequestMutation.isPending}
                                    >
                                      {updateConnectionRequestMutation.isPending ? (
                                        <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                                      ) : (
                                        'Accept'
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs md:text-sm h-8 md:h-9"
                                      onClick={() => handleRejectConnectionRequest(connectionStatus.requestId)}
                                      disabled={updateConnectionRequestMutation.isPending}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                )
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs md:text-sm h-8 md:h-9"
                                    onClick={() => handleStartChat(userItem._id)}
                                    disabled={getOrCreateConversationMutation.isPending}
                                  >
                                    {getOrCreateConversationMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                        <span className="hidden sm:inline">Message</span>
                                        <span className="sm:hidden">Msg</span>
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 text-xs md:text-sm h-8 md:h-9"
                                    onClick={() => handleSendConnectionRequest(userItem._id)}
                                    disabled={sendConnectionRequestMutation.isPending}
                                  >
                                    {sendConnectionRequestMutation.isPending ? (
                                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                        <span className="hidden sm:inline">Connect</span>
                                        <span className="sm:hidden">Connect</span>
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 md:p-8 text-center text-muted-foreground text-sm md:text-base">
                    {userSearchQuery ? 'No users found' : 'No users available'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col ${showChatView ? 'flex' : 'hidden md:flex'}`}>
          {selectedConversationId ? (
            <>
              <div className="p-3 md:p-4 border-b bg-card/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowChatView(false)}
                      className="md:hidden shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Avatar className="w-9 h-9 md:w-10 md:h-10 shrink-0">
                      <AvatarFallback>
                        {otherParticipant?.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm md:text-base truncate">{otherParticipant?.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {otherParticipant?.specialization || otherParticipant?.userType}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setConversationToDelete(selectedConversationId);
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-background">
                {isLoadingConversation ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto w-full">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8 px-4">
                        <p className="text-sm md:text-base">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isSent = msg.senderId === user?.id;
                        return (
                          <ChatMessage
                            key={msg._id}
                            message={msg.content}
                            senderName={msg.senderName || 'Unknown'}
                            timestamp={formatMessageTime(msg.createdAt)}
                            isSent={isSent}
                          />
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-2 md:p-4 border-t bg-card/30">
                <form onSubmit={handleSend} className="flex gap-2 md:gap-3">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 text-sm md:text-base"
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={sendMessageMutation.isPending || !message.trim()}
                    data-testid="button-send"
                    className="shrink-0"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background hidden md:flex">
              <div className="text-center text-muted-foreground px-4">
                <p className="text-base md:text-lg mb-2">Select a conversation to start chatting</p>
                <p className="text-xs md:text-sm">Or start a new conversation with a user</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConversationMutation.isPending}
            >
              {deleteConversationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
