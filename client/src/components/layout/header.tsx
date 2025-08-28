import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Heart, User } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-foreground" data-testid="app-title">
              MedFlow AI
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
              3
            </Badge>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground" data-testid="user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize" data-testid="user-role">
                {user?.role}
              </p>
            </div>
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()} data-testid="logout-button">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
