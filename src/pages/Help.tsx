
import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Search, Book, MessageCircle, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('faq');

  const faqItems = [
    {
      question: "How do I access real-time AESO market data?",
      answer: "Navigate to the AESO Market Data section from the main dashboard. The data is automatically refreshed every 5 minutes.",
      category: "Market Data"
    },
    {
      question: "What energy markets are supported?",
      answer: "We currently support AESO (Alberta), ERCOT (Texas), and PJM markets with more being added regularly.",
      category: "Markets"
    },
    {
      question: "How accurate are the energy rate estimates?",
      answer: "Our estimates are based on real-time market data and historical patterns, typically accurate within 5-10%.",
      category: "Rates"
    },
    {
      question: "Can I export data for external analysis?",
      answer: "Yes, all data can be exported in CSV, JSON, or Excel formats through the Data Management section.",
      category: "Export"
    }
  ];

  const tutorials = [
    {
      title: "Getting Started with VoltScout",
      description: "Learn the basics of navigating the platform",
      duration: "5 min",
      level: "Beginner"
    },
    {
      title: "Understanding Energy Rate Calculations",
      description: "Deep dive into our rate estimation methodology",
      duration: "12 min",
      level: "Intermediate"
    },
    {
      title: "Corporate Intelligence Features",
      description: "How to use AI-powered business analytics",
      duration: "8 min",
      level: "Advanced"
    },
    {
      title: "Power Infrastructure Analysis",
      description: "Analyzing substations and transmission data",
      duration: "15 min",
      level: "Advanced"
    }
  ];

  const filteredFAQ = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-6 h-6 mr-2" />
              Help & Support Center
            </CardTitle>
            <p className="text-muted-foreground">
              Find answers, tutorials, and get support for VoltScout
            </p>
          </CardHeader>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Tutorials
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Badge className="w-4 h-4" />
              Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQ.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{item.question}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorials.map((tutorial, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{tutorial.title}</h4>
                          <Badge variant={tutorial.level === 'Beginner' ? 'default' : tutorial.level === 'Intermediate' ? 'secondary' : 'outline'}>
                            {tutorial.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{tutorial.duration}</span>
                          <Button size="sm" variant="outline">Watch</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get help via email. We typically respond within 24 hours.
                  </p>
                  <Button className="w-full">
                    Send Email
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat with our support team in real-time.
                  </p>
                  <Button className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Call us for urgent technical issues.
                  </p>
                  <p className="font-medium mb-2">1-800-VOLTSCOUT</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <span className="font-medium">All Systems Operational</span>
                        <p className="text-sm text-muted-foreground">All services are running normally</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Service Status</h4>
                    <div className="space-y-2">
                      {['AESO Market Data', 'Energy Rate Calculator', 'Corporate Intelligence', 'Power Infrastructure'].map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{service}</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Operational
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
