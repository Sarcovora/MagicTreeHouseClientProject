import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Download, Eye } from "lucide-react";
import UserAvatar from "../../components/common/UserAvatar";

const FormDetail = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockForm = {
      id: "1",
      title: "Carbon Credit Form",
      description: "Standard environmental assessment form for new project areas",
      lastEdited: "2023-05-15",
      pdfUrl: "/pdfs/carbonCreditForm.pdf",
      status: "Active",
      associatedMembers: [
        {
          id: 1,
          name: "Jane Doe",
          role: "Landowner",
          email: "jane@example.com",
          phone: "123-456-7890",
          avatar: null
        },
        {
          id: 2,
          name: "John Smith",
          role: "Project Manager",
          email: "john@example.com",
          phone: "123-456-7891",
          avatar: null
        },
        {
          id: 3,
          name: "Alice Johnson",
          role: "Environmental Specialist",
          email: "alice@example.com",
          phone: "123-456-7892",
          avatar: null
        }
      ],
      submissionHistory: [
        {
          date: "2023-05-15",
          action: "Form Created",
          user: "Jane Doe"
        },
        {
          date: "2023-05-16",
          action: "Form Updated",
          user: "John Smith"
        },
        {
          date: "2023-05-17",
          action: "Form Submitted",
          user: "Alice Johnson"
        }
      ]
    };

    setForm(mockForm);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/forms"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Forms
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
              <p className="text-gray-600 mt-2">{form.description}</p>
            </div>
            <div className="flex gap-4">
              <a
                href={form.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-5 h-5 mr-2" />
                View PDF
              </a>
              <a
                href={form.pdfUrl}
                download
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-5 h-5 mr-2" />
                Download
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Submission History</h2>
              <div className="space-y-4">
                {form.submissionHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{entry.action}</p>
                      <p className="text-sm text-gray-500">by {entry.user}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Associated Members</h2>
              <div className="space-y-6">
                {form.associatedMembers.map((member) => (
                  <div key={member.id} className="flex items-start space-x-4">
                    <UserAvatar name={member.name} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                      <div className="mt-2 space-y-1">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {member.email}
                        </a>
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormDetail;
