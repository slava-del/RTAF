import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { Icon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/utils";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<Activity[], Error>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (action: string) => {
    if (action.includes("Upload")) return { name: "upload", bg: "bg-blue-100", color: "text-blue-600" };
    if (action.includes("Document") && action.includes("Delete")) return { name: "x-circle", bg: "bg-red-100", color: "text-red-600" };
    if (action.includes("Order") && action.includes("Created")) return { name: "file-check", bg: "bg-purple-100", color: "text-purple-600" };
    if (action.includes("Login")) return { name: "user", bg: "bg-green-100", color: "text-green-600" };
    if (action.includes("Logout")) return { name: "logout", bg: "bg-yellow-100", color: "text-yellow-600" };
    if (action.includes("Registration")) return { name: "user", bg: "bg-blue-100", color: "text-blue-600" };
    return { name: "info", bg: "bg-gray-100", color: "text-gray-600" };
  };

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-light to-blue-300">
        <h3 className="text-lg leading-6 font-medium text-gray-900 font-montserrat">
          Recent Activities
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Latest actions and system updates
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="px-4 py-3 sm:px-6 flex items-start">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-3 flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
          ) : !activities || activities.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <Icon name="info" className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              No recent activities
            </div>
          ) : (
            activities.slice(0, 4).map((activity) => {
              const { name, bg, color } = getActivityIcon(activity.action);
              return (
                <div key={activity.id} className="px-4 py-3 sm:px-6 flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center`}>
                      <Icon name={name as any} className={color} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-900">
                      {activity.action}
                      {activity.details && (
                        <span className="font-medium"> - {activity.details}</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6 text-center">
        <Link href="/activities">
          <a className="text-sm font-medium text-primary-light hover:text-primary inline-flex items-center">
            View all activity
            <Icon name="chevron-right" className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
