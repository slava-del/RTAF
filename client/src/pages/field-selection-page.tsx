import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Icon } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";

// Example field groups
const FIELD_GROUPS = {
  financial: [
    { id: "income", name: "Income" },
    { id: "expenses", name: "Expenses" },
    { id: "tax", name: "Tax Information" },
    { id: "property", name: "Property Value" },
    { id: "utility", name: "Utility Payments" },
  ],
  personal: [
    { id: "name", name: "Full Name" },
    { id: "id", name: "ID Number" },
    { id: "dob", name: "Date of Birth" },
    { id: "gender", name: "Gender" },
    { id: "nationality", name: "Nationality" },
  ],
  administrative: [
    { id: "address", name: "Address" },
    { id: "registration", name: "Registration Date" },
    { id: "area", name: "Administrative Area" },
    { id: "status", name: "Residency Status" },
    { id: "documents", name: "Related Documents" },
  ],
  energy: [
    { id: "consumption", name: "Energy Consumption" },
    { id: "meter", name: "Meter Information" },
    { id: "provider", name: "Energy Provider" },
    { id: "history", name: "Payment History" },
    { id: "subsidies", name: "Energy Subsidies" },
  ],
};

// Sample preview data based on selected fields
const generatePreviewData = (selectedFields: string[]) => {
  const sampleData = [];
  
  for (let i = 1; i <= 3; i++) {
    const rowData: Record<string, string> = { id: `RES-${1000 + i}` };
    
    selectedFields.forEach(field => {
      switch (field) {
        case "name":
          rowData["name"] = ["Ion Popescu", "Maria Ionescu", "Vasile Rusu"][i-1];
          break;
        case "id":
          rowData["id"] = [`MD23049${i}1`, `MD23098${i}5`, `MD23034${i}1`][i-1];
          break;
        case "address":
          rowData["address"] = [
            "Str. Ștefan cel Mare 42, Chișinău", 
            "Str. București 23, Chișinău", 
            "Str. Alba Iulia 102, Chișinău"
          ][i-1];
          break;
        case "consumption":
          rowData["consumption"] = [`${120 + i * 10} kWh`, `${95 + i * 15} kWh`, `${150 + i * 5} kWh`][i-1];
          break;
        case "income":
          rowData["income"] = [`${5000 + i * 1000} MDL`, `${6200 + i * 800} MDL`, `${4800 + i * 1200} MDL`][i-1];
          break;
        case "meter":
          rowData["meter"] = [`EM-${10000 + i}`, `EM-${20000 + i}`, `EM-${30000 + i}`][i-1];
          break;
        default:
          rowData[field] = `Sample data for ${field}`;
      }
    });
    
    sampleData.push(rowData);
  }
  
  return sampleData;
};

export default function FieldSelectionPage() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("financial");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [documentType, setDocumentType] = useState<string>("xlsx");

  const handleFieldToggle = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const getSelectedFieldsFromGroup = (group: string) => {
    return FIELD_GROUPS[group as keyof typeof FIELD_GROUPS].filter(
      field => selectedFields.includes(field.id)
    );
  };

  const handleProceedToPrePayment = () => {
    if (selectedFields.length > 0) {
      navigate("/pre-payment");
    }
  };

  // Generate preview data based on selected fields
  const previewData = generatePreviewData(selectedFields);
  
  // Generate columns for the preview table
  const previewColumns = [
    { header: "ID", accessorKey: "id" },
    ...selectedFields.map(field => {
      // Find the field name in all groups
      let fieldName = field;
      for (const groupKey in FIELD_GROUPS) {
        const foundField = FIELD_GROUPS[groupKey as keyof typeof FIELD_GROUPS].find(f => f.id === field);
        if (foundField) {
          fieldName = foundField.name;
          break;
        }
      }
      return {
        header: fieldName,
        accessorKey: field,
      };
    }),
  ];

  return (
    <MainLayout
      breadcrumbItems={[
        { label: "Residents Data", href: "/residents" },
        { label: "Field Selection" },
      ]}
      title="Select Data Fields"
      description="Choose the specific fields and data types you want to include in your report."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field Selection Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Data Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="administrative">Administrative</TabsTrigger>
                  <TabsTrigger value="energy">Energy</TabsTrigger>
                </TabsList>
                
                {Object.keys(FIELD_GROUPS).map(groupKey => (
                  <TabsContent key={groupKey} value={groupKey} className="space-y-4">
                    {FIELD_GROUPS[groupKey as keyof typeof FIELD_GROUPS].map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label htmlFor={field.id} className="cursor-pointer">
                          {field.name}
                        </Label>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-type">Output Format</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="document-type" className="mt-1">
                      <SelectValue placeholder="Select output format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">
                        <div className="flex items-center">
                          <Icon name="file-spreadsheet" className="mr-2 h-4 w-4 text-green-600" />
                          Excel (.xlsx)
                        </div>
                      </SelectItem>
                      <SelectItem value="docx">
                        <div className="flex items-center">
                          <Icon name="file-text" className="mr-2 h-4 w-4 text-blue-600" />
                          Word (.docx)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleProceedToPrePayment}
                  disabled={selectedFields.length === 0}
                >
                  Continue to Pre-Payment
                  <Icon name="chevron-right" className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Selected Fields</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFields.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Icon name="info" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No fields selected. Select fields from the categories above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.keys(FIELD_GROUPS).map(groupKey => {
                    const fieldsInGroup = getSelectedFieldsFromGroup(groupKey);
                    if (fieldsInGroup.length === 0) return null;
                    
                    return (
                      <div key={groupKey}>
                        <h4 className="font-medium capitalize mb-2">{groupKey}</h4>
                        <ul className="space-y-1">
                          {fieldsInGroup.map(field => (
                            <li key={field.id} className="flex justify-between items-center text-sm">
                              <span>{field.name}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleFieldToggle(field.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Icon name="x" className="h-4 w-4 text-gray-400" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Preview Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFields.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
                  <Icon name="file-text" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No fields selected</h3>
                  <p>Select fields from the left panel to preview how your data will look.</p>
                </div>
              ) : (
                <DataTable
                  data={previewData}
                  columns={previewColumns}
                />
              )}
            </CardContent>
          </Card>
          
          {selectedFields.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => setSelectedFields([])}
              >
                Clear Selection
              </Button>
              <Button onClick={handleProceedToPrePayment}>
                Continue to Pre-Payment
                <Icon name="chevron-right" className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
