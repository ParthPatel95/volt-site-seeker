import { useEffect } from 'react';

interface PageMetaData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export const usePageMeta = (meta: PageMetaData) => {
  useEffect(() => {
    // Update document title
    document.title = meta.title;
    
    // Update or create meta tags
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

    // Update basic meta tags
    updateNameMetaTag('description', meta.description);
    
    // Update Open Graph tags
    updateMetaTag('og:title', meta.title);
    updateMetaTag('og:description', meta.description);
    updateMetaTag('og:type', meta.type || 'website');
    
    if (meta.url) {
      updateMetaTag('og:url', meta.url);
    }
    
    if (meta.image) {
      const fullImageUrl = meta.image.startsWith('http') 
        ? meta.image 
        : `${window.location.origin}${meta.image}`;
      console.log('Setting og:image meta tag with URL:', fullImageUrl);
      updateMetaTag('og:image', fullImageUrl);
      updateMetaTag('og:image:width', '1200');
      updateMetaTag('og:image:height', '630');
      updateMetaTag('og:image:type', 'image/jpeg');
      
      // Update Twitter tags
      updateNameMetaTag('twitter:card', 'summary_large_image');
      updateNameMetaTag('twitter:image', fullImageUrl);
      
      // Add additional meta tags that WhatsApp might look for
      updateMetaTag('og:image:secure_url', fullImageUrl);
    }
    
    updateNameMetaTag('twitter:title', meta.title);
    updateNameMetaTag('twitter:description', meta.description);
    
  }, [meta.title, meta.description, meta.image, meta.url, meta.type]);
};