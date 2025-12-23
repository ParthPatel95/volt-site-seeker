import { useState } from 'react';
import { Calendar, Download, Printer, Wrench, Droplets, Thermometer, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ScheduleItem {
  task: string;
  frequency: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  notes?: string;
}

const MaintenanceScheduleGenerator = () => {
  const [asicCount, setAsicCount] = useState(20);
  const [fluidType, setFluidType] = useState<'mineral' | 'synthetic' | 'fluorocarbon'>('synthetic');
  const [climate, setClimate] = useState<'hot' | 'moderate' | 'cold'>('moderate');
  const [showSchedule, setShowSchedule] = useState(false);

  const generateSchedule = (): Record<string, ScheduleItem[]> => {
    const baseSchedule: Record<string, ScheduleItem[]> = {
      Daily: [
        { task: 'Check fluid inlet/outlet temperatures', frequency: 'Daily', priority: 'critical', estimatedTime: '5 min' },
        { task: 'Monitor ASIC chip temperatures', frequency: 'Daily', priority: 'critical', estimatedTime: '5 min' },
        { task: 'Verify pump operation & flow rates', frequency: 'Daily', priority: 'high', estimatedTime: '5 min' },
        { task: 'Review system alerts and logs', frequency: 'Daily', priority: 'high', estimatedTime: '10 min' }
      ],
      Weekly: [
        { task: 'Inspect fluid level and top up', frequency: 'Weekly', priority: 'high', estimatedTime: '15 min' },
        { task: 'Check for leaks at fittings/seals', frequency: 'Weekly', priority: 'high', estimatedTime: '20 min' },
        { task: 'Verify temperature differential across HEX', frequency: 'Weekly', priority: 'medium', estimatedTime: '10 min' }
      ],
      Monthly: [
        { task: 'Test backup systems and alarms', frequency: 'Monthly', priority: 'high', estimatedTime: '30 min' },
        { task: 'Inspect electrical connections', frequency: 'Monthly', priority: 'high', estimatedTime: '45 min' },
        { task: 'Visual fluid clarity inspection', frequency: 'Monthly', priority: 'medium', estimatedTime: '10 min' },
        { task: 'Review efficiency trends', frequency: 'Monthly', priority: 'medium', estimatedTime: '30 min' }
      ],
      Quarterly: [
        { task: 'Send fluid sample for lab analysis', frequency: 'Quarterly', priority: 'critical', estimatedTime: '30 min', notes: 'Test TAN, water content, viscosity' },
        { task: 'Clean/replace filtration elements', frequency: 'Quarterly', priority: 'high', estimatedTime: '1-2 hrs' },
        { task: 'Inspect pump seals and bearings', frequency: 'Quarterly', priority: 'high', estimatedTime: '1 hr' },
        { task: 'Calibrate temperature sensors', frequency: 'Quarterly', priority: 'medium', estimatedTime: '1 hr' }
      ],
      Annually: [
        { task: 'Comprehensive fluid quality analysis', frequency: 'Annually', priority: 'critical', estimatedTime: '1 day', notes: 'Full panel including metals, oxidation' },
        { task: 'Heat exchanger cleaning & inspection', frequency: 'Annually', priority: 'critical', estimatedTime: '4-8 hrs' },
        { task: 'Pump rebuild or replacement', frequency: 'Annually', priority: 'high', estimatedTime: '2-4 hrs' },
        { task: 'Full system audit', frequency: 'Annually', priority: 'high', estimatedTime: '1 day' }
      ]
    };

    // Adjust based on inputs
    if (climate === 'hot') {
      baseSchedule.Weekly.push({
        task: 'Clean dry cooler air filters',
        frequency: 'Weekly',
        priority: 'high',
        estimatedTime: '30 min',
        notes: 'Hot climate increases dust accumulation'
      });
    }

    if (fluidType === 'mineral') {
      baseSchedule.Monthly.push({
        task: 'Check fluid oxidation indicators',
        frequency: 'Monthly',
        priority: 'high',
        estimatedTime: '15 min',
        notes: 'Mineral oil degrades faster than synthetic'
      });
    }

    if (asicCount > 50) {
      baseSchedule.Weekly.push({
        task: 'Rotate ASIC position for even wear',
        frequency: 'Weekly',
        priority: 'low',
        estimatedTime: '1 hr',
        notes: 'Large installations benefit from rotation'
      });
    }

    return baseSchedule;
  };

  const schedule = generateSchedule();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-amber-500 bg-amber-500/10';
      case 'medium': return 'text-cyan-500 bg-cyan-500/10';
      case 'low': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-500" />
          Maintenance Schedule Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showSchedule ? (
          <div className="space-y-6">
            {/* Inputs */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of ASICs: {asicCount}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={asicCount}
                onChange={(e) => setAsicCount(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fluid Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['mineral', 'synthetic', 'fluorocarbon'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFluidType(type)}
                    className={`p-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                      fluidType === type
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                        : 'border-border bg-card text-muted-foreground hover:border-cyan-500/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Climate
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'hot', label: 'Hot (>30°C avg)' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'cold', label: 'Cold (<10°C avg)' }
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setClimate(option.value)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      climate === option.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                        : 'border-border bg-card text-muted-foreground hover:border-cyan-500/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => setShowSchedule(true)} 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Generate Schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Config Summary */}
            <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <span><strong>{asicCount}</strong> ASICs</span>
                <span className="capitalize"><strong>{fluidType}</strong> oil</span>
                <span className="capitalize"><strong>{climate}</strong> climate</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
                  <Printer className="w-3 h-3" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSchedule(false)}>
                  Edit
                </Button>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-6 print:space-y-4">
              {Object.entries(schedule).map(([period, tasks]) => (
                <div key={period} className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b border-border">
                    <h4 className="font-semibold text-foreground">{period} Tasks</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {tasks.map((task, i) => (
                      <div key={i} className="p-3 flex items-start gap-3">
                        <div className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-foreground">{task.task}</div>
                          {task.notes && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {task.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {task.estimatedTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-muted-foreground">Priority:</span>
              <span className={`px-2 py-0.5 rounded ${getPriorityColor('critical')}`}>Critical</span>
              <span className={`px-2 py-0.5 rounded ${getPriorityColor('high')}`}>High</span>
              <span className={`px-2 py-0.5 rounded ${getPriorityColor('medium')}`}>Medium</span>
              <span className={`px-2 py-0.5 rounded ${getPriorityColor('low')}`}>Low</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceScheduleGenerator;
