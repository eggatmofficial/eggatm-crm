import Shell from "./Shell";
import { LayoutDashboard } from "lucide-react";

export default function AdminLayout() {
  return (
    <Shell
      title="CRM Panel"
      subtitle="Admin Dashboard"
      navItems={[
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      ]}
    />
  );
}

