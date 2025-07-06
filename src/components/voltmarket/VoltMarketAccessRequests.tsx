import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoltMarketAccessRequests } from '@/hooks/useVoltMarketAccessRequests';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, MessageSquare, Clock, FileText } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <CardTitle>Access Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = accessRequests.filter(req => req.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Access Requests ({pendingRequests.length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {accessRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No access requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accessRequests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(request.status)}
                      <h4 className="font-medium">
                        {request.requester_profile?.company_name || 'Anonymous User'}
                      </h4>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Requested access to: <strong>{request.listing?.title}</strong>
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Role: {request.requester_profile?.role}</span>
                      <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                      {request.approved_at && (
                        <span>Processed: {new Date(request.approved_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                    <Link to={`/voltmarket/messages?user=${request.requester_id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};