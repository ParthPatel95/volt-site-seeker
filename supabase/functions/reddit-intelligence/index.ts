import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reddit API for social sentiment and discussions (Free)
async function fetchRedditData(subreddit: string = 'energy', query?: string, timeframe: string = 'week') {
  try {
    console.log(`Fetching Reddit data from r/${subreddit}`);
    
    // Reddit JSON API (publicly accessible)
    let url = `https://www.reddit.com/r/${subreddit}.json`;
    const params = new URLSearchParams({
      'limit': '25',
      't': timeframe, // hour, day, week, month, year, all
      'sort': 'hot' // hot, new, top, rising
    });
    
    if (query) {
      // Search within subreddit
      url = `https://www.reddit.com/r/${subreddit}/search.json`;
      params.append('q', query);
      params.append('restrict_sr', 'true');
    }
    
    url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VoltScout Social Intelligence Bot 1.0 (contact@voltscout.com)'
      }
    });

    if (!response.ok) {
      console.error(`Reddit API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const posts = data.data?.children || [];
    
    console.log(`Found ${posts.length} Reddit posts`);
    
    // Process posts for sentiment and relevant data
    const processedPosts = posts.map((post: any) => {
      const postData = post.data;
      return {
        id: postData.id,
        title: postData.title,
        author: postData.author,
        score: postData.score,
        upvote_ratio: postData.upvote_ratio,
        num_comments: postData.num_comments,
        created_utc: postData.created_utc,
        url: `https://reddit.com${postData.permalink}`,
        selftext: postData.selftext || '',
        subreddit: postData.subreddit,
        flair: postData.link_flair_text,
        // Calculate basic sentiment score
        sentiment_score: calculateBasicSentiment(postData.title + ' ' + (postData.selftext || '')),
        engagement_score: postData.score + (postData.num_comments * 2),
        source: 'Reddit'
      };
    });
    
    // Calculate overall sentiment
    const overallSentiment = processedPosts.reduce((acc: number, post: any) => acc + post.sentiment_score, 0) / processedPosts.length;
    
    return {
      success: true,
      subreddit: subreddit,
      query: query,
      timeframe: timeframe,
      post_count: processedPosts.length,
      overall_sentiment: overallSentiment,
      average_score: processedPosts.reduce((acc: number, post: any) => acc + post.score, 0) / processedPosts.length,
      total_engagement: processedPosts.reduce((acc: number, post: any) => acc + post.engagement_score, 0),
      posts: processedPosts,
      source: 'Reddit API'
    };
    
  } catch (error) {
    console.error('Error fetching Reddit data:', error);
    return null;
  }
}

// Basic sentiment analysis function
function calculateBasicSentiment(text: string): number {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful',
    'positive', 'bullish', 'up', 'rise', 'growth', 'profit', 'gain', 'success',
    'efficient', 'reliable', 'clean', 'renewable', 'sustainable', 'innovative'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'fail', 'failure',
    'negative', 'bearish', 'down', 'fall', 'loss', 'decline', 'crash',
    'unreliable', 'dirty', 'pollution', 'expensive', 'outdated', 'problem'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, score / Math.max(1, words.length / 10)));
}

// Multi-subreddit energy sentiment analysis
async function fetchEnergySentiment() {
  try {
    console.log('Fetching energy sector sentiment from multiple subreddits');
    
    const energySubreddits = [
      'energy',
      'solar',
      'investing',
      'stocks',
      'renewableenergy',
      'electricvehicles'
    ];
    
    const results = [];
    
    for (const subreddit of energySubreddits) {
      const data = await fetchRedditData(subreddit, 'energy OR power OR electricity', 'day');
      if (data) {
        results.push({
          subreddit: subreddit,
          sentiment: data.overall_sentiment,
          post_count: data.post_count,
          average_score: data.average_score,
          total_engagement: data.total_engagement
        });
      }
    }
    
    const overallSentiment = results.reduce((acc, r) => acc + r.sentiment, 0) / results.length;
    const totalPosts = results.reduce((acc, r) => acc + r.post_count, 0);
    const totalEngagement = results.reduce((acc, r) => acc + r.total_engagement, 0);
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      overall_sentiment: overallSentiment,
      sentiment_label: overallSentiment > 0.1 ? 'Positive' : overallSentiment < -0.1 ? 'Negative' : 'Neutral',
      total_posts_analyzed: totalPosts,
      total_engagement: totalEngagement,
      subreddit_breakdown: results,
      source: 'Reddit Multi-Subreddit Analysis'
    };
    
  } catch (error) {
    console.error('Error in energy sentiment analysis:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Processing Reddit intelligence action: ${action}`);

    let result;
    
    switch (action) {
      case 'fetch_subreddit_data':
        result = await fetchRedditData(
          params.subreddit || 'energy',
          params.query,
          params.timeframe || 'week'
        );
        break;
        
      case 'analyze_energy_sentiment':
        result = await fetchEnergySentiment();
        break;
        
      case 'search_energy_discussions':
        result = await fetchRedditData(
          'energy',
          params.company_name || params.query || 'renewable energy',
          params.timeframe || 'week'
        );
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!result) {
      throw new Error('Failed to fetch Reddit data');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in reddit-intelligence function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});