import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function RequireAuth({ children }) {
  const { user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    // You can render a spinner here instead of null.
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}