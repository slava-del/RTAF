import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function generateOrderId(): string {
  const prefix = 'ORD';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${randomNum}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getDocumentIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'xlsx':
      return 'file-spreadsheet';
    case 'docx':
      return 'file-text';
    default:
      return 'file';
  }
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
} {
  switch (status.toLowerCase()) {
    case 'completed':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'processing':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    case 'pending':
    case 'pending payment':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'rejected':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

export function getNotificationIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'success':
      return 'check';
    case 'error':
      return 'x';
    case 'warning':
      return 'alert-triangle';
    case 'info':
    default:
      return 'info';
  }
}

export function getNotificationColor(type: string): {
  bg: string;
  text: string;
} {
  switch (type.toLowerCase()) {
    case 'success':
      return { bg: 'bg-green-100', text: 'text-green-600' };
    case 'error':
      return { bg: 'bg-red-100', text: 'text-red-600' };
    case 'warning':
      return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
    case 'info':
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-600' };
  }
}
