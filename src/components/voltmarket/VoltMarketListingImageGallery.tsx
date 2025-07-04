import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  caption?: string;
  sort_order: number;
  created_at: string;
}

interface VoltMarketListingImageGalleryProps {
  listingId: string;
}

export const VoltMarketListingImageGallery: React.FC<VoltMarketListingImageGalleryProps> = ({ listingId }) => {
  const [images, setImages] = useState<ListingImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('voltmarket_listing_images')
        .select('*')
        .eq('listing_id', listingId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [listingId]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
            <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No images available</p>
            <p className="text-gray-400 text-sm">Images will appear here once uploaded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* Main Image */}
            <div className="relative h-96 mb-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={images[currentImageIndex]?.image_url}
                alt={images[currentImageIndex]?.caption || `Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Zoom Button */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => setShowModal(true)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Caption */}
            {images[currentImageIndex]?.caption && (
              <p className="text-gray-600 text-center mb-4">
                {images[currentImageIndex].caption}
              </p>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || `Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Screen Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-6xl max-h-full p-4">
            <img
              src={images[currentImageIndex]?.image_url}
              alt={images[currentImageIndex]?.caption || `Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Navigation in modal */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="secondary"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Close button */}
            <Button
              variant="secondary"
              className="absolute top-4 right-4"
              onClick={() => setShowModal(false)}
            >
              ✕
            </Button>

            {/* Counter in modal */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};