// Test utility to check social sharing meta tags
export const testSocialShareMeta = () => {
  console.log('=== Social Share Meta Tags Test ===');
  
  // Check for Open Graph tags
  const ogTags = [
    'og:title',
    'og:description', 
    'og:image',
    'og:url',
    'og:type',
    'og:site_name'
  ];
  
  ogTags.forEach(tag => {
    const element = document.querySelector(`meta[property="${tag}"]`) as HTMLMetaElement;
    if (element) {
      console.log(`✅ ${tag}: ${element.content}`);
    } else {
      console.log(`❌ Missing: ${tag}`);
    }
  });
  
  // Check for Twitter Card tags
  const twitterTags = [
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image'
  ];
  
  twitterTags.forEach(tag => {
    const element = document.querySelector(`meta[name="${tag}"]`) as HTMLMetaElement;
    if (element) {
      console.log(`✅ ${tag}: ${element.content}`);
    } else {
      console.log(`❌ Missing: ${tag}`);
    }
  });
  
  console.log('=== End Test ===');
};

// Make it available globally for testing
(window as any).testSocialShare = testSocialShareMeta;