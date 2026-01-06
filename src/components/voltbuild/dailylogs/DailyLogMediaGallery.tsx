import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Image, Plus, Upload, X } from 'lucide-react';
import { useDailyLogMedia } from './hooks/useDailyLogs';
import { DailyLogMedia } from '../types/voltbuild-phase3.types';

interface DailyLogMediaGalleryProps {
  dailyLogId: string;
  projectId: string;
}

export function DailyLogMediaGallery({ dailyLogId, projectId }: DailyLogMediaGalleryProps) {
  const { media, isLoading, addMedia, deleteMedia, isAdding } = useDailyLogMedia(dailyLogId);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newMedia, setNewMedia] = useState({ url: '', caption: '', type: 'photo' as const });

  const handleUpload = async () => {
    if (!newMedia.url) return;
    await addMedia({
      daily_log_id: dailyLogId,
      file_url: newMedia.url,
      caption: newMedia.caption,
      type: newMedia.type,
    });
    setNewMedia({ url: '', caption: '', type: 'photo' });
    setIsUploadOpen(false);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading media...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Photos & Documents
        </h3>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Photo or Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image/Document URL</Label>
                <Input
                  placeholder="https://..."
                  value={newMedia.url}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, url: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a URL to an image or document. File upload coming soon.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Caption (optional)</Label>
                <Input
                  placeholder="Describe this photo..."
                  value={newMedia.caption}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, caption: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!newMedia.url || isAdding}>
                  <Upload className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {media.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Image className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No photos or documents yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add photos to document site progress
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                {item.type === 'photo' ? (
                  <img
                    src={item.file_url}
                    alt={item.caption || 'Site photo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              {item.caption && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{item.caption}</p>
              )}
              <button
                onClick={() => deleteMedia(item.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
