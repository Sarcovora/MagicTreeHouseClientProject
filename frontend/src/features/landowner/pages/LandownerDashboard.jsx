import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../../services/apiService";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";

const LandownerDashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Don't fetch until auth is ready
    if (authLoading) {
      return;
    }

    // If no user after auth loading is done, they'll be redirected by ProtectedRoute
    if (!user) {
      return;
    }

    const fetchMyProjects = async () => {
      try {
        // Fetch all projects for the landowner
        const projects = await apiService.getLandownerProjects();
        
        if (projects && projects.length > 0) {
          // Redirect to the first project
          // The ProjectDetail page will handle fetching the full list again for the selector
          // to ensure deep linking to any project works correctly.
          navigate(`/landowner/project/${projects[0].id}`, { replace: true });
        } else {
          setError("No projects associated with your account.");
        }
      } catch (err) {
        console.error("Failed to fetch landowner projects:", err);
         if (err.response?.status === 404) {
             setError("We couldn't find any projects linked to your email address.");
         } else {
             setError("Unable to load your projects. Please try again later.");
         }
      }
    };

    fetchMyProjects();
  }, [navigate, user, authLoading]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Account Status</h1>
        <p className="mt-2 text-gray-600 max-w-md">{error}</p>
        <p className="mt-4 text-sm text-gray-500">
           If you believe this is a mistake, please contact support.
        </p>
        <button 
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="mt-4 font-medium text-gray-600">Loading your project...</p>
    </div>
  );
};

export default LandownerDashboard;
