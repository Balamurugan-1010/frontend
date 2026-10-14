import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin mb-4" />
        <p className="text-[#64748B] text-sm font-medium">Verifying recruiter authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/manager/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
