import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Calendar, Clock, DollarSign, Shield, Brain } from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/practice-stats"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/practice-stats", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch practice statistics");
      return response.json();
    }
  });

  const mockChartData = [
    { name: "Mon", appointments: 24, revenue: 3200 },
    { name: "Tue", appointments: 28, revenue: 3700 },
    { name: "Wed", appointments: 22, revenue: 2900 },
    { name: "Thu", appointments: 30, revenue: 4100 },
    { name: "Fri", appointments: 26, revenue: 3500 },
    { name: "Sat", appointments: 18, revenue: 2400 },
    { name: "Sun", appointments: 12, revenue: 1600 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex h-[calc(100vh-73px)]">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading analytics...</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center" data-testid="analytics-title">
                  <BarChart3 className="w-8 h-8 mr-3 text-primary" />
                  Practice Analytics
                </h1>
                <p className="text-muted-foreground">Insights and performance metrics for your practice</p>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48" data-testid="time-range-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="total-patients">
                        {stats?.totalPatients || 0}
                      </p>
                      <p className="text-xs text-secondary flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="today-appointments">
                        {stats?.todayAppointments || 0}
                      </p>
                      <p className="text-xs text-secondary flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +8% from yesterday
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Insurance Verified</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="insurance-rate">
                        {Math.round(stats?.insuranceVerifiedRate || 0)}%
                      </p>
                      <p className="text-xs text-secondary flex items-center mt-1">
                        <Shield className="w-3 h-3 mr-1" />
                        AI automation active
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Forms</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="pending-forms">
                        {stats?.pendingForms || 0}
                      </p>
                      <p className="text-xs text-accent flex items-center mt-1">
                        <Brain className="w-3 h-3 mr-1" />
                        AI processing available
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Appointment Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Interactive chart would display here
                      </p>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-foreground">142</p>
                          <p className="text-xs text-muted-foreground">This Week</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-secondary">89%</p>
                          <p className="text-xs text-muted-foreground">Show Rate</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-primary">4.8</p>
                          <p className="text-xs text-muted-foreground">Avg Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Revenue chart would display here
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-foreground">$23,450</p>
                          <p className="text-xs text-muted-foreground">This Month</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-secondary">+15%</p>
                          <p className="text-xs text-muted-foreground">vs Last Month</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Operational Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Avg Wait Time</p>
                        <p className="text-sm text-muted-foreground">23% reduction this month</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">8 min</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-medium text-foreground">Patient Satisfaction</p>
                        <p className="text-sm text-muted-foreground">Based on 127 reviews</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-secondary border-secondary">4.8/5</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-foreground">Automation Rate</p>
                        <p className="text-sm text-muted-foreground">Forms & scheduling</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-purple-500 border-purple-500">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium text-foreground">Insurance Accuracy</p>
                        <p className="text-sm text-muted-foreground">AI verification success</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-accent border-accent">96%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-medium text-foreground">New Patients</p>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-secondary border-secondary">+24</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Revenue Growth</p>
                        <p className="text-sm text-muted-foreground">vs last quarter</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">+15%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
