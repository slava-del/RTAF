import { useState } from "react";
import { Order } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface OrderTableProps {
  orders: Order[];
  isLoading?: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  const [_, navigate] = useLocation();

  const columns = [
    {
      header: "Order ID",
      accessorKey: "orderId",
      cell: (row: Order) => (
        <span className="text-sm font-medium text-primary">{row.orderId}</span>
      ),
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (row: Order) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Order) => {
        const { bg, text } = getStatusColor(row.status);
        return (
          <Badge variant="outline" className={`${bg} ${text}`}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      header: "Total Documents",
      accessorKey: "totalDocuments",
      cell: (row: Order) => (
        <span className="text-sm text-gray-500">{row.totalDocuments}</span>
      ),
    },
    {
      header: "Type",
      accessorKey: "documentType",
      cell: (row: Order) => (
        <div className="flex items-center">
          <Icon
            name={
              row.documentType.toLowerCase() === "xlsx"
                ? "file-spreadsheet"
                : "file-text"
            }
            className={`mr-1 h-4 w-4 ${
              row.documentType.toLowerCase() === "xlsx"
                ? "text-green-600"
                : "text-blue-600"
            }`}
          />
          <span className="text-sm text-gray-500">{row.documentType}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: (row: Order) => row.id,
      cell: (row: Order) => (
        <div className="flex justify-end space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-light hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/orders/${row.id}`);
            }}
          >
            <Icon name="eye" className="mr-1 h-4 w-4" />
            View
          </Button>
          
          {row.status === "completed" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-light hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                // Handle download
              }}
            >
              <Icon name="download" className="mr-1 h-4 w-4" />
              Download
            </Button>
          )}
          
          {row.status === "rejected" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-light hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                // Handle resubmit
              }}
            >
              <Icon name="refresh-cw" className="mr-1 h-4 w-4" />
              Resubmit
            </Button>
          )}
          
          {row.status === "pending payment" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-light hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/pre-payment?order=${row.id}`);
              }}
            >
              <Icon name="credit-card" className="mr-1 h-4 w-4" />
              Pay Now
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleRowClick = (row: Order) => {
    navigate(`/orders/${row.id}`);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 font-montserrat">
            Recent Orders
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Summary of your recent document requests and submissions
          </p>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 pb-5">
        <DataTable
          data={orders}
          columns={columns}
          searchField="orderId"
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
