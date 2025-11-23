import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, CheckCircle, Trash2, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDashboardCollaboration } from '@/hooks/useDashboardCollaboration';

interface DashboardCommentsProps {
  dashboardId: string;
  widgetId?: string;
}

export function DashboardComments({ dashboardId, widgetId }: DashboardCommentsProps) {
  const { comments, addComment, resolveComment, deleteComment } = useDashboardCollaboration(dashboardId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const filteredComments = widgetId 
    ? comments.filter(c => c.widget_id === widgetId && !c.parent_comment_id)
    : comments.filter(c => !c.parent_comment_id);

  const getReplies = (commentId: string) => {
    return comments.filter(c => c.parent_comment_id === commentId);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    await addComment(newComment, widgetId, [], replyingTo || undefined);
    setNewComment('');
    setReplyingTo(null);
  };

  const getInitials = (email?: string) => {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Comments</CardTitle>
              <CardDescription>
                {widgetId ? 'Widget comments' : 'Dashboard comments'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">{filteredComments.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-2">
          {replyingTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="w-3 h-3" />
              <span>Replying to comment</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... Use @ to mention users"
              className="min-h-[80px]"
            />
            <Button onClick={handleAddComment} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-4">
            {filteredComments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            ) : (
              filteredComments.map(comment => (
                <div key={comment.id} className="space-y-2">
                  <Card className={comment.is_resolved ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(comment.user_email)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {comment.user_name || comment.user_email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            
                            <div className="flex gap-1">
                              {!comment.is_resolved && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setReplyingTo(comment.id)}
                                  >
                                    <Reply className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => resolveComment(comment.id)}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-destructive"
                                onClick={() => deleteComment(comment.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
                          
                          {comment.is_resolved && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Replies */}
                  {getReplies(comment.id).length > 0 && (
                    <div className="ml-12 space-y-2">
                      {getReplies(comment.id).map(reply => (
                        <Card key={reply.id} className="bg-muted/50">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(reply.user_email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-xs">
                                  {reply.user_name || reply.user_email}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {reply.comment_text}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
