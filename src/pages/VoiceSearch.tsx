import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Search, Volume2, Loader2, MessageCircle } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'listing' | 'company' | 'property' | 'document';
  title: string;
  description: string;
  score: number;
  metadata: any;
}

interface VoiceSearchResult {
  transcript: string;
  intent: string;
  entities: string[];
  results: SearchResult[];
  suggestions: string[];
}

export default function VoiceSearch() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchResults, setSearchResults] = useState<VoiceSearchResult | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        processAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your search query clearly",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

      const { data, error } = await supabase.functions.invoke('voice-search-processor', {
        body: { 
          audio: base64Audio,
          action: 'transcribe_and_search'
        }
      });

      if (error) throw error;

      setTranscript(data.transcript);
      setSearchResults(data.searchResult);
      
      // Add to recent searches
      setRecentSearches(prev => [data.transcript, ...prev.slice(0, 4)]);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.searchResult?.results?.length || 0} results`,
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: "Failed to process voice search",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const performTextSearch = async (query: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-search-processor', {
        body: { 
          query,
          action: 'text_search'
        }
      });

      if (error) throw error;

      setTranscript(query);
      setSearchResults(data.searchResult);
      
      // Add to recent searches
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.searchResult?.results?.length || 0} results`,
      });
    } catch (error) {
      console.error('Error performing text search:', error);
      toast({
        title: "Error",
        description: "Failed to perform search",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'listing': return 'bg-blue-100 text-blue-800';
      case 'company': return 'bg-green-100 text-green-800';
      case 'property': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Voice-Powered Search
          </h1>
          <p className="text-muted-foreground">
            Search across all platform data using voice commands or natural language
          </p>
        </div>

        {/* Voice Recording Interface */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`w-20 h-20 rounded-full ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
                
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping"></div>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground mb-4">
                {isRecording 
                  ? "Recording... Click to stop" 
                  : isProcessing 
                    ? "Processing your request..." 
                    : "Click to start voice search"
                }
              </div>
              
              {transcript && (
                <div className="p-4 bg-muted rounded-lg mb-4">
                  <div className="text-sm font-medium mb-2">You said:</div>
                  <div className="text-foreground">{transcript}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => performTextSearch(search)}
                    disabled={isProcessing}
                    className="text-xs"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-6">
            {/* Intent and Entities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Detected Intent</div>
                    <Badge variant="secondary">{searchResults.intent}</Badge>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Extracted Entities</div>
                    <div className="flex flex-wrap gap-1">
                      {searchResults.entities.map((entity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({searchResults.results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {searchResults.results.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.results.map((result) => (
                      <div key={result.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getResultTypeColor(result.type)}>
                              {result.type}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              Score: {(result.score * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold mb-2">{result.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                        
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <span key={key} className="mr-4">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found for your search query.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggestions */}
            {searchResults.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => performTextSearch(suggestion)}
                        disabled={isProcessing}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Voice Search Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Try natural language: "Find solar projects in Texas under 10 million"</p>
            <p>• Use specific terms: "Show me Bitcoin mining facilities with cheap electricity"</p>
            <p>• Ask questions: "What are the best energy rates in Alberta?"</p>
            <p>• Filter by attributes: "Find properties near substations with high capacity"</p>
            <p>• Request analysis: "Analyze companies with high power consumption"</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}