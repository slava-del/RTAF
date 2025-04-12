import React from "react";
import {
  File,
  FileText,
  FileSpreadsheet,
  Upload,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Info,
  Bell,
  User,
  Building,
  Users,
  FileCheck,
  Inbox,
  Settings,
  HardDrive,
  ArrowUpRight,
  CreditCard,
  RefreshCw,
  Home,
  LogOut,
  ChevronRight,
  MessageSquare,
  Video,
  Calendar,
  Filter,
  Search,
  Edit,
  HelpCircle,
  BookOpen,
  HeadphonesIcon
} from "lucide-react";

export type IconName =
  | "file"
  | "file-text"
  | "file-spreadsheet"
  | "upload"
  | "download"
  | "eye"
  | "check-circle"
  | "x-circle"
  | "clock"
  | "alert-circle"
  | "info"
  | "bell"
  | "user"
  | "building"
  | "users"
  | "file-check"
  | "inbox"
  | "settings"
  | "hard-drive"
  | "arrow-up-right"
  | "credit-card"
  | "refresh-cw"
  | "home"
  | "logout"
  | "chevron-right"
  | "message-square"
  | "video"
  | "calendar"
  | "filter"
  | "search"
  | "edit"
  | "help-circle"
  | "book-open"
  | "headphones";

interface IconProps {
  name: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = "" }) => {
  const iconMap: Record<IconName, React.ReactNode> = {
    "file": <File />,
    "file-text": <FileText />,
    "file-spreadsheet": <FileSpreadsheet />,
    "upload": <Upload />,
    "download": <Download />,
    "eye": <Eye />,
    "check-circle": <CheckCircle />,
    "x-circle": <XCircle />,
    "clock": <Clock />,
    "alert-circle": <AlertCircle />,
    "info": <Info />,
    "bell": <Bell />,
    "user": <User />,
    "building": <Building />,
    "users": <Users />,
    "file-check": <FileCheck />,
    "inbox": <Inbox />,
    "settings": <Settings />,
    "hard-drive": <HardDrive />,
    "arrow-up-right": <ArrowUpRight />,
    "credit-card": <CreditCard />,
    "refresh-cw": <RefreshCw />,
    "home": <Home />,
    "logout": <LogOut />,
    "chevron-right": <ChevronRight />,
    "message-square": <MessageSquare />,
    "video": <Video />,
    "calendar": <Calendar />,
    "filter": <Filter />,
    "search": <Search />,
    "edit": <Edit />,
    "help-circle": <HelpCircle />,
    "book-open": <BookOpen />,
    "headphones": <HeadphonesIcon />
  };

  return (
    <span className={className}>
      {iconMap[name] || <File />}
    </span>
  );
};
