import React, { useState } from 'react';
import { Monitor, Bell, Clock, Shield, Wrench, Activity, Zap, Thermometer, Cpu, Wifi, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import nocInterior from '@/assets/datacenter-noc-interior.jpg';

const OperationsMonitoringSection = () => {
  const [activeShift, setActiveShift] = useState<'day' | 'swing' | 'night'>('day');

  const dcimMetrics = [
    { name: 'Power Consumption', icon: Zap, value: '134.2 MW', status: 'normal', trend: '+0.5%' },
    { name: 'Total Hashrate', icon: Cpu, value: '5.76 EH/s', status: 'normal', trend: '+1.2%' },
    { name: 'Avg Inlet Temp', icon: Thermometer, value: '72°F', status: 'normal', trend: '-1°F' },
    { name: 'Network Latency', icon: Wifi, value: '12ms', status: 'normal', trend: '0' },
    { name: 'Active Miners', icon: Activity, value: '38,247', status: 'warning', trend: '-12' },
    { name: 'Efficiency', icon: Monitor, value: '23.3 J/TH', status: 'normal', trend: '-0.1' },
  ];

  const alertCategories = [
    { 
      name: 'Critical', 
      color: 'bg-red-500', 
      count: 0,
      examples: ['Total power loss', 'Fire alarm', 'Complete cooling failure', 'Security breach'],
      response: 'Immediate (24/7 on-call)',
    },
    { 
      name: 'Major', 
      color: 'bg-orange-500', 
      count: 2,
      examples: ['Transformer overtemp', 'Cooling redundancy lost', 'High inlet temp (>95°F)', 'PDU failure'],
      response: '15-30 minutes',
    },
    { 
      name: 'Minor', 
      color: 'bg-yellow-500', 
      count: 8,
      examples: ['Single miner offline', 'Fan failure', 'Network switch issue', 'Sensor drift'],
      response: 'Next maintenance window',
    },
    { 
      name: 'Info', 
      color: 'bg-blue-500', 
      count: 45,
      examples: ['Scheduled maintenance', 'Configuration change', 'Firmware update', 'Shift change'],
      response: 'Acknowledgment only',
    },
  ];

  const shifts = {
    day: { name: 'Day Shift', hours: '07:00 - 15:00', staff: 4, activities: ['Maintenance work', 'Visitor tours', 'Equipment installs', 'Vendor meetings'] },
    swing: { name: 'Swing Shift', hours: '15:00 - 23:00', staff: 3, activities: ['Monitoring', 'Minor repairs', 'Reporting', 'Shift handoff'] },
    night: { name: 'Night Shift', hours: '23:00 - 07:00', staff: 2, activities: ['Monitoring only', 'Emergency response', 'Security rounds', 'Log review'] },
  };

  const maintenanceTasks = [
    { task: 'Visual inspection walkthrough', frequency: 'Daily', duration: '1-2 hours', criticality: 'High' },
    { task: 'Filter cleaning/replacement', frequency: 'Weekly', duration: '4-6 hours', criticality: 'Medium' },
    { task: 'Thermal imaging scan', frequency: 'Weekly', duration: '2-3 hours', criticality: 'High' },
    { task: 'Firmware/software updates', frequency: 'Monthly', duration: '4-8 hours', criticality: 'Medium' },
    { task: 'UPS battery testing', frequency: 'Quarterly', duration: '2-4 hours', criticality: 'High' },
    { task: 'Generator load testing', frequency: 'Quarterly', duration: '2 hours', criticality: 'High' },
    { task: 'Full protective relay testing', frequency: 'Annually', duration: '8+ hours', criticality: 'Critical' },
    { task: 'Transformer oil analysis', frequency: 'Annually', duration: '1 day', criticality: 'Medium' },
  ];

  const dcimFeatures = [
    { name: 'Real-time Power Monitoring', description: 'Per-circuit metering down to individual miners' },
    { name: 'Environmental Sensors', description: 'Temperature, humidity, airflow at 100+ points' },
    { name: 'Asset Management', description: 'Track all equipment, warranties, maintenance history' },
    { name: 'Capacity Planning', description: 'Power/cooling headroom analysis' },
    { name: 'Alarm Management', description: 'Tiered escalation with mobile notifications' },
    { name: 'Reporting & Analytics', description: 'PUE, uptime, efficiency trends' },
  ];

  const currentShift = shifts[activeShift];

  return (
    <section id="operations" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 7 • Operations
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Operations & Monitoring
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              24/7 NOC operations, DCIM systems, and maintenance schedules for professional mining facilities
            </p>
          </div>
        </ScrollReveal>

        {/* NOC Image Header */}
        <ScrollReveal delay={0.05}>
          <div className="relative rounded-2xl overflow-hidden mb-10 h-48 md:h-72">
            <img 
              src={nocInterior} 
              alt="Network Operations Center with monitoring screens" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="w-6 h-6 text-watt-bitcoin" />
                <h3 className="text-xl md:text-2xl font-bold text-white">Network Operations Center</h3>
              </div>
              <p className="text-white/70 text-sm md:text-base mb-4">
                24/7 staffed control room with DCIM dashboards, SCADA integration, and alarm management
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  All Systems Normal
                </span>
                <span className="px-3 py-1 bg-white/10 text-white rounded text-xs">Active Alarms: 10</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Live Metrics Dashboard Mockup */}
        <ScrollReveal delay={0.1}>
          <div className="bg-card rounded-2xl border border-border p-6 mb-10">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-watt-bitcoin" />
              DCIM Dashboard (Sample)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {dcimMetrics.map((metric) => (
                <div key={metric.name} className="bg-muted/30 rounded-xl p-4 text-center">
                  <metric.icon className={`w-6 h-6 mx-auto mb-2 ${
                    metric.status === 'warning' ? 'text-yellow-500' : 'text-watt-bitcoin'
                  }`} />
                  <div className={`text-lg font-bold ${
                    metric.status === 'warning' ? 'text-yellow-500' : 'text-foreground'
                  }`}>
                    {metric.value}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{metric.name}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    metric.trend.includes('+') ? 'bg-green-500/10 text-green-500' :
                    metric.trend.includes('-') ? 'bg-red-500/10 text-red-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Alert Management */}
          <ScrollReveal delay={0.15}>
            <div className="bg-card rounded-2xl border border-border p-6 h-full">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-watt-bitcoin" />
                Alarm Categories & Escalation
              </h3>
              <div className="space-y-3">
                {alertCategories.map((category) => (
                  <div key={category.name} className="p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="font-semibold text-foreground">{category.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        category.count === 0 ? 'bg-green-500/20 text-green-500' : 
                        category.name === 'Critical' ? 'bg-red-500/20 text-red-500' :
                        'bg-muted text-foreground'
                      }`}>
                        {category.count} active
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      <span className="font-medium">Examples: </span>
                      {category.examples.slice(0, 2).join(', ')}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-foreground">Response: </span>
                      <span className="text-watt-bitcoin">{category.response}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Shift Schedule */}
          <ScrollReveal delay={0.2}>
            <div className="bg-card rounded-2xl border border-border p-6 h-full">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-watt-bitcoin" />
                24/7 Shift Schedule
              </h3>
              
              {/* Shift Selector */}
              <div className="flex gap-2 mb-4">
                {(['day', 'swing', 'night'] as const).map((shift) => (
                  <button
                    key={shift}
                    onClick={() => setActiveShift(shift)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      activeShift === shift
                        ? 'bg-watt-bitcoin text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {shifts[shift].name}
                  </button>
                ))}
              </div>
              
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-foreground">{currentShift.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {currentShift.hours}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-watt-bitcoin">{currentShift.staff}</div>
                    <div className="text-xs text-muted-foreground">Staff</div>
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium text-foreground">Activities: </span>
                  <span className="text-muted-foreground">{currentShift.activities.join(' • ')}</span>
                </div>
              </div>
              
              {/* Total Staff */}
              <div className="mt-4 p-3 bg-watt-bitcoin/10 rounded-lg text-center">
                <span className="text-sm font-medium text-foreground">Total Site Staff: </span>
                <span className="text-lg font-bold text-watt-bitcoin">9 personnel/day</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Maintenance Schedule */}
        <ScrollReveal delay={0.25}>
          <div className="bg-card rounded-2xl border border-border p-6 mb-10">
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-watt-bitcoin" />
              Preventive Maintenance Schedule
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Regular maintenance ensures uptime and extends equipment life
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 font-medium text-foreground">Task</th>
                    <th className="text-left py-3 px-3 font-medium text-foreground">Frequency</th>
                    <th className="text-left py-3 px-3 font-medium text-foreground">Duration</th>
                    <th className="text-left py-3 px-3 font-medium text-foreground">Criticality</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceTasks.map((task) => (
                    <tr key={task.task} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-3 text-foreground">{task.task}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 bg-muted rounded text-xs">{task.frequency}</span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{task.duration}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.criticality === 'Critical' ? 'bg-red-500/10 text-red-500' :
                          task.criticality === 'High' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {task.criticality}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* DCIM Features */}
        <ScrollReveal delay={0.3}>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">DCIM System Capabilities</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dcimFeatures.map((feature) => (
                <div key={feature.name} className="bg-card rounded-xl border border-border p-4 hover:border-watt-bitcoin/50 transition-colors flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">{feature.name}</div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default OperationsMonitoringSection;
