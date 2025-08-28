import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Shield, Brain, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

export function StatsCards() {
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-background border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-24" />
                </div>
                <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-full bg-destructive/10 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Unable to load practice statistics</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Please check your connection and try again
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todayAppointments = stats?.todayAppointments || 0;
  const pendingForms = stats?.pendingForms || 0;
  const insuranceRate = Math.round(stats?.insuranceVerifiedRate || 0);
  const aiEfficiency = 87; // This would come from AI service metrics

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Today's Appointments */}
      <Card className="bg-background border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-appointments">
                {todayAppointments}
              </p>
              <p className="text-xs text-secondary flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>8% from yesterday</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Forms */}
      <Card className="bg-background border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Forms
              </p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-forms">
                {pendingForms}
              </p>
              <p className="text-xs text-accent flex items-center mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span>{pendingForms > 0 ? "Needs attention" : "All processed"}</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Verified */}
      <Card className="bg-background border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Insurance Verified
              </p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-insurance-rate">
                {insuranceRate}%
              </p>
              <p className="text-xs text-secondary flex items-center mt-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                <span>Automation active</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Efficiency */}
      <Card className="bg-background border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                AI Efficiency
              </p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-ai-efficiency">
                {aiEfficiency}%
              </p>
              <p className="text-xs text-secondary flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>12% this month</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
