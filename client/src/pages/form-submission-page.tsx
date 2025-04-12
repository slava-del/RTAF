import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Icon } from "@/components/ui/icons";
import { DocumentUpload } from "@/components/shared/document-upload";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function FormSubmissionPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [formStep, setFormStep] = useState(1);
  const [hasConfirmedRequirements, setHasConfirmedRequirements] = useState(false);
  
  // Fetch the latest pending payment order
  const { data: pendingOrders = [] } = useQuery<Order[], Error>({
    queryKey: ["/api/orders"],
    select: (orders) => orders.filter(order => order.status === "pending payment"),
  });
  
  const currentOrder = pendingOrders.length > 0 ? pendingOrders[0] : undefined;
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order submitted",
        description: "Your order has been successfully submitted for processing."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      navigate("/received-documents");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleConfirmAndSend = () => {
    if (!currentOrder) {
      toast({
        title: "No order found",
        description: "Please create an order first.",
        variant: "destructive"
      });
      return;
    }
    
    updateOrderStatusMutation.mutate({ id: currentOrder.id, status: "processing" });
  };
  
  const handleProceedToNext = () => {
    setFormStep(step => step + 1);
  };
  
  const handleGoBack = () => {
    if (formStep > 1) {
      setFormStep(step => step - 1);
    } else {
      navigate("/pre-payment");
    }
  };
  
  // Check if an order is available
  if (!currentOrder) {
    return (
      <MainLayout
        breadcrumbItems={[
          { label: "Form Submission" }
        ]}
        title="Form Submission"
        description="Upload and send your documents for processing."
      >
        <Card>
          <CardContent className="py-10 text-center">
            <Icon name="file-question" className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending order found</h3>
            <p className="mb-6 text-gray-500">Please create an order first before proceeding to submission.</p>
            <Button onClick={() => navigate("/pre-payment")}>
              Create Order
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      breadcrumbItems={[
        { label: "Pre-Payment", href: "/pre-payment" },
        { label: "Form Submission" }
      ]}
      title="Form Submission"
      description="Review and submit your order for processing."
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 1 ? 'bg-primary' : 'bg-gray-300'} text-white`}>
              1
            </div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 2 ? 'bg-primary' : 'bg-gray-300'} text-white`}>
              2
            </div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 3 ? 'bg-primary' : 'bg-gray-300'} text-white`}>
              3
            </div>
          </div>
          <Progress value={(formStep / 3) * 100} className="w-1/2" />
        </div>
      </div>
      
      {formStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-6">
              Upload any additional documents that may be required for your order. These documents will be processed along with your data request.
            </p>
            <DocumentUpload />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleGoBack}>
              Back
            </Button>
            <Button onClick={handleProceedToNext}>
              Continue
              <Icon name="chevron-right" className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {formStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Icon name="info" className="h-4 w-4" />
              <AlertTitle>Important Notice</AlertTitle>
              <AlertDescription>
                Please verify all information is correct before proceeding. You will not be able to make changes after submission.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h3 className="font-medium">Order Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{currentOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{currentOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Document Type</p>
                  <p className="font-medium">{currentOrder.documentType.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Documents</p>
                  <p className="font-medium">{currentOrder.totalDocuments}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-medium">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">{currentOrder.price} MDL</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="font-medium text-yellow-600">Pending</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="confirm-requirements" 
                checked={hasConfirmedRequirements}
                onCheckedChange={(checked) => setHasConfirmedRequirements(checked === true)}
              />
              <Label htmlFor="confirm-requirements" className="text-sm">
                I confirm that all the provided information is correct and the document requirements are clear.
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleGoBack}>
              Back
            </Button>
            <Button 
              onClick={handleProceedToNext}
              disabled={!hasConfirmedRequirements}
            >
              Continue
              <Icon name="chevron-right" className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {formStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Final Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="text-green-800 font-medium flex items-center mb-2">
                <Icon name="check-circle" className="mr-2 h-5 w-5 text-green-600" />
                Ready for Submission
              </h3>
              <p className="text-green-700 text-sm">
                Your order is ready to be submitted for processing. Once submitted, you'll receive a confirmation email with the details of your order.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium flex items-center mb-2">
                <Icon name="file-check" className="mr-2 h-5 w-5 text-primary" />
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-medium">{currentOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Document Type:</span>
                  <span className="font-medium">{currentOrder.documentType.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Documents:</span>
                  <span className="font-medium">{currentOrder.totalDocuments}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-medium">{currentOrder.price} MDL</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-blue-800 font-medium flex items-center mb-2">
                <Icon name="info" className="mr-2 h-5 w-5 text-blue-600" />
                What Happens Next
              </h3>
              <p className="text-blue-700 text-sm">
                1. Your order will be processed immediately after submission.<br />
                2. You will receive progress updates via email and notifications.<br />
                3. Once complete, your documents will be available for download.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleGoBack}>
              Back
            </Button>
            <Button 
              onClick={handleConfirmAndSend}
              className="bg-green-600 hover:bg-green-700"
              disabled={updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <Icon name="check" className="mr-2 h-4 w-4" />
                  Confirm and Submit
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </MainLayout>
  );
}
