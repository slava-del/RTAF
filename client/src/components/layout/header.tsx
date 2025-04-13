import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { NotificationPanel } from "@/components/shared/notification-panel";
import { useNotifications } from "@/hooks/use-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Company Data", href: "/company" },
  { label: "Residents", href: "/residents" },
  { label: "Orders", href: "/" },
  { label: "Received", href: "/received-documents" },
];

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { unreadCount } = useNotifications();
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo + Mobile menu trigger */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <div className="py-4">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                      <span className="text-white font-montserrat font-bold text-xl">
                        MEnergy
                      </span>
                    </div>
                    <span className="ml-2 text-primary font-montserrat font-semibold text-lg">
                      Report Transfer
                    </span>
                  </div>

                  {/* Mobile nav (sheet) */}
                  <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                      <Link key={item.href} to={item.href}>
                        <div
                          className={cn(
                            "flex items-center px-3 rounded-md text-sm font-medium h-8",
                            location === item.href
                              ? "bg-primary-50 text-primary"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-montserrat font-bold text-xl">
                  ME
                </span>
              </div>
              <span className="ml-2 text-primary font-montserrat font-semibold text-lg hidden md:block">
                MEnergy
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden sm:flex items-center flex-1 justify-center sm:space-x-4">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 rounded-md text-sm font-medium h-full",
                    location === item.href
                      ? "bg-primary-50 text-primary"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>

          {/* Right side: Notifications + User menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotificationsPanelOpen(true)}
            >
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="sr-only">Notifications</span>
            </Button>
            <NotificationPanel
              open={notificationsPanelOpen}
              onOpenChange={setNotificationsPanelOpen}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8 text-xs">
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(user?.fullName || user?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex sm:items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.fullName || user?.username}
                    </span>
                    <ChevronDown className="text-gray-400 h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {user?.username}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/company">
                    <div className="flex items-center gap-2">
                      Company Profile
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/received-documents">
                    <div className="flex items-center gap-2">
                      Received Document
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">Settings</div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <div className="flex items-center gap-2">Log out</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
