import {
  AlertTriangle,
  Building2,
  Car,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  MapPin,
  Shield,
  Truck,
  UserCircle2,
  Users,
  Wrench,
} from 'lucide-react';

const ICONS = {
  Dashboard: LayoutDashboard,
  Requests: ClipboardList,
  Accounts: Users,
  Roles: Shield,
  Companies: Building2,
  'Company Staff': Users,
  'Incident Types': AlertTriangle,
  'Service Types': Wrench,
  'Company Profile': Building2,
  'Assigned Requests': ClipboardList,
  Staff: Users,
  Vehicles: Truck,
  'My Profile': UserCircle2,
  'My Assignments': ClipboardList,
  'My Requests': ClipboardList,
  'Create Request': FilePlus2,
  'My Vehicles': Car,
  Location: MapPin,
};

export function getMenuIcon(label) {
  return ICONS[label] || ClipboardList;
}
