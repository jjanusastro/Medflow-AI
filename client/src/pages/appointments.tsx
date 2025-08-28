import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?date=${selectedDate}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch appointments");
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="appointments-title">
                  Appointments
                </h1>
                <p className="text-muted-foreground">Manage your practice schedule</p>
              </div>
              <Button className="bg-primary text-primary-foreground" data-testid="button-new-appointment">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                data-testid="date-picker"
              />
              <Badge variant="outline" className="text-sm">
                {appointments.length} appointments
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading appointments...</div>
              </div>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No appointments scheduled</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    No appointments found for {format(new Date(selectedDate), 'MMMM d, yyyy')}
                  </p>
                  <Button data-testid="button-schedule-first">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule First Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment: any) => (
                  <Card key={appointment.id} className={`border-l-4 ${getTypeColor(appointment.type)}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-lg font-semibold text-foreground" data-testid={`appointment-patient-${appointment.id}`}>
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            {appointment.aiPreScreened && (
                              <Badge variant="outline" className="text-purple-600 border-purple-600">
                                AI Pre-screened
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {format(new Date(appointment.scheduledAt), 'h:mm a')} 
                                ({appointment.duration} min)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>{appointment.type}</span>
                            </div>
                            {appointment.room && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>{appointment.room}</span>
                              </div>
                            )}
                          </div>
                          {appointment.notes && (
                            <p className="mt-2 text-sm text-foreground">
                              {appointment.notes}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-3">
                            {appointment.formsCompleted ? (
                              <Badge variant="outline" className="text-primary border-primary">
                                Forms Complete
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-accent border-accent">
                                Pending Forms
                              </Badge>
                            )}
                            {appointment.patient?.insuranceVerified ? (
                              <Badge variant="outline" className="text-secondary border-secondary">
                                Insurance Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-destructive border-destructive">
                                Insurance Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" data-testid={`button-edit-${appointment.id}`}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-complete-${appointment.id}`}>
                            Complete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
