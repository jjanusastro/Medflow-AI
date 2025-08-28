import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlertCircle, Clock, User, MapPin } from "lucide-react";
import { format } from "date-fns";

export function AppointmentList() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["/api/appointments", today],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?date=${today}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch today's appointments");
      return response.json();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-primary text-primary-foreground";
      case "completed": return "bg-secondary text-secondary-foreground";
      case "cancelled": return "bg-destructive text-destructive-foreground";
      case "no-show": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "checkup": return "border-l-primary";
      case "consultation": return "border-l-secondary";
      case "follow-up": return "border-l-accent";
      default: return "border-l-muted";
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Today's Schedule
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="view-all-appointments">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-background rounded-lg border border-border animate-pulse">
                <div className="w-2 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-48" />
                  <div className="flex space-x-2">
                    <div className="h-5 bg-muted rounded w-20" />
                    <div className="h-5 bg-muted rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Unable to load appointments</p>
              <p className="text-xs text-muted-foreground">Please check your connection and try again</p>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No appointments today</p>
              <p className="text-xs text-muted-foreground">Your schedule is clear for today</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4" data-testid="appointments-list">
            {appointments.slice(0, 5).map((appointment: any) => (
              <div key={appointment.id} className={`flex items-center space-x-4 p-4 bg-background rounded-lg border-l-4 ${getTypeColor(appointment.type)} border-r border-t border-b border-border hover:shadow-sm transition-shadow cursor-pointer`} data-testid={`appointment-${appointment.id}`}>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground" data-testid={`appointment-patient-${appointment.id}`}>
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(appointment.status)} data-testid={`appointment-status-${appointment.id}`}>
                        {appointment.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(appointment.scheduledAt), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{appointment.type}</span>
                    </div>
                    {appointment.room && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{appointment.room}</span>
                      </div>
                    )}
                    <span>({appointment.duration || 30} min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.formsCompleted ? (
                      <Badge variant="outline" className="text-primary border-primary text-xs">
                        Forms Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-accent border-accent text-xs">
                        Pending Forms
                      </Badge>
                    )}
                    {appointment.patient?.insuranceVerified ? (
                      <Badge variant="outline" className="text-secondary border-secondary text-xs">
                        Insurance Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-destructive text-xs">
                        Insurance Pending
                      </Badge>
                    )}
                    {appointment.aiPreScreened && (
                      <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs">
                        AI Pre-screened
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid={`appointment-details-${appointment.id}`}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {appointments.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="view-more-appointments">
                  View {appointments.length - 5} more appointments
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
