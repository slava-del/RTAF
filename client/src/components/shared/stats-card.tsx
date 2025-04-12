import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { IconName } from "@/components/ui/icons";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconName;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  secondaryValue?: string;
  progress?: number;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  secondaryValue,
  progress,
}: StatCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="mt-1 flex items-baseline justify-between">
              <div className="flex items-baseline text-2xl font-semibold text-primary">
                {value}
                {trend && (
                  <span
                    className={cn(
                      "ml-2 text-sm font-medium",
                      trend.direction === "up" && "text-green-600",
                      trend.direction === "down" && "text-red-600",
                      trend.direction === "neutral" && "text-yellow-600"
                    )}
                  >
                    <Icon
                      name={
                        trend.direction === "up"
                          ? "arrow-up-right"
                          : trend.direction === "down"
                          ? "arrow-down-right"
                          : "clock"
                      }
                      className="inline h-3 w-3 mr-0.5"
                    />
                    {trend.value}
                  </span>
                )}
                {secondaryValue && (
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {secondaryValue}
                  </span>
                )}
              </div>
              <div className="bg-primary-50 p-2 rounded-full">
                <Icon name={icon} className="h-5 w-5 text-primary" />
              </div>
            </dd>
            {progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {children}
    </div>
  );
}
