import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { Resident } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResidentsPage() {
  const [_, navigate] = useLocation();
  const [selectedResidents, setSelectedResidents] = useState<Resident[]>([]);
  const [source, setSource] = useState<"all" | "internal" | "external">("all");
  
  const { data: residents = [], isLoading } = useQuery<Resident[], Error>({
    queryKey: ["/api/residents", source !== "all" ? `?source=${source}` : ""],
  });

  const filteredResidents = source === "all" 
    ? residents 
    : residents.filter(resident => resident.source === source);

  const handleSelectResident = (resident: Resident) => {
    if (selectedResidents.some(r => r.id === resident.id)) {
      setSelectedResidents(selectedResidents.filter(r => r.id !== resident.id));
    } else {
      setSelectedResidents([...selectedResidents, resident]);
    }
  };

  const handleSelectAll = () => {
    if (selectedResidents.length === filteredResidents.length) {
      setSelectedResidents([]);
    } else {
      setSelectedResidents([...filteredResidents]);
    }
  };

  const handleProceedToFieldSelection = () => {
    if (selectedResidents.length > 0) {
      // In a real app, we'd store the selected residents in a context or query params
      navigate("/field-selection");
    }
  };

  const columns = [
    {
      header: "",
      accessorKey: (row: Resident) => row.id,
      cell: (row: Resident) => (
        <Checkbox
          checked={selectedResidents.some(r => r.id === row.id)}
          onCheckedChange={() => handleSelectResident(row)}
        />
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (row: Resident) => (
        <span className="font-medium">{row.name}</span>
      ),
    },
    {
      header: "ID",
      accessorKey: "residentId",
    },
    {
      header: "Address",
      accessorKey: "address",
    },
    {
      header: "Registration Date",
      accessorKey: "registrationDate",
      cell: (row: Resident) => formatDate(row.registrationDate),
    },
    {
      header: "Source",
      accessorKey: "source",
      cell: (row: Resident) => (
        <Badge variant="outline" className={row.source === "internal" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
          {row.source}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout
      breadcrumbItems={[{ label: "Residents Data" }]}
      title="Residents Database"
      description="View and manage resident records from both internal and external registries."
    >
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" onValueChange={(value) => setSource(value as "all" | "internal" | "external")}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Sources</TabsTrigger>
                <TabsTrigger value="internal">Internal Registry</TabsTrigger>
                <TabsTrigger value="external">External Registry</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  disabled={isLoading || filteredResidents.length === 0}
                >
                  {selectedResidents.length === filteredResidents.length && filteredResidents.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={handleProceedToFieldSelection}
                  disabled={selectedResidents.length === 0}
                >
                  <Icon name="chevron-right" className="mr-1 h-4 w-4" />
                  Proceed to Field Selection
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="pt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable
                  data={filteredResidents}
                  columns={columns}
                  searchField="name"
                />
              )}
            </TabsContent>
            
            <TabsContent value="internal" className="pt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable
                  data={filteredResidents}
                  columns={columns}
                  searchField="name"
                />
              )}
            </TabsContent>
            
            <TabsContent value="external" className="pt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable
                  data={filteredResidents}
                  columns={columns}
                  searchField="name"
                />
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Selected Residents ({selectedResidents.length})</h3>
        </CardHeader>
        <CardContent>
          {selectedResidents.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Icon name="users" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No residents selected. Select residents from the table above to proceed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedResidents.map(resident => (
                <div key={resident.id} className="border rounded-md p-3 bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{resident.name}</p>
                    <p className="text-sm text-gray-500">{resident.residentId}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSelectResident(resident)}
                  >
                    <Icon name="x-circle" className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedResidents.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleProceedToFieldSelection}>
            Continue to Field Selection
            <Icon name="chevron-right" className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </MainLayout>
  );
}
