import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { useNotifications } from "@/hooks/use-notifications";
import { getNotificationColor, formatDateTime } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const { notifications, markAllAsRead, markAsRead, isLoading } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "check-circle";
      case "error":
        return "x-circle";
      case "warning":
        return "alert-circle";
      case "info":
      default:
        return "info";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="px-4 py-6 sm:px-6 bg-primary">
          <SheetTitle className="text-lg font-medium text-white">
            Notifications
          </SheetTitle>
          <SheetDescription className="text-sm text-primary-100">
            Your recent system notifications and alerts
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          {isLoading ? (
            <div className="p-6 text-center">
              <Icon name="clock" className="h-6 w-6 mx-auto text-gray-400 animate-pulse" />
              <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Icon name="bell" className="h-6 w-6 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const { bg, text } = getNotificationColor(notification.type);
                return (
                  <div 
                    key={notification.id} 
                    className="relative px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon name={getNotificationIcon(notification.type) as any} className={`text-xl ${text}`} />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <span className="absolute top-4 right-4 block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <SheetFooter className="border-t border-gray-200 p-4 bg-gray-50 flex justify-center">
          <Button 
            onClick={handleMarkAllAsRead}
            disabled={isLoading || notifications.every(n => n.isRead) || notifications.length === 0}
          >
            Mark All as Read
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
