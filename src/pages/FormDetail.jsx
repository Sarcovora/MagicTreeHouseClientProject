import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Save,
  Download,
  FileText,
  Edit,
  Check,
} from "lucide-react";
import Sidebar from "../components/layouts/SideBar";
import UserAvatar from "../components/common/UserAvatar";

/**
 * Form detail page showing form preview and associated members
 */
const FormDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock form data - replace with API call in production
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        
        // This is mock data - replace with API call
        const mockForms = [
          {
            id: "1",
            title: "Environmental Assessment Form",
            description: "Standard environmental assessment form for new project areas",
            lastEdited: "2023-05-15",
            formFields: [
              { id: "name", label: "Property Name", type: "text", required: true, value: "Oak Ridge" },
              { id: "address", label: "Property Address", type: "text", required: true, value: "123 Forest Lane" },
              { id: "acreage", label: "Total Acreage", type: "number", required: true, value: "45" },
              { id: "treeSpecies", label: "Existing Tree Species", type: "textarea", value: "Oak, Pine, Maple" },
              { id: "soilType", label: "Soil Type", type: "select", options: ["Clay", "Loam", "Sandy"], value: "Loam" }
            ],
            status: "Completed",
            createdDate: "2023-04-10",
            lastModified: "2023-05-15"
          },
          {
            id: "2",
            title: "Tree Inspection Report",
            description: "Form for recording tree health and condition",
            lastEdited: "2023-05-10",
            formFields: [
              { id: "location", label: "Inspection Location", type: "text", required: true, value: "North Section" },
              { id: "date", label: "Inspection Date", type: "date", required: true, value: "2023-05-10" },
              { id: "healthStatus", label: "Overall Health Status", type: "select", options: ["Excellent", "Good", "Fair", "Poor"], value: "Good" },
              { id: "notes", label: "Inspector Notes", type: "textarea", value: "Trees showing good growth patterns with minimal pest activity." }
            ],
            status: "In Progress",
            createdDate: "2023-05-01",
            lastModified: "2023-05-10"
          },
          {
            id: "3",
            title: "Wildlife Observation Log",
            description: "Form for documenting wildlife sightings in conservation areas",
            lastEdited: "2023-05-05",
            formFields: [
              { id: "observer", label: "Observer Name", type: "text", required: true, value: "John Naturalist" },
              { id: "date", label: "Observation Date", type: "date", required: true, value: "2023-05-05" },
              { id: "species", label: "Species Observed", type: "text", required: true, value: "Eastern Bluebird" },
              { id: "count", label: "Count", type: "number", required: true, value: "12" },
              { id: "behavior", label: "Observed Behavior", type: "textarea", value: "Nesting in oak trees, appears to be a family group with juveniles" },
              { id: "habitat", label: "Habitat Type", type: "select", options: ["Forest", "Meadow", "Wetland", "Riparian"], value: "Forest" }
            ],
            status: "Submitted",
            createdDate: "2023-04-25",
            lastModified: "2023-05-05"
          }
        ];
        
        const foundForm = mockForms.find(f => f.id === id);
        
        if (foundForm) {
          setForm(foundForm);
        } else {
          setError("Form not found");
        }
      } catch (err) {
        console.error("Error fetching form:", err);
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    };
    
    fetchForm();
  }, [id]);

  // Mock collaborators data
  const collaborators = [
    {
      id: 1,
      name: "Jane Doe",
      role: "Field Officer",
      email: "jane.doe@example.com",
      phone: "+1 (555) 123-4567",
      avatar: null,
    },
    {
      id: 2,
      name: "Alvin Doe",
      role: "Landowner",
      email: "alvin.doe@example.com",
      phone: "+1 (555) 987-6543",
      avatar: null,
    }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <button
            onClick={() => navigate("/forms")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Forms
          </button>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
            <p>{error || "Form not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/forms")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Forms
          </button>

          <h1 className="text-3xl font-bold mb-8">{form.title}</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form Content Section */}
            <div className="lg:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Form Details</h2>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      form.status === "Completed" ? "bg-green-100 text-green-800" : 
                      form.status === "In Progress" ? "bg-yellow-100 text-yellow-800" : 
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {form.status}
                    </span>
                  </div>
                </div>
                
                <p className="mb-6 text-gray-600">{form.description}</p>

                <div className="space-y-6">
                  {form.formFields.map(field => (
                    <div key={field.id} className="form-field">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                          value={field.value || ""}
                          rows={4}
                        />
                      ) : field.type === 'select' ? (
                        <select 
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                          value={field.value || ""}
                          disabled
                        >
                          {field.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                          value={field.value || ""}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4">Form History</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Created</span>
                    <span>{formatDate(form.createdDate)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Last modified</span>
                    <span>{formatDate(form.lastModified)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Status updated</span>
                    <span>{formatDate(form.lastModified)}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Associated Members Section */}
            <div className="lg:w-1/2">
              <div className="flex gap-4 mb-6">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 mr-2" />
                  Edit Form
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 mr-2" />
                  Submit Form
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-6">Associated Members</h2>

              <div className="space-y-6">
                {collaborators.map((user) => (
                  <div key={user.id} className="flex items-start gap-4">
                    <UserAvatar name={user.name} size={64} />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{user.name}</h3>
                      <div className="inline-block bg-gray-200 text-xs px-2 py-1 rounded-full mb-2">
                        {user.role}
                      </div>

                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg">
                  Cancel
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg flex items-center">
                  <Save size={18} className="mr-2" />
                  Save
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg ml-auto">
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormDetail;