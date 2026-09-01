import Shell from "./Shell";
import { LayoutDashboard, MessageSquare } from "lucide-react";

export default function AdminLayout() {
  return (
    <Shell
      title="CRM Panel"
      subtitle="Admin Dashboard"
      navItems={[
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/admin/feedbacks", label: "Customer Feedbacks", icon: MessageSquare },
      ]}
    />
  );
}
