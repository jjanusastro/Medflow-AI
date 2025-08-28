import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AppointmentList } from "@/components/dashboard/appointment-list";
import { AiChat } from "@/components/dashboard/ai-chat";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Plus, Brain } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {/* Dashboard Header */}
          <div className="p-6 bg-card border-b border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="dashboard-title">
                  Practice Dashboard
                </h1>
                <p className="text-muted-foreground" data-testid="welcome-message">
                  Welcome back, {user?.firstName}. Here's what's happening today.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-ai-insights">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Insights
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-new-appointment">
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </div>
            
            <StatsCards />
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Appointments Section */}
              <div className="lg:col-span-2">
                <AppointmentList />
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                <AiChat />
                <QuickActions />
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mt-8">
              <AnalyticsChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
