import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Brain, 
  Shield, 
  FileText, 
  ChartBar, 
  Settings,
  Lock
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "AI Assistant", href: "/ai-assistant", icon: Brain },
  { name: "Insurance", href: "/insurance", icon: Shield },
  { name: "Forms", href: "/forms", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: ChartBar },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </a>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">HIPAA Compliant</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your data is encrypted and secure
          </p>
        </div>
      </div>
    </aside>
  );
}
