import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsGrid, StatCard } from "@/components/shared/stats-card";
import { OrderTable } from "@/components/shared/order-table";
import { QuickActions } from "@/components/shared/quick-actions";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { DocumentUpload } from "@/components/shared/document-upload";
import { Button } from "@/components/ui/button";
import { Order } from "@shared/schema";
import { Icon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery<Order[], Error>({
    queryKey: ["/api/orders"],
  });
  
  const { data: documents = [], isLoading: isDocumentsLoading } = useQuery<any[], Error>({
    queryKey: ["/api/documents"],
  });

  return (
    <MainLayout
      title="Dashboard"
      description="View and manage your orders, documents, and reports."
      action={
        <Button className="flex items-center">
          <Icon name="upload" className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      }
    >
      {/* Stats Row */}
      <StatsGrid>
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon="file-check"
          trend={{ value: "12%", direction: "up" }}
        />
        
        <StatCard
          title="Pending Documents"
          value={orders.filter(o => o.status === "processing" || o.status === "pending").length}
          icon="clock"
          trend={{ value: "Processing", direction: "neutral" }}
        />
        
        <StatCard
          title="Uploaded Documents"
          value={documents.length}
          icon="inbox"
          trend={{ value: "8%", direction: "up" }}
        />
        
        <StatCard
          title="Storage Used"
          value={`${Math.round(documents.reduce((acc, doc) => acc + doc.size, 0) / 1024 / 1024)} MB`}
          secondaryValue="of 2 GB"
          icon="hard-drive"
          progress={Math.min(100, Math.round(documents.reduce((acc, doc) => acc + doc.size, 0) / (2 * 1024 * 1024 * 1024) * 100))}
        />
      </StatsGrid>

      {/* Documents and Orders */}
      <OrderTable orders={orders} isLoading={isOrdersLoading} />

      {/* Utility Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-2 mb-6">
        <QuickActions />
        <ActivityFeed />
      </div>

      {/* Document Upload */}
      <DocumentUpload />
    </MainLayout>
  );
}
