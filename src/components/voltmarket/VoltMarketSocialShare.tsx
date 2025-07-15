import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Facebook, Linkedin, MessageCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoltMarketSocialShareProps {
  listingId: string;
  title: string;
  description: string;
  price: string;
  location: string;
  powerCapacity?: number;
  imageUrl?: string;
}

export const VoltMarketSocialShare: React.FC<VoltMarketSocialShareProps> = ({
  listingId,
  title,
  description,
  price,
  location,
  powerCapacity,
  imageUrl
}) => {
  const { toast } = useToast();
  const currentUrl = window.location.href;
  
  // Set up meta tags for social sharing
  useEffect(() => {
    const cleanDescription = description.replace(/\n/g, ' ').substring(0, 160);
    const shareTitle = `${title} - ${price}`;
    const shareDescription = `${cleanDescription}${powerCapacity ? ` | ${powerCapacity}MW` : ''} | ${location}`;
    
    // Ensure we have a full URL for the image
    const fullImageUrl = imageUrl ? 
      (imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`) : 
      null;
    
    // Update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const updateNameMetaTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    // Open Graph tags
    updateMetaTag('og:title', shareTitle);
    updateMetaTag('og:description', shareDescription);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', 'article');
    updateMetaTag('og:site_name', 'VoltMarket');
    
    if (fullImageUrl) {
      updateMetaTag('og:image', fullImageUrl);
      updateMetaTag('og:image:alt', title);
      updateMetaTag('og:image:width', '1200');
      updateMetaTag('og:image:height', '630');
      updateMetaTag('og:image:type', 'image/jpeg');
    }

    // Twitter Card tags
    updateNameMetaTag('twitter:card', 'summary_large_image');
    updateNameMetaTag('twitter:title', shareTitle);
    updateNameMetaTag('twitter:description', shareDescription);
    updateNameMetaTag('twitter:site', '@VoltMarket');
    
    if (fullImageUrl) {
      updateNameMetaTag('twitter:image', fullImageUrl);
      updateNameMetaTag('twitter:image:alt', title);
    }

    // LinkedIn specific
    updateMetaTag('og:locale', 'en_US');
    
    // Force refresh of social media crawlers by updating the page title
    document.title = shareTitle;
    
    return () => {
      // Cleanup function to remove meta tags when component unmounts
      const tags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
      tags.forEach(tag => {
        if (tag.getAttribute('property')?.startsWith('og:') || 
            tag.getAttribute('name')?.startsWith('twitter:')) {
          tag.remove();
        }
      });
    };
  }, [title, description, price, location, powerCapacity, imageUrl, currentUrl]);

  const shareText = `Check out this ${title} listing on VoltMarket - ${price}${powerCapacity ? ` | ${powerCapacity}MW` : ''} | ${location}`;

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`;
    window.open(url, '_blank');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link Copied",
        description: "The listing link has been copied to your clipboard."
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: currentUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share this listing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFacebookShare}
            className="flex items-center gap-2"
          >
            <Facebook className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLinkedInShare}
            className="flex items-center gap-2"
          >
            <Linkedin className="w-4 h-4 text-blue-700" />
            <span className="hidden sm:inline">LinkedIn</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleTwitterShare}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="hidden sm:inline">X (Twitter)</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </Button>
          
          {navigator.share && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">More</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};