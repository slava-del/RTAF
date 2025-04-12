import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";

interface CompanyInfoProps {
  companyName: string;
  registrationNumber: string;
  address: string;
  contact: string;
  onEdit?: () => void;
}

export function CompanyInfoCard({ 
  companyName,
  registrationNumber,
  address,
  contact,
  onEdit 
}: CompanyInfoProps) {
  return (
    <Card className="bg-white shadow overflow-hidden mb-6">
      <CardHeader className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary to-primary-light">
        <h3 className="text-lg leading-6 font-medium text-white font-montserrat">
          Company Information
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-white/80">
          Basic details about your organization
        </p>
      </CardHeader>
      
      <CardContent className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Company Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{companyName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{registrationNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{address}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact</dt>
            <dd className="mt-1 text-sm text-gray-900">{contact}</dd>
          </div>
        </dl>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit}
          className="text-xs"
        >
          <Icon name="edit" className="mr-1 h-3.5 w-3.5" />
          Edit Details
        </Button>
      </CardFooter>
    </Card>
  );
}
