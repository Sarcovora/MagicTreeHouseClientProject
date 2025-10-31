import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Download, Eye } from "lucide-react";
import { Document, Page } from "react-pdf";
import UserAvatar from "../../../components/common/UserAvatar";
import "../../../pdfWorker"; // Import the PDF worker configuration

const FormDetail = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

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

  const renderNavigation = () => {
    return (
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(pageNumber - 1)}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <p className="text-sm text-gray-600">
          Page {pageNumber} of {numPages}
        </p>
        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(pageNumber + 1)}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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

        {/* PDF Viewer Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Document Preview</h2>
            <div className="space-x-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Make Changes
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Another Action
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center border rounded-lg overflow-hidden">
            <div className="w-full overflow-auto max-h-[600px]">
              <Document
                file={form.pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="max-w-full"
                error="Failed to load PDF document. Please check if the file exists."
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  scale={1.0}
                />
              </Document>
            </div>
            {numPages && renderNavigation()}
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

            {/* Document Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Document Details</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  A short synopsis of the location and reforestation efforts.
                </p>
                <p className="text-gray-600">
                  Include net coverage and other carbon credit growth or stats that may be associated with the specific location.
                </p>
                <p className="text-gray-600">
                  This body of text can also serve as latest updates (can be imported from the notification section)
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Associated Members</h2>
              <div className="space-y-6">
                {form.associatedMembers.map((member) => (
                  <div key={member.id} className="flex flex-col space-y-4 p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
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
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200">
                        Assign User
                      </button>
                      <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                        Ping User
                      </button>
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
