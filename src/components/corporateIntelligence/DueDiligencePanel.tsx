
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function DueDiligencePanel() {
  const dueDiligenceItems = [
    {
      category: 'Financial Analysis',
      status: 'complete',
      items: [
        { name: 'Revenue Analysis', status: 'complete' },
        { name: 'Debt Structure', status: 'complete' },
        { name: 'Cash Flow', status: 'complete' },
        { name: 'Profitability Trends', status: 'warning' }
      ]
    },
    {
      category: 'Power Infrastructure',
      status: 'in-progress',
      items: [
        { name: 'Grid Connection Assessment', status: 'complete' },
        { name: 'Capacity Analysis', status: 'in-progress' },
        { name: 'Upgrade Requirements', status: 'pending' },
        { name: 'Regulatory Compliance', status: 'complete' }
      ]
    },
    {
      category: 'Risk Assessment',
      status: 'warning',
      items: [
        { name: 'Market Risk', status: 'complete' },
        { name: 'Operational Risk', status: 'warning' },
        { name: 'Regulatory Risk', status: 'complete' },
        { name: 'Environmental Risk', status: 'pending' }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'in-progress':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'border-green-500';
      case 'warning':
        return 'border-yellow-500';
      case 'in-progress':
        return 'border-blue-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="w-5 h-5 mr-2" />
            Due Diligence Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dueDiligenceItems.map((category, index) => (
              <Card key={index} className={`border-l-4 ${getStatusColor(category.status)}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{category.category}</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(category.status)}
                      <Badge variant="outline" className="capitalize">
                        {category.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {category.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-gray-50">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          <span className="text-xs text-gray-500 capitalize">
                            {item.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
