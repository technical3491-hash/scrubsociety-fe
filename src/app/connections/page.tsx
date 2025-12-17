'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Check, X, Loader2, MessageCircle, AlertCircle } from 'lucide-react';
import {
  useAllUsers,
  useConnectionRequests,
  useConnections,
  useSendConnectionRequest,
  useUpdateConnectionRequest,
  useCancelConnectionRequest,
} from '@/hooks/use-connections';
import { useGetOrCreateConversation } from '@/hooks/use-chat';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const router = useRouter();

  const { data: users, isLoading: isLoadingUsers, error: usersError } = useAllUsers(searchQuery || undefined);
  const { data: sentRequests } = useConnectionRequests('sent');
  const { data: receivedRequests } = useConnectionRequests('received');
  const { data: connections } = useConnections();

  const sendRequestMutation = useSendConnectionRequest();
  const updateRequestMutation = useUpdateConnectionRequest();
  const cancelRequestMutation = useCancelConnectionRequest();
  const getOrCreateConversationMutation = useGetOrCreateConversation();

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequestMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateRequestMutation.mutateAsync({ requestId, status: 'accepted' });
    } catch (error) {
      console.error('Failed to accept connection request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateRequestMutation.mutateAsync({ requestId, status: 'rejected' });
    } catch (error) {
      console.error('Failed to reject connection request:', error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRequestMutation.mutateAsync(requestId);
    } catch (error) {
      console.error('Failed to cancel connection request:', error);
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      const conversation = await getOrCreateConversationMutation.mutateAsync(userId);
      router.push(`/chat?conversation=${conversation._id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const getConnectionStatus = (user: any) => {
    if (!user.connectionStatus) return null;
    return user.connectionStatus;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Connections</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">All Users</TabsTrigger>
              <TabsTrigger value="received">
                Requests
                {receivedRequests && receivedRequests.length > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {receivedRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">Sent Requests</TabsTrigger>
              <TabsTrigger value="connections">My Connections</TabsTrigger>
            </TabsList>

            {/* All Users Tab */}
            <TabsContent value="users" className="mt-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search users by name, email, or specialty..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : usersError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <p className="text-destructive mb-2 font-semibold">Unable to load users</p>
                  <p className="text-sm text-foreground/70 mb-4">
                    {usersError instanceof Error && usersError.message.includes('404')
                      ? 'The users endpoint is not available. Please ensure the backend API is running and the endpoint is implemented.'
                      : usersError instanceof Error 
                      ? usersError.message 
                      : 'An unknown error occurred'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : users && Array.isArray(users) && users.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {users.map((user) => {
                    const connectionStatus = getConnectionStatus(user);
                    return (
                      <div
                        key={user._id}
                        className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{user.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {user.specialization && (
                                <Badge variant="secondary" className="text-xs">
                                  {user.specialization}
                                </Badge>
                              )}
                              {user.userType && (
                                <Badge variant="outline" className="text-xs">
                                  {user.userType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {connectionStatus?.status === 'accepted' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleStartChat(user._id)}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          ) : connectionStatus?.status === 'pending' ? (
                            connectionStatus.isRequester ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleCancelRequest(connectionStatus.requestId)}
                                disabled={cancelRequestMutation.isPending}
                              >
                                {cancelRequestMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            ) : (
                              <div className="flex gap-2 flex-1">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex-1"
                                  onClick={() => handleAcceptRequest(connectionStatus.requestId)}
                                  disabled={updateRequestMutation.isPending}
                                >
                                  {updateRequestMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 mr-2" />
                                      Accept
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectRequest(connectionStatus.requestId)}
                                  disabled={updateRequestMutation.isPending}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )
                          ) : (
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleSendRequest(user._id)}
                              disabled={sendRequestMutation.isPending}
                            >
                              {sendRequestMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Connect
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No users found' : 'No users available'}
                </div>
              )}
            </TabsContent>

            {/* Received Requests Tab */}
            <TabsContent value="received" className="mt-6">
              {receivedRequests && receivedRequests.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {receivedRequests.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {request.requester.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{request.requester.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {request.requester.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {request.requester.specialization && (
                              <Badge variant="secondary" className="text-xs">
                                {request.requester.specialization}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => handleAcceptRequest(request._id)}
                          disabled={updateRequestMutation.isPending}
                        >
                          {updateRequestMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request._id)}
                          disabled={updateRequestMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No pending connection requests
                </div>
              )}
            </TabsContent>

            {/* Sent Requests Tab */}
            <TabsContent value="sent" className="mt-6">
              {sentRequests && sentRequests.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sentRequests.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {request.recipient.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{request.recipient.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {request.recipient.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {request.recipient.specialization && (
                              <Badge variant="secondary" className="text-xs">
                                {request.recipient.specialization}
                              </Badge>
                            )}
                            <Badge
                              variant={
                                request.status === 'pending'
                                  ? 'default'
                                  : request.status === 'accepted'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className="text-xs"
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleCancelRequest(request._id)}
                            disabled={cancelRequestMutation.isPending}
                          >
                            {cancelRequestMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Cancel Request
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No sent connection requests
                </div>
              )}
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="mt-6">
              {connections && connections.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {connections.map((connection) => (
                    <div
                      key={connection._id}
                      className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {connection.otherUser.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{connection.otherUser.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {connection.otherUser.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {connection.otherUser.specialization && (
                              <Badge variant="secondary" className="text-xs">
                                {connection.otherUser.specialization}
                              </Badge>
                            )}
                            {connection.otherUser.userType && (
                              <Badge variant="outline" className="text-xs">
                                {connection.otherUser.userType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Connected {formatDistanceToNow(new Date(connection.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleStartChat(connection.otherUser._id)}
                          disabled={getOrCreateConversationMutation.isPending}
                        >
                          {getOrCreateConversationMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Start Chat
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No connections yet. Start connecting with other users!
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

