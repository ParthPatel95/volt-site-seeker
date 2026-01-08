import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, CheckCircle, TrendingUp, Download, 
  ArrowLeft, RefreshCw, Search, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';
import { useAcademyAdmin } from '@/hooks/useAcademyAdmin';
import { Loader2 } from 'lucide-react';

const MODULE_NAMES: Record<string, string> = {
  'bitcoin': 'Bitcoin Fundamentals',
  'aeso': 'Alberta Power Market',
  'electrical': 'Electrical Engineering',
  'ppa': 'Power Purchase Agreements',
  'ercot': 'ERCOT Market',
  'caiso': 'CAISO Market',
  'pjm': 'PJM Market',
  'nyiso': 'NYISO Market',
  'miso': 'MISO Market',
  'spp': 'SPP Market',
  'isone': 'ISO-NE Market',
  'ieso': 'IESO Market'
};

const AcademyAdmin: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAcademyAuth();
  const { learners, stats, moduleStats, isLoading, exportLearnerData, refetch } = useAcademyAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/academy" replace />;
  }

  const filteredLearners = learners.filter(l => 
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/academy')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Academy
            </Button>
            <div>
              <h1 className="text-xl font-bold">Academy Admin</h1>
              <p className="text-sm text-muted-foreground">Manage learners and track progress</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={exportLearnerData} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLearners || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeLearners || 0} active this week
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Module Starts</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalModuleStarts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all modules
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sections Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSectionsCompleted || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total completions
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalLearners 
                    ? Math.round((stats.totalSectionsCompleted / stats.totalLearners) * 10) / 10
                    : 0
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Sections per learner
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Module Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Module Performance</CardTitle>
            <CardDescription>Starts and completions by module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {moduleStats.map(ms => (
                <div key={ms.module_id} className="p-4 rounded-lg border bg-muted/30">
                  <p className="font-medium text-sm">{MODULE_NAMES[ms.module_id] || ms.module_id}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{ms.total_starts} starts</span>
                    <span>{ms.total_completions} sections</span>
                  </div>
                </div>
              ))}
              {moduleStats.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  No module data yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learners Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Learners</CardTitle>
                <CardDescription>All registered academy users</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search learners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Modules</TableHead>
                  <TableHead className="text-right">Sections</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLearners.map(learner => (
                  <TableRow key={learner.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{learner.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{learner.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{learner.company || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(learner.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {learner.last_activity_at ? (
                        <Badge variant="outline" className="font-normal">
                          {formatDate(learner.last_activity_at)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{learner.modules_started}</TableCell>
                    <TableCell className="text-right">{learner.sections_completed}</TableCell>
                  </TableRow>
                ))}
                {filteredLearners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No learners match your search' : 'No learners yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AcademyAdmin;
