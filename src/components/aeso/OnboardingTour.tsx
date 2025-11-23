import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Sparkles, Layout, Settings as SettingsIcon, Check } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  tips: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Dashboard Builder',
    description: 'Let\'s take a quick tour to help you create amazing energy dashboards in minutes.',
    icon: Sparkles,
    tips: [
      'Build custom dashboards with drag-and-drop widgets',
      'Choose from pre-configured widget presets',
      'Visualize AESO market data in real-time',
    ],
  },
  {
    title: 'Adding Widgets',
    description: 'The Widgets tab is where you add and configure data visualizations for your dashboard.',
    icon: Sparkles,
    tips: [
      'Browse the widget library on the left',
      'Click any preset to instantly add it',
      'Customize widget settings with the edit button',
      'Choose from charts, gauges, stats, and tables',
    ],
  },
  {
    title: 'Arranging Layout',
    description: 'The Layout tab lets you arrange widgets and customize the dashboard appearance.',
    icon: Layout,
    tips: [
      'Drag widgets to reposition them',
      'Resize widgets by dragging corners',
      'Create responsive layouts for different screens',
      'Preview changes in real-time',
    ],
  },
  {
    title: 'Dashboard Settings',
    description: 'The Settings tab allows you to configure dashboard properties and sharing options.',
    icon: SettingsIcon,
    tips: [
      'Update dashboard name and description',
      'Add tags for easy organization',
      'Configure auto-refresh settings',
      'Set up sharing and permissions',
    ],
  },
  {
    title: 'You\'re All Set!',
    description: 'Start building your dashboard by adding widgets from the library. Need help? Click the help icon anytime.',
    icon: Check,
    tips: [
      'Save your changes frequently',
      'Use Preview to see how it looks',
      'Check out pre-made templates for inspiration',
      'Enable AI assistant for smart suggestions',
    ],
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
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

  const handleSkip = () => {
    onComplete();
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription className="mt-1">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={progress} className="w-full" />

          <div className="py-4">
            <p className="text-base mb-4">{step.description}</p>

            <div className="space-y-2">
              {step.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
