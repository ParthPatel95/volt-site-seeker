import React from 'react';
import { AISiteRecommendation } from '@/components/advanced/AISiteRecommendation';
import { SmartGridAdvisor } from '@/components/advanced/SmartGridAdvisor';
import { ArbitrageDetector } from '@/components/advanced/ArbitrageDetector';
import { DueDiligenceAutomation } from '@/components/advanced/DueDiligenceAutomation';
import { AdvancedPersonalization } from '@/components/advanced/AdvancedPersonalization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdvancedFeatures() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Advanced AI-Powered Features
          </h1>
          <p className="text-muted-foreground">
            Comprehensive suite of advanced analytics and AI-driven tools
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="recommendations">AI Site Finder</TabsTrigger>
            <TabsTrigger value="grid">Grid Advisor</TabsTrigger>
            <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
            <TabsTrigger value="diligence">Due Diligence</TabsTrigger>
            <TabsTrigger value="personalization">Personalization</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <AISiteRecommendation />
          </TabsContent>

          <TabsContent value="grid">
            <SmartGridAdvisor />
          </TabsContent>

          <TabsContent value="arbitrage">
            <ArbitrageDetector />
          </TabsContent>

          <TabsContent value="diligence">
            <DueDiligenceAutomation />
          </TabsContent>

          <TabsContent value="personalization">
            <AdvancedPersonalization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}