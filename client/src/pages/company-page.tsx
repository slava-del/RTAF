import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { CompanyInfoCard } from "@/components/shared/company-info-card";
import { StatsGrid, StatCard } from "@/components/shared/stats-card";
import { OrderTable } from "@/components/shared/order-table";
import { QuickActions } from "@/components/shared/quick-actions";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/components/ui/icons";

export default function CompanyPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState("Energa Moldova S.A.");
  const [registrationNumber, setRegistrationNumber] = useState("EM-1024-8721");
  const [address, setAddress] = useState("Str. Energeticilor 5, Chișinău, MD-2024");
  const [contact, setContact] = useState("contact@energa.md | +373 22 857 400");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: orders = [] } = useQuery<Order[], Error>({
    queryKey: ["/api/orders"],
  });

  const handleEditSave = () => {
    // In a real app, this would be an API call to save company details
    toast({
      title: "Company details updated",
      description: "Your company information has been saved successfully.",
    });
    setEditDialogOpen(false);
  };

  return (
    <MainLayout
      breadcrumbItems={[{ label: "Company Data" }]}
      title="Company Dashboard"
      description="View and manage your company information, order summaries, and document transfers."
      action={
        <Button className="inline-flex items-center">
          <Icon name="upload" className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      }
    >
      {/* Company Info Card */}
      <CompanyInfoCard
        companyName={companyName}
        registrationNumber={registrationNumber}
        address={address}
        contact={contact}
        onEdit={() => setEditDialogOpen(true)}
      />

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon="file-check"
          trend={{ value: "12%", direction: "up" }}
        />
        
        <StatCard
          title="Pending Documents"
          value={orders.filter(order => 
            order.status === "pending" || 
            order.status === "processing"
          ).length}
          icon="clock"
          trend={{ value: "Processing", direction: "neutral" }}
        />
        
        <StatCard
          title="Received Documents"
          value={orders.filter(order => order.status === "completed").length}
          icon="inbox"
          trend={{ value: "8%", direction: "up" }}
        />
        
        <StatCard
          title="Storage Used"
          value="768 MB"
          secondaryValue="of 2 GB"
          icon="hard-drive"
          progress={38}
        />
      </StatsGrid>

      {/* Order Table */}
      <OrderTable orders={orders} />

      {/* Actions and Activity Feed */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-2 mb-6">
        <QuickActions />
        <ActivityFeed />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Company Details</DialogTitle>
            <DialogDescription>
              Update your company information and contact details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="registration-number">Registration Number</Label>
              <Input
                id="registration-number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
