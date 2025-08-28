import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CalendarPlus, FileText, Mail, Users, Shield } from "lucide-react";
import { useLocation } from "wouter";

export function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      icon: UserPlus,
      label: "Add New Patient",
      onClick: () => setLocation("/patients"),
      testId: "quick-action-add-patient",
      iconColor: "text-primary"
    },
    {
      icon: CalendarPlus,
      label: "Schedule Appointment",
      onClick: () => setLocation("/appointments"),
      testId: "quick-action-schedule-appointment",
      iconColor: "text-secondary"
    },
    {
      icon: FileText,
      label: "Process Forms",
      onClick: () => setLocation("/forms"),
      testId: "quick-action-process-forms",
      iconColor: "text-accent"
    },
    {
      icon: Shield,
      label: "Verify Insurance",
      onClick: () => setLocation("/insurance"),
      testId: "quick-action-verify-insurance",
      iconColor: "text-purple-500"
    },
    {
      icon: Mail,
      label: "Send Follow-up",
      onClick: () => setLocation("/ai-assistant"),
      testId: "quick-action-send-followup",
      iconColor: "text-green-500"
    },
    {
      icon: Users,
      label: "View All Patients",
      onClick: () => setLocation("/patients"),
      testId: "quick-action-view-patients",
      iconColor: "text-blue-500"
    }
  ];

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={action.onClick}
              className="w-full flex items-center justify-start space-x-3 p-3 h-auto bg-background hover:bg-muted transition-colors"
              data-testid={action.testId}
            >
              <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              <span className="text-sm font-medium text-foreground">
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
