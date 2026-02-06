import { Navigate, useLocation } from "react-router-dom";
import { useRef } from "react";
import { useAuth } from '../Context/AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { currentUser, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const componentId = useRef(Math.random().toString(36).substring(7));

  const hasAccess = (routeRoles: string[]) => {
    if (!currentUser) return false;
    // Check for superuser first
    if (currentUser.is_superuser) return true;
    // Check for admin role
    if (currentUser.role === "admin") return true;
    return routeRoles.includes(currentUser.role);
  };

  console.log(
    `[PrivateRoute-${componentId.current}] Path: ${location.pathname}, Roles: ${JSON.stringify(allowedRoles)}, Loading: ${isLoading}, User: ${currentUser ? currentUser.username : "null"}, Authenticated: ${isAuthenticated}`,
  );

  // Show loading screen while auth state is being determined
  if (isLoading) {
    console.log(
      `[PrivateRoute-${componentId.current}] Showing loading screen, auth is loading`,
    );
    return <div>Loading...</div>;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated || !currentUser) {
    console.log(
      `[PrivateRoute-${componentId.current}] Not authenticated, redirecting to login`,
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route requires specific roles and if user has required role
  if (allowedRoles && !hasAccess(allowedRoles)) {
    console.log(
      `[PrivateRoute-${componentId.current}] User role '${currentUser?.role}' not in allowed roles ${JSON.stringify(allowedRoles)}`,
    );

    // For unauthorized roles, redirect to announcements page
    return <Navigate to="/announcements" replace />;
  }

  console.log(
    `[PrivateRoute-${componentId.current}] Rendering children for user ${currentUser.username} with role ${currentUser.role}`,
  );
  return <>{children}</>;
}
