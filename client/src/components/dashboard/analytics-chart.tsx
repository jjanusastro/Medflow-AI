import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Star, AlertCircle } from "lucide-react";
import { useState } from "react";

export function AnalyticsChart() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/practice-stats"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/practice-stats", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch practice statistics");
      return response.json();
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Patient Flow Analytics */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Patient Flow Analytics
            </CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="analytics-time-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 bg-muted rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-muted-foreground">Loading analytics...</div>
            </div>
          ) : error ? (
            <div className="h-48 bg-destructive/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">Unable to load analytics</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mock Chart Area */}
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground" data-testid="chart-placeholder">
                    Patient flow visualization would appear here
                  </p>
                </div>
              </div>
              
              {/* Analytics Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground" data-testid="total-patients-chart">
                    {stats?.totalPatients || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">89%</p>
                  <p className="text-xs text-muted-foreground">Show Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">4.8</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Practice Performance */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Practice Performance
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="view-performance-details">
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-lg" />
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">Unable to load performance data</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Average Wait Time */}
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Average Wait Time</p>
                    <p className="text-sm text-muted-foreground">Reduced by 23% this month</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary" data-testid="avg-wait-time">
                  8 min
                </Badge>
              </div>

              {/* Patient Satisfaction */}
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Patient Satisfaction</p>
                    <p className="text-sm text-muted-foreground">Based on recent reviews</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-secondary border-secondary" data-testid="patient-satisfaction">
                  4.8/5
                </Badge>
              </div>

              {/* Revenue per Visit */}
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Revenue per Visit</p>
                    <p className="text-sm text-muted-foreground">+15% from last quarter</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-accent border-accent" data-testid="revenue-per-visit">
                  $127
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
