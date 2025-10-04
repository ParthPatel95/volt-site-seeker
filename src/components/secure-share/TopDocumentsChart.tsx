import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TopDocumentsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['top-documents'],
    queryFn: async () => {
      const { data: activity, error } = await supabase
        .from('viewer_activity')
        .select(`
          document_id,
          document:secure_documents(file_name)
        `);

      if (error) throw error;

      // Count views per document
      const counts = activity?.reduce((acc: any, curr) => {
        const docName = curr.document?.file_name || 'Unknown';
        if (!acc[docName]) {
          acc[docName] = 0;
        }
        acc[docName] += 1;
        return acc;
      }, {});

      return Object.entries(counts || {})
        .map(([name, views]) => ({
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          views
        }))
        .sort((a, b) => (b.views as number) - (a.views as number))
        .slice(0, 5);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Documents</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="views" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
