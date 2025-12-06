import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const LiveMarketSkeleton = () => {
  return (
    <Card className="bg-white border border-gray-200 shadow-institutional animate-pulse">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        <div className="h-4 w-48 bg-gray-200 rounded mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-watt-light rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
