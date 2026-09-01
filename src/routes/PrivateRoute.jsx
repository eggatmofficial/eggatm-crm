import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ allowedRoles }) {
  const { user } = useAuth();
  const token = localStorage.getItem("crm_token");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "superadmin") return <Navigate to="/admin" replace />;
    if (user.role === "franchise") return <Navigate to="/franchise" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
