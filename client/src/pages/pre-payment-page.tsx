import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generateOrderId } from "@/lib/utils";
import { Icon } from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export default function PrePaymentPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Order details state
  const [documentPackage, setDocumentPackage] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [documentType, setDocumentType] = useState("xlsx");
  const [pricePerUnit, setPricePerUnit] = useState(50);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Calculate total
  const totalCost = quantity * pricePerUnit;
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order created",
        description: `Your order ${data.orderId} has been created successfully.`
      });
      navigate("/form-submission");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create order",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your order draft has been saved."
    });
  };
  
  const handleProceedToPayment = () => {
    const orderData = {
      orderId: generateOrderId(),
      status: "pending payment",
      totalDocuments: quantity,
      documentType,
      price: totalCost
    };
    
    createOrderMutation.mutate(orderData);
  };
  
  // Package options with prices
  const packageOptions = [
    { id: "basic", name: "Basic Package", price: 25, description: "Essential fields only" },
    { id: "standard", name: "Standard Package", price: 50, description: "All common fields" },
    { id: "premium", name: "Premium Package", price: 100, description: "All fields + enhanced analytics" }
  ];
  
  // Get selected package details
  const selectedPackage = packageOptions.find(pkg => pkg.id === documentPackage) || packageOptions[1];

  return (
    <MainLayout
      breadcrumbItems={[
        { label: "Residents Data", href: "/residents" },
        { label: "Field Selection", href: "/field-selection" },
        { label: "Pre-Payment" }
      ]}
      title="Create Order"
      description="Review and confirm your document package details before proceeding to payment."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Document Package */}
              <div className="space-y-2">
                <Label htmlFor="document-package">Document Package</Label>
                <Select value={documentPackage} onValueChange={(value) => {
                  setDocumentPackage(value);
                  // Update price based on selected package
                  const pkg = packageOptions.find(p => p.id === value);
                  if (pkg) setPricePerUnit(pkg.price);
                }}>
                  <SelectTrigger id="document-package">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packageOptions.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <div>
                          <span className="font-medium">{pkg.name}</span>
                          <span className="ml-2 text-gray-500">({pkg.price} MDL)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">{selectedPackage.description}</p>
              </div>
              
              {/* Document Type */}
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select document type" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                    max={100}
                  />
                </div>
                
                {/* Delivery Date */}
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="delivery-date"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price Per Unit */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price Per Unit (MDL)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(parseInt(e.target.value) || 0)}
                    disabled
                  />
                </div>
                
                {/* Total Cost */}
                <div className="space-y-2">
                  <Label htmlFor="total-cost">Total Cost (MDL)</Label>
                  <Input
                    id="total-cost"
                    type="number"
                    value={totalCost}
                    readOnly
                    className="font-bold"
                  />
                </div>
              </div>
              
              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Any special requirements or instructions..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Icon name="save" className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button 
                onClick={handleProceedToPayment}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <>Processing...</>
                ) : (
                  <>
                    Proceed to Payment
                    <Icon name="chevron-right" className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Package:</span>
                <span className="font-medium">{selectedPackage.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Document Type:</span>
                <div className="flex items-center">
                  <Icon 
                    name={documentType === "xlsx" ? "file-spreadsheet" : "file-text"} 
                    className={`mr-1 h-4 w-4 ${
                      documentType === "xlsx" ? "text-green-600" : "text-blue-600"
                    }`} 
                  />
                  <span>{documentType.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Quantity:</span>
                <span>{quantity}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Price Per Unit:</span>
                <span>{pricePerUnit} MDL</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center font-bold">
                <span>Total:</span>
                <span>{totalCost} MDL</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Delivery Date:</span>
                <span>{date ? format(date, "MMM d, yyyy") : "Not selected"}</span>
              </div>
              
              <Separator />
              
              <div className="bg-primary-50 p-4 rounded-md">
                <h4 className="font-medium text-primary mb-2 flex items-center">
                  <Icon name="info" className="mr-2 h-4 w-4" />
                  Order Information
                </h4>
                <p className="text-sm text-gray-700">
                  Your order will be processed once payment is confirmed. You'll receive a notification when your documents are ready.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
