/**
 * Curated lucide-react re-exports.
 *
 * THIS FILE is the ONLY place in pdomain-ui that imports directly from lucide-react.
 * All consumers must import icons from `@pdomain/pdomain-ui/icons`.
 * ESLint enforces this via the no-restricted-imports rule (with an override
 * that exempts this file only).
 */
export {
  AlertCircle,
  AlertTriangle, // design name: "alert"  (OQ-7: lucide ^0.400.0 uses AlertTriangle)
  Archive, // design name: "archive"
  ArrowDown, // design name: "arrowDown"
  ArrowLeftRight, // design name: "swap"  (OQ-8)
  ArrowRight, // design name: "arrowR"
  ArrowUp, // design name: "arrowUp"
  ArrowUpDown, // design name: "arrowUpDown"
  Bell, // design name: "bell"
  Check,
  CheckCircle, // design name: "checkCircle"
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy, // design name: "copy"
  Download, // design name: "download"
  Edit,
  Eye,
  EyeOff,
  File, // design name: "file"
  FileText, // design name: "fileText"
  Folder, // design name: "folder"
  FolderOpen,
  GitBranch,
  GripVertical, // design name: "grip"
  HardDrive, // design name: "hardDrive"
  Image, // design name: "image"
  Info,
  Keyboard,
  LayoutList,
  Link, // design name: "link"
  List,
  Loader2,
  Menu,
  Minus,
  Moon, // design name: "moon"
  MoreHorizontal,
  MoreVertical,
  Package, // design name: "package"
  PanelRightClose,
  Pause, // design name: "pause"
  Pin, // design name: "pin"
  PinOff, // design name: "pinOff"
  Play, // design name: "play"
  Plus,
  RefreshCw, // design name: "refresh"
  Scissors, // design name: "scissors"
  Search,
  Settings,
  Sparkles, // design name: "sparkles"
  Square,
  Sun, // design name: "sun"
  Trash2,
  Upload, // design name: "upload"
  Wrench, // design name: "wrench"
  X,
} from 'lucide-react';
