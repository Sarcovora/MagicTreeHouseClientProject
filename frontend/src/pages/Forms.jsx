import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Forms = () => {
  // TODO: replace mock data with real API call when backend is ready
  const [forms, setForms] = useState([
    {
      id: 1,
      title: "Carbon Copy Form",
      description:
        "Standard environmental assessment form for new project areas",
      lastEdited: "2023-05-15",
    },
    {
      id: 2,
      title: "Tree Inspection Report",
      description: "Form for recording tree health and condition",
      lastEdited: "2023-05-10",
    },
    {
      id: 3,
      title: "Wildlife Observation Log",
      description:
        "Form for documenting wildlife sightings in conservation areas",
      lastEdited: "2023-05-05",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Forms</h1>
            <Link
              to="/admin/forms/create"
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Form
            </Link>
          </div>

          <div className="mb-8">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search forms..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
          ) : filteredForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <Link
                  key={form.id}
                  to={`/admin/forms/${form.id}`}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="text-green-600 w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">{form.title}</h3>
                  <p className="text-gray-500 mt-2 flex-grow">
                    {form.description}
                  </p>
                  <p className="text-sm text-gray-400 mt-4">
                    Last edited: {form.lastEdited}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FileText size={48} />
              <p className="mt-4 text-lg">No forms found</p>
              <p className="mt-2">Create a new form to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forms;
