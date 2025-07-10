import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoltMarketAccessRequests } from '@/hooks/useVoltMarketAccessRequests';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, MessageSquare, Clock, FileText, User, Calendar, Building, Loader2 } from 'lucide-react';

interface VoltMarketAccessRequestsProps {
  sellerId: string;
}

export const VoltMarketAccessRequests: React.FC<VoltMarketAccessRequestsProps> = ({ sellerId }) => {
  const { accessRequests, loading, updateAccessRequestStatus, fetchAccessRequests } = useVoltMarketAccessRequests();

  React.useEffect(() => {
    if (sellerId) {
      fetchAccessRequests(sellerId);
    }
  }, [sellerId, fetchAccessRequests]);

  const handleApprove = async (requestId: string) => {
    await updateAccessRequestStatus(requestId, 'approved');
  };

  const handleReject = async (requestId: string) => {
    await updateAccessRequestStatus(requestId, 'rejected');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" />
            Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading access requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = accessRequests.filter(req => req.status === 'pending');
  const approvedRequests = accessRequests.filter(req => req.status === 'approved');
  const rejectedRequests = accessRequests.filter(req => req.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-2xl font-bold text-green-900">{approvedRequests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{rejectedRequests.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Requests List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-xl">Access Requests</span>
            </div>
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {pendingRequests.length} pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accessRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No access requests yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  When buyers request access to your documents, they'll appear here for your review.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {accessRequests.map((request) => (
                <Card key={request.id} className="border border-border/50 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Main Content */}
                      <div className="flex-1 space-y-3">
                        {/* Header with status */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <h4 className="font-semibold text-lg">
                              {request.requester_profile?.company_name || 'Anonymous User'}
                            </h4>
                          </div>
                          <Badge className={getStatusColor(request.status)} variant="secondary">
                            {request.status}
                          </Badge>
                        </div>
                        
                        {/* Listing Info */}
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-sm font-medium mb-1">Requested access to:</p>
                          <p className="font-semibold text-primary">
                            {request.listing?.title}
                          </p>
                        </div>
                        
                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Role:</span>
                            <span className="font-medium">{request.requester_profile?.role}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Requested:</span>
                            <span className="font-medium">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {request.approved_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Processed:</span>
                              <span className="font-medium">
                                {new Date(request.approved_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                        {request.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-600 hover:bg-green-700 text-white w-full"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 w-full"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                        <Link to={`/voltmarket/messages?user=${request.requester_id}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};