import { Icon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <a
              href="#"
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Help Center"
            >
              <Icon name="help-circle" className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Documentation"
            >
              <Icon name="book-open" className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Contact"
            >
              <Icon name="headphones" className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Ministerul Energiei al Republicii Moldova. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
