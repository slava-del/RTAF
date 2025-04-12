import { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb";
import { NotificationsProvider } from "@/hooks/use-notifications";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="pb-5 border-b border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 font-montserrat">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 max-w-4xl">{description}</p>
        )}
      </div>
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}

interface MainLayoutProps {
  children: ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function MainLayout({
  children,
  breadcrumbItems,
  title,
  description,
  action,
}: MainLayoutProps) {
  return (
    <NotificationsProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
        
        <main className="flex-grow py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {title && (
              <PageHeader
                title={title}
                description={description}
                action={action}
              />
            )}
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </NotificationsProvider>
  );
}
