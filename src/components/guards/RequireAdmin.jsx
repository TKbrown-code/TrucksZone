import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, isAdmin, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    // Non-admins go to the normal dashboard
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
}