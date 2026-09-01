import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./routes/PrivateRoute";

import Login from "./pages/Login";

import AdminLayout from "./layouts/AdminLayout";
import FranchiseLayout from "./layouts/FranchiseLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import FranchiseCustomersPage from "./pages/admin/FranchiseCustomersPage";
import FeedbacksPage from "./pages/admin/FeedbacksPage";

import FranchiseDashboard from "./pages/franchise/FranchiseDashboard";
import ViewCustomers from "./pages/franchise/ViewCustomers";
import Contacts from "./pages/franchise/Contacts";
import Rewards from "./pages/franchise/Rewards";
import Campaign from "./pages/franchise/Campaign";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* ADMIN (superadmin) */}
        <Route element={<PrivateRoute allowedRoles={["superadmin"]} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="franchises/:id" element={<FranchiseCustomersPage />} />
            <Route path="feedbacks" element={<FeedbacksPage />} />
          </Route>
        </Route>


        {/* FRANCHISE OWNER (sub admin) */}
        <Route element={<PrivateRoute allowedRoles={["franchise"]} />}>
          <Route path="/franchise" element={<FranchiseLayout />}>
            <Route index element={<FranchiseDashboard />} />
            <Route path="customers" element={<ViewCustomers />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="campaign" element={<Campaign />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
