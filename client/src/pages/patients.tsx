import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, Phone, Mail, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const response = await fetch("/api/patients", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch patients");
      return response.json();
    }
  });

  const filteredPatients = patients.filter((patient: any) =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="patients-title">
                  Patients
                </h1>
                <p className="text-muted-foreground">Manage your patient records</p>
              </div>
              <Button className="bg-primary text-primary-foreground" data-testid="button-add-patient">
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-patients"
                />
              </div>
              <Badge variant="outline" className="text-sm">
                {filteredPatients.length} patients
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading patients...</div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchTerm ? "No patients found" : "No patients yet"}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm 
                      ? `No patients match "${searchTerm}"`
                      : "Start by adding your first patient to the system"
                    }
                  </p>
                  {!searchTerm && (
                    <Button data-testid="button-add-first-patient">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Patient
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient: any) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg" data-testid={`patient-name-${patient.id}`}>
                            {patient.firstName} {patient.lastName}
                          </CardTitle>
                          {patient.dateOfBirth && (
                            <p className="text-sm text-muted-foreground">
                              Born {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          {patient.insuranceVerified ? (
                            <Badge variant="outline" className="text-secondary border-secondary">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-accent border-accent">
                              <Shield className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {patient.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" data-testid={`patient-email-${patient.id}`}>
                              {patient.email}
                            </span>
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" data-testid={`patient-phone-${patient.id}`}>
                              {patient.phone}
                            </span>
                          </div>
                        )}
                        {patient.insuranceProvider && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {patient.insuranceProvider}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Added {format(new Date(patient.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${patient.id}`}>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-schedule-${patient.id}`}>
                          <Calendar className="w-4 h-4" />
                        </Button>
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
