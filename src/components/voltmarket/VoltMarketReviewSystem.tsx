
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketReviews } from '@/hooks/useVoltMarketReviews';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { Star, TrendingUp, Shield, CheckCircle, User } from 'lucide-react';

interface ReviewSystemProps {
  userId: string;
  listingId?: string;
  allowReview?: boolean;
}

export const VoltMarketReviewSystem: React.FC<ReviewSystemProps> = ({ 
  userId, 
  listingId, 
  allowReview = false 
}) => {
  const { profile } = useVoltMarketAuth();
  const { loading, createReview, getReviewsForUser, getReviewStats } = useVoltMarketReviews();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    review_text: '',
    transaction_verified: false
  });

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [userId]);

  const fetchReviews = async () => {
    const { data, error } = await getReviewsForUser(userId);
    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
  };

  const fetchReviewStats = async () => {
    const { data, error } = await getReviewStats(userId);
    if (error) {
      console.error('Error fetching review stats:', error);
    } else {
      setReviewStats(data);
    }
  };

  const handleSubmitReview = async () => {
    if (!profile || !listingId || newReview.rating === 0) {
      toast({
        title: "Invalid Review",
        description: "Please provide a rating",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await createReview({
      listing_id: listingId,
      reviewed_user_id: userId,
      rating: newReview.rating,
      review_text: newReview.review_text || undefined,
      transaction_verified: newReview.transaction_verified
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback"
      });
      setShowReviewForm(false);
      setNewReview({ rating: 0, review_text: '', transaction_verified: false });
      fetchReviews();
      fetchReviewStats();
    }
  };

  const renderStarRating = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Review Stats Overview */}
      {reviewStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Review Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {reviewStats.average_rating.toFixed(1)}
                </div>
                <div className="flex justify-center mt-1">
                  {renderStarRating(Math.round(reviewStats.average_rating))}
                </div>
                <p className="text-sm text-gray-600 mt-1">Average Rating</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {reviewStats.total_reviews}
                </div>
                <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Rating Distribution</p>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviewStats.rating_distribution[rating] || 0;
                  const percentage = reviewStats.total_reviews > 0 
                    ? (count / reviewStats.total_reviews) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {allowReview && profile && profile.user_id !== userId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Leave a Review</span>
              {!showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Write Review
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          {showReviewForm && (
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                {renderStarRating(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <Textarea
                  placeholder="Share your experience..."
                  value={newReview.review_text}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review_text: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="transaction-verified"
                  checked={newReview.transaction_verified}
                  onChange={(e) => setNewReview(prev => ({ 
                    ...prev, 
                    transaction_verified: e.target.checked 
                  }))}
                />
                <label htmlFor="transaction-verified" className="text-sm text-gray-700">
                  This review is based on a completed transaction
                </label>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmitReview} 
                  disabled={loading || newReview.rating === 0}
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>No reviews yet</p>
              <p className="text-sm">Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.reviewer.profile_image_url || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {review.reviewer.company_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.reviewer.company_name || 'Anonymous'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStarRating(review.rating)}
                            {review.transaction_verified && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      
                      {review.review_text && (
                        <p className="text-gray-700 mt-2">{review.review_text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
