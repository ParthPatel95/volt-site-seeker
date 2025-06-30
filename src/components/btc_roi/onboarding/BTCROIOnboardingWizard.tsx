
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Calculator, Building2, Zap, TrendingUp, Target, CheckCircle } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface BTCROIOnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const BTCROIOnboardingWizard: React.FC<BTCROIOnboardingWizardProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BTC Mining ROI Lab',
      description: 'Your comprehensive Bitcoin mining profitability analysis platform',
      icon: <Calculator className="w-8 h-8 text-orange-600" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Calculator className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Mining Analysis</h3>
            <p className="text-gray-600">
              Calculate profitability, analyze risks, and optimize your Bitcoin mining operations with real-time market data.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Real-Time Data</h4>
              <p className="text-sm text-gray-600">Live market prices and network stats</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">Accurate Calculations</h4>
              <p className="text-sm text-gray-600">Comprehensive ROI modeling</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium">Professional Reports</h4>
              <p className="text-sm text-gray-600">Export detailed analysis</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'modes',
      title: 'Choose Your Mining Strategy',
      description: 'Select between hosting business or self-mining analysis',
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Hosting Business</h3>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">Recommended for Facilities</Badge>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Calculate hosting revenue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Analyze wholesale energy costs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Multi-facility management</span>
                </li>
              </ul>
            </div>
            
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Self-Mining</h3>
                  <Badge variant="outline" className="text-green-600 border-green-300">For Individual Miners</Badge>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Hardware ROI analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Break-even calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Personal mining setup optimization</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Pro Tip</h4>
                <p className="text-sm text-amber-700">
                  You can switch between modes anytime. Start with the mode that best matches your current situation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Key Features Overview',
      description: 'Discover the powerful tools at your disposal',
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Analytics & Intelligence</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Live Market Data</h4>
                    <p className="text-sm text-gray-600">Real-time BTC prices and network statistics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Sensitivity Analysis</h4>
                    <p className="text-sm text-gray-600">Test different scenarios and variables</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">ASIC Hardware Catalog</h4>
                    <p className="text-sm text-gray-600">Browse and compare mining hardware</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Professional Tools</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <Calculator className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Advanced Calculations</h4>
                    <p className="text-sm text-gray-600">Comprehensive ROI and profitability modeling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Multi-Site Management</h4>
                    <p className="text-sm text-gray-600">Manage multiple mining operations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                  <Zap className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Export & Reporting</h4>
                    <p className="text-sm text-gray-600">Professional PDF reports and data export</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'Ready to Get Started!',
      description: 'You\'re all set to analyze your Bitcoin mining profitability',
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">You're Ready to Start!</h3>
            <p className="text-gray-600 mb-6">
              Begin by selecting your mining mode and entering your first calculation. 
              The platform will guide you through each step.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-3">Quick Start Tips:</h4>
            <div className="text-left space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Start with the "Hosting Business" mode if you run a mining facility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Use the ASIC catalog to quickly populate hardware specifications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Save your calculations to compare different scenarios</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Export professional reports for investors and stakeholders</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {steps[currentStep].icon}
              <div>
                <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={onSkip} className="text-sm">
              Skip Tour
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {steps[currentStep].content}
        </CardContent>
        
        <div className="border-t p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
