import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Annotation {
  id: string;
  x: number;
  value: number;
  label: string;
  color: string;
}

interface AnnotatedDataChartProps {
  config: any;
}

export function AnnotatedDataChart({ config }: AnnotatedDataChartProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: '1', x: 25, value: 100, label: 'Peak Demand', color: 'hsl(0, 84%, 60%)' },
    { id: '2', x: 40, value: 50, label: 'Low Price Period', color: 'hsl(142, 71%, 45%)' }
  ]);
  const [newAnnotation, setNewAnnotation] = useState({ x: 0, value: 0, label: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['annotated-chart-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, ail_mw')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data?.reverse().map((d, idx) => ({ ...d, index: idx }));
    }
  });

  const addAnnotation = () => {
    if (!newAnnotation.label) return;
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      x: newAnnotation.x,
      value: newAnnotation.value,
      label: newAnnotation.label,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    
    setAnnotations([...annotations, annotation]);
    setNewAnnotation({ x: 0, value: 0, label: '' });
    setDialogOpen(false);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[400px]">Loading...</div>;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Annotated Data Analysis</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Annotation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Chart Annotation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <Input
                  placeholder="e.g., Peak Demand Event"
                  value={newAnnotation.label}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, label: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">X Position</label>
                  <Input
                    type="number"
                    value={newAnnotation.x}
                    onChange={(e) => setNewAnnotation({ ...newAnnotation, x: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Y Value</label>
                  <Input
                    type="number"
                    value={newAnnotation.value}
                    onChange={(e) => setNewAnnotation({ ...newAnnotation, value: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={addAnnotation} className="w-full">
                Add Annotation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {annotations.map(ann => (
          <div 
            key={ann.id}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs border"
            style={{ borderColor: ann.color }}
          >
            <MessageSquare className="h-3 w-3" style={{ color: ann.color }} />
            <span>{ann.label}</span>
            <button
              onClick={() => removeAnnotation(ann.id)}
              className="hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <XAxis 
            dataKey="index" 
            stroke="hsl(var(--foreground))"
          />
          <YAxis stroke="hsl(var(--foreground))" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="pool_price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            name="Pool Price"
          />
          {annotations.map(ann => (
            <ReferenceLine
              key={ann.id}
              x={ann.x}
              stroke={ann.color}
              strokeDasharray="3 3"
              strokeWidth={2}
            >
              <Label 
                value={ann.label} 
                position="top" 
                fill={ann.color}
                fontSize={12}
              />
            </ReferenceLine>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
