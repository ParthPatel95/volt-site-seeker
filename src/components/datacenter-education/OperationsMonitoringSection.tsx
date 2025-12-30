import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Bell, Clock, Shield, Wrench, Activity, Zap, Thermometer, Cpu, Wifi, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { DCESectionWrapper, DCESectionHeader, DCEContentCard, DCEKeyInsight, DCEDeepDive } from './shared';
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
    <DCESectionWrapper theme="accent" id="operations">
      <LearningObjectives
        objectives={[
          "Understand 24/7 NOC operations and staffing models",
          "Learn DCIM system capabilities and monitoring dashboards",
          "Know alarm categories and escalation procedures",
          "Review preventive maintenance schedules and criticality"
        ]}
        estimatedTime="10 min"
        prerequisites={[
          { title: "Mining Hardware", href: "#hardware" }
        ]}
      />
      
      <DCESectionHeader
        badge="Section 7 • Operations"
        badgeIcon={Monitor}
        title="Operations & Monitoring"
        description="24/7 NOC operations, DCIM systems, and maintenance schedules for professional mining facilities"
        theme="light"
      />

      {/* NOC Image Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden mb-10 h-48 md:h-72 border border-border"
      >
        <img 
          src={nocInterior} 
          alt="Network Operations Center with monitoring screens" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <Monitor className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
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
      </motion.div>

      {/* Live Metrics Dashboard Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-10"
      >
        <DCEContentCard variant="elevated">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            DCIM Dashboard (Sample)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {dcimMetrics.map((metric) => (
              <div key={metric.name} className="bg-muted/30 rounded-xl p-4 text-center border border-border">
                <metric.icon className={`w-6 h-6 mx-auto mb-2 ${
                  metric.status === 'warning' ? 'text-yellow-500' : 'text-[hsl(var(--watt-bitcoin))]'
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
        </DCEContentCard>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        {/* Alert Management */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DCEContentCard variant="bordered" className="h-full">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
              Alarm Categories & Escalation
            </h3>
            <div className="space-y-3">
              {alertCategories.map((category) => (
                <div key={category.name} className="p-3 bg-muted/30 rounded-xl border border-border">
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
                    <span className="text-[hsl(var(--watt-bitcoin))]">{category.response}</span>
                  </div>
                </div>
              ))}
            </div>
          </DCEContentCard>
        </motion.div>

        {/* Shift Schedule */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <DCEContentCard variant="bordered" className="h-full">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
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
                      ? 'bg-[hsl(var(--watt-bitcoin))] text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {shifts[shift].name}
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-foreground">{currentShift.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentShift.hours}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">{currentShift.staff}</div>
                  <div className="text-xs text-muted-foreground">Staff</div>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="font-medium text-foreground">Activities: </span>
                <span className="text-muted-foreground">{currentShift.activities.join(' • ')}</span>
              </div>
            </div>
            
            {/* Total Staff */}
            <div className="mt-4 p-3 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg border border-[hsl(var(--watt-bitcoin)/0.2)] text-center">
              <span className="text-sm font-medium text-foreground">Total Site Staff: </span>
              <span className="text-lg font-bold text-[hsl(var(--watt-bitcoin))]">9 personnel/day</span>
            </div>
          </DCEContentCard>
        </motion.div>
      </div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" title="Uptime is Everything" delay={0.3}>
        <p>
          Every hour of downtime at a 100MW facility costs approximately <strong>$15,000-$25,000</strong> in lost revenue 
          (depending on BTC price and efficiency). This is why professional operations invest heavily in redundancy, 
          monitoring, and rapid response capabilities. A 99.5% vs 99.9% uptime difference represents ~35 hours/year 
          or <strong>$500K-$875K</strong> in annual losses.
        </p>
      </DCEKeyInsight>

      {/* Maintenance Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-8"
      >
        <DCEContentCard variant="elevated">
          <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
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
        </DCEContentCard>
      </motion.div>

      {/* DCIM Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-6">DCIM System Capabilities</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dcimFeatures.map((feature) => (
            <div key={feature.name} className="bg-card rounded-xl border border-border p-4 hover:border-[hsl(var(--watt-bitcoin)/0.5)] transition-colors flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-foreground text-sm">{feature.name}</div>
                <div className="text-xs text-muted-foreground">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <SectionSummary
        takeaways={[
          "24/7 NOC with 3 shifts (9 staff/day) monitors power, temps, and hashrate continuously",
          "4-tier alarm system: Critical (immediate), Major (15-30 min), Minor (next window), Info (ack only)",
          "DCIM provides real-time visibility into PUE, capacity, assets, and trends",
          "Preventive maintenance prevents costly unplanned downtime — uptime is revenue"
        ]}
      />
    </DCESectionWrapper>
  );
};

export default OperationsMonitoringSection;
