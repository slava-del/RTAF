import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Order, Document } from "@shared/schema";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Icon } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

export default function ReceivedDocumentsPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // Fetch completed orders
  const { 
    data: orders = [], 
    isLoading: isOrdersLoading 
  } = useQuery<Order[], Error>({
    queryKey: ["/api/orders"],
    select: (orders) => orders.filter(order => order.status === "completed"),
  });
  
  // Fetch uploaded documents from /api/reports
  const { 
    data: documents = [], 
    isLoading: isDocumentsLoading 
  } = useQuery<Document[], Error>({
    queryKey: ["/api/reports"],
  });
  
  const handlePreviewDocument = (order: Order) => {
    setSelectedOrder(order);
    setPreviewDialogOpen(true);
  };
  
  const handleDownload = async (documentId: number) => {
    try {
      window.open(`/api/documents/${documentId}/download`, '_blank');
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  
  // Updated columns for the received reports tab
  const orderColumns = [
    {
      header: "ID",
      accessorKey: "id",
      cell: (row: Order) => <span>{row.id}</span>,
    },
    {
      header: "Document URL",
      accessorKey: "orderId",
      cell: (row: Order) => (
        <div className="flex items-center space-x-2">
          <Icon 
            name={row.documentType === "xlsx" ? "file-spreadsheet" : "file-text"} 
            className={`h-5 w-5 ${
              row.documentType === "xlsx" ? "text-green-600" : "text-blue-600"
            }`} 
          />
          <span className="font-medium text-primary">
            <a href="#" onClick={(e) => { e.preventDefault(); handlePreviewDocument(row); }}>
              Report-{row.orderId}.{row.documentType}
            </a>
          </span>
        </div>
      ),
    },
    {
      header: "Company Name",
      accessorKey: "company",
      cell: (row: Order) => <span>{row.company || "Unknown Company"}</span>,
    },
    {
      header: "Emergency Situation",
      accessorKey: "emergencySituation",
      cell: (row: Order) => (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          {row.emergencySituation || "None"}
        </Badge>
      ),
    },
    {
      header: "Sender",
      accessorKey: "sender",
      cell: (row: Order) => <span>{row.sender || "System Generated"}</span>,
    },
    {
      header: "Opened",
      accessorKey: "isOpened",
      cell: (row: Order) => (
        <Badge variant={row.isOpened ? "success" : "secondary"}>
          {row.isOpened ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Opened By",
      accessorKey: "openedBy",
      cell: (row: Order) => <span>{row.openedBy || "-"}</span>,
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: (row: Order) => formatDate(row.createdAt),
    },
    {
      header: "Updated At",
      accessorKey: "updatedAt",
      cell: (row: Order) => formatDate(row.updatedAt || row.createdAt),
    },
  ];
  
  // Updated columns for the uploaded documents tab
  const documentColumns = [
    {
      header: "ID",
      accessorKey: "id",
      cell: (row: Document) => <span>{row.id}</span>,
    },
    {
      header: "Document URL",
      accessorKey: "name",
      cell: (row: Document) => (
        <div className="flex items-center space-x-2">
          <Icon 
            name={row.type === "xlsx" ? "file-spreadsheet" : "file-text"} 
            className={`h-5 w-5 ${
              row.type === "xlsx" ? "text-green-600" : "text-blue-600"
            }`} 
          />
          <span className="font-medium text-primary">
            <a href="#" onClick={(e) => { 
              e.preventDefault(); 
              alert(`Viewing ${row.name}`);
            }}>
              {row.name}
            </a>
          </span>
        </div>
      ),
    },
    {
      header: "Company Name",
      accessorKey: "company",
      cell: (row: Document) => <span>{row.company || "Unknown Company"}</span>,
    },
    {
      header: "Receiver Name",
      accessorKey: "receiver",
      cell: (row: Document) => <span>{row.receiver || "System"}</span>,
    },
    {
      header: "Opened",
      accessorKey: "isOpened",
      cell: (row: Document) => (
        <Badge variant={row.isOpened ? "success" : "secondary"}>
          {row.isOpened ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Opened By",
      accessorKey: "openedBy",
      cell: (row: Document) => <span>{row.openedBy || "-"}</span>,
    },
    {
      header: "Created At",
      accessorKey: "uploadedAt",
      cell: (row: Document) => formatDate(row.uploadedAt),
    },
    {
      header: "Updated At",
      accessorKey: "updatedAt",
      cell: (row: Document) => formatDate(row.updatedAt || row.uploadedAt),
    },
  ];

  return (
    <MainLayout
      breadcrumbItems={[{ label: "Received Documents" }]}
      title="Received Documents"
      description="View and download your processed documents and reports."
    >
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <Tabs defaultValue="received">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="received">Received Reports</TabsTrigger>
                <TabsTrigger value="uploaded">Uploaded Documents</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" placeholder="Search documents..." />
                </div>
                <Button variant="outline" size="sm">
                  <Icon name="filter" className="mr-1 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
            
            <TabsContent value="received" className="pt-4">
              {isOrdersLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
                  <Icon name="inbox" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No received documents</h3>
                  <p>Once your orders are processed, your reports will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center space-y-0">
                        <div className="flex items-center gap-2">
                          <Icon 
                            name={order.documentType === "xlsx" ? "file-spreadsheet" : "file-text"} 
                            className={`h-5 w-5 ${
                              order.documentType === "xlsx" ? "text-green-600" : "text-blue-600"
                            }`} 
                          />
                          <CardTitle className="text-md font-medium">
                            <a href="#" onClick={(e) => { e.preventDefault(); handlePreviewDocument(order); }}>
                              Report-{order.orderId}.{order.documentType}
                            </a>
                          </CardTitle>
                        </div>
                        <div>
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            {order.emergencySituation || "None"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-500">ID</span>
                            <span>{order.id}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Company</span>
                            <span>{order.company || "Unknown"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Sender</span>
                            <span>{order.sender || "System"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Opened</span>
                            <Badge variant={order.isOpened ? "success" : "secondary"} className="w-fit">
                              {order.isOpened ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Opened By</span>
                            <span>{order.openedBy || "-"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Created</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePreviewDocument(order)}
                          >
                            <Icon name="eye" className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              alert(`Downloading ${order.orderId}`);
                            }}
                          >
                            <Icon name="download" className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="uploaded" className="pt-4">
              {isDocumentsLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
                  <Icon name="file-plus" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No uploaded documents</h3>
                  <p>You haven't uploaded any documents yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((document) => (
                    <Card key={document.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center space-y-0">
                        <div className="flex items-center gap-2">
                          <Icon 
                            name={document.type === "xlsx" ? "file-spreadsheet" : "file-text"} 
                            className={`h-5 w-5 ${
                              document.type === "xlsx" ? "text-green-600" : "text-blue-600"
                            }`} 
                          />
                          <CardTitle className="text-md font-medium">
                            <a href="#" onClick={(e) => { 
                              e.preventDefault(); 
                              alert(`Viewing ${document.name}`);
                            }}>
                              {document.name}
                            </a>
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-500">ID</span>
                            <span>{document.id}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Company</span>
                            <span>{document.company || "Unknown"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Receiver</span>
                            <span>{document.receiver || "System"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Opened</span>
                            <Badge variant={document.isOpened ? "success" : "secondary"} className="w-fit">
                              {document.isOpened ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Opened By</span>
                            <span>{document.openedBy || "-"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Created</span>
                            <span>{formatDate(document.uploadedAt)}</span>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              alert(`Viewing ${document.name}`);
                            }}
                          >
                            <Icon name="eye" className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(document.id)}
                          >
                            <Icon name="download" className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      
      {/* Document Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              Preview of report {selectedOrder?.orderId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="border-2 rounded-md p-8 h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Icon 
                name={selectedOrder?.documentType === "xlsx" ? "file-spreadsheet" : "file-text"} 
                className={`h-16 w-16 mx-auto mb-4 ${
                  selectedOrder?.documentType === "xlsx" ? "text-green-600" : "text-blue-600"
                }`} 
              />
              <h3 className="text-lg font-medium mb-2">Report Preview</h3>
              <p className="text-gray-500 mb-4">
                Preview is not available for this document type. Please download the file to view its contents.
              </p>
              <Button>
                <Icon name="download" className="mr-2 h-4 w-4" />
                Download to View
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
