import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Link } from "wouter";
import { IconName } from "@/components/ui/icons";

interface QuickActionItemProps {
  icon: IconName;
  label: string;
  href: string;
}

function QuickActionItem({ icon, label, href }: QuickActionItemProps) {
  return (
    <Link href={href}>
      <a className="col-span-1 bg-primary-50 hover:bg-primary-100 rounded-lg p-4 text-sm text-primary flex flex-col items-center justify-center transition-all">
        <Icon name={icon} className="text-2xl mb-2 h-6 w-6" />
        {label}
      </a>
    </Link>
  );
}

export function QuickActions() {
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-light to-blue-300">
        <h3 className="text-lg leading-6 font-medium text-gray-900 font-montserrat">
          Quick Actions
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Frequently used operations and shortcuts
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-3">
          <QuickActionItem
            icon="file-text"
            label="New Document"
            href="/form-submission"
          />
          <QuickActionItem
            icon="users"
            label="Search Residents"
            href="/residents"
          />
          <QuickActionItem
            icon="file-check"
            label="View All Orders"
            href="/"
          />
          <QuickActionItem
            icon="settings"
            label="Settings"
            href="/settings"
          />
        </div>
      </CardContent>
    </Card>
  );
}
