import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex items-center text-sm text-gray-500">
          <Link href="/">
            <a className="hover:text-primary transition-colors">Home</a>
          </Link>
          
          {items.map((item, i) => (
            <div key={i} className="flex items-center">
              <ChevronRight className="mx-2 h-4 w-4" />
              {item.href ? (
                <Link href={item.href}>
                  <a className="hover:text-primary transition-colors">
                    {item.label}
                  </a>
                </Link>
              ) : (
                <span className="text-primary font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
