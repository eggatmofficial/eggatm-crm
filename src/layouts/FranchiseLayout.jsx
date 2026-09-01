import Shell from "./Shell";
import { LayoutDashboard, Users, Gift,BookUser  } from "lucide-react";

export default function FranchiseLayout() {
  return (
    <Shell
      title="CRM Panel"
      subtitle="Franchise Owner"
      navItems={[
        { to: "/franchise", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/franchise/customers", label: "Customers", icon: Users },
        { to: "/franchise/contacts", label: "Contacts", icon: BookUser },
        { to: "/franchise/rewards", label: "Rewards", icon: Gift },
      ]}
    />
  );
}
