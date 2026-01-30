import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/**
 * ProtectedRoute - Wrapper for routes requiring authentication
 * 
 * Redirects to login if unauthenticated.
 * Handles role-based access control (admin vs landowner).
 * Shows loading state while auth initializes.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Child routes/components to render
 * @param {boolean} [props.requiresAdmin=false] - If true, requires admin privileges
 * @param {boolean} [props.disallowAdmin=false] - If true, redirects admins away (e.g., from landowner dashboard)
 */
const ProtectedRoute = ({
  children,
  requiresAdmin = false,
  disallowAdmin = false,
}) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-4 text-sm text-gray-600 shadow-sm">
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/landowner/dashboard" replace />;
  }

  if (disallowAdmin && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiresAdmin: PropTypes.bool,
  disallowAdmin: PropTypes.bool,
};

export default ProtectedRoute;
