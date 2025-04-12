import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { NotificationPanel } from "@/components/shared/notification-panel";
import { useNotifications } from "@/hooks/use-notifications";
import { Icon } from "@/components/ui/icons";
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = {
  label: string;
  href: string;
  icon: keyof typeof Icon;  // assume Icon exports a map of names
};

const navItems: NavItem[] = [
  { label: "Company Data", href: "/company", icon: "building" },
  { label: "Residents", href: "/residents", icon: "users" },
  { label: "Orders", href: "/", icon: "file-check" },
  { label: "Received", href: "/received-documents", icon: "inbox" },
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <div className="flex items-center cursor-pointer">
                  <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                    <span className="text-white font-montserrat font-bold text-xl">
                      RTA
                    </span>
                  </div>
                  <span className="ml-2 text-primary font-montserrat font-semibold text-lg hidden sm:block">
                    Report Transfer Application
                  </span>
                </div>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <div
                    className={cn(
                      "px-1 pt-1 inline-flex items-center text-sm font-medium border-b-2",
                      location === item.href
                        ? "border-primary-light text-primary-light"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <Icon name={item.icon} className="mr-1 h-4 w-4" />
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Mobile navigation */}
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                      <span className="text-white font-montserrat font-bold text-xl">
                        RTA
                      </span>
                    </div>
                    <span className="ml-2 text-primary font-montserrat font-semibold text-lg">
                      Report Transfer
                    </span>
                  </div>
                  <nav className="flex flex-col space-y-3">
                    {navItems.map((item) => (
                      <Link key={item.href} to={item.href}>
                        <div
                          className={cn(
                            "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                            location === item.href
                              ? "bg-primary-50 text-primary"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          <Icon name={item.icon} className="mr-2 h-4 w-4" />
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User menu and notifications */}
          <div className="flex items-center">
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

            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center focus:outline-none"
                  >
                    <Avatar className="h-8 w-8 text-xs">
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(user?.fullName || user?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                      {user?.fullName || user?.username}
                    </span>
                    <ChevronDown className="ml-1 text-gray-400 hidden sm:block h-4 w-4" />
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
                      <div className="flex cursor-pointer items-center">
                        <Icon name="building" className="mr-2 h-4 w-4" />
                        <span>Company Profile</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/received-documents">
                      <div className="flex cursor-pointer items-center">
                        <Icon name="inbox" className="mr-2 h-4 w-4" />
                        <span>Received Documents</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex cursor-pointer items-center">
                      <Icon name="settings" className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <div className="flex cursor-pointer items-center">
                      <Icon name="logout" className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
