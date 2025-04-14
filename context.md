Im creating a website for an organization. Here are the problems with the website that I eventually want you to fix in some order of priority (most to least). i want you to tell me advice and what you are going to do, then give me the whole file of code (don't say stuff like keep this the same) unless i specifically tell you otherwise. please keep modularity heavily in mind - i dont want files to get humongous or unreadable. then tell me the major changes you have done. wherever you can, go with a simple yet robust solution that doesnt reinvenvent the. wheel and isnt too overly complex.

- for the below requests, lmk if i have to make overhauling changes to achieve the funcionality i desire and implement them. if you lack files or context, lmk and i can provide it to you. It is helpful for both of us for all of the below if you ask qeustions, and then get a better idea of what you are going to do, tell me what you are going to do , get the get go from me, then implement it. dont provide code immediately but rather lmk of the approach you wil ltake and then ill approve or disprove. go in order of the requests below. 
- I have a lot of extraneous code or overly complex code. are there ways i can reduce complexity whilst preserving functionality? I think i have code bloat/useless files in some places - feel free to let me know and remove them
- Currently, I hardcoded many of the information fields and have no real sense of backend. i have a backend folder currently, but my partner is working on the backend. i will interact with the backend with methods like below in services.js

- Examples
    - GetLandownerInformation() ⇒ returns a json with name, contact, username, phone number, etc.
    - GetProjectStatus() ⇒ {active: bool (true/false), startDate: 2/24/18, endDate: 2/24/19)
    - GetAllSeason() ⇒ returns json with all valid seasons (e.g. 24-25, 25-26)
    - GetProjectsForSeason(”24-25”) ⇒ returns json like
    - {
        - “ABCD PARK”
            - Address: 201 Lane
            - Owner: Sahil Chowdhury
            - Date: 2/24/18
            - Description: A nice area owned by “ABCD” Park
        - “Drishti’s Home”
            - Address: 21 Lane
            - Owner: Drishti Gupta
            - Date: 5/28/20
            - Description: my crib
    - }
        - For these API calls, it would be ideal if we can link an image somehow. GetProjectsForSeason
    - AddNewFolder(”24-25”) ⇒ constructs a new folder
    - AddNewProject(Year, Title (e.g. ABCD Park),  Address, Owner, Date, Description) ⇒ adds new project under year

but right now i havent actually written much in the backend. the main thing is that i would like to start switching from hardcoding data to actually making requests to services.js (which in of itself can HARDCODE FOR NOW but, you should sturcture it in a way that it is VERY easy to change in the frontend code later to pull from the database). I plan to hardcode the examples currently in the services.js but edit them to use the backend later. This way, in the frontend, i can call the API calls above just fine regardless of whether they are hardcoded or not. the frontend will not change in this way, but rather just services.js
- I know in some sense, I have to carry "context" from one webpage to the next in my code. for example, once i press the folder 24-25, i should know i am under that year. i thought one approach was to do this  via dynamic routing, so i may need to change some code in App.jsx and mess with routing a little. this in turn will also make keeping tracking context easier and backend calls easier as our context is kind of in the url. but, is this the best way? should i instead maintain a stack of webpages or something? or is dynamic routing fine for this ? let me know and then we can decide after.
- Right now, i have all these folders. They have no projects under them, but in reality i do have projects. in some way, they are not "connected" clearly as these projects would appear under one of the years. I want you to connect them somehow. Also, subpoint, i want the folders to be clickable and lead me to the page of the respective projects.
- Again, all this information here should be easily retreived from a backend hook in services.js. be sure to change it.
- A lot of the buttons aren't clickable nor do the functionality they imply. I will now give you a series of button functioanlities you should implemenet in the following orer. try to reuse code and keep modularity in mind so you dont duplicate too much code
- add new folder does nothing but should allow you to add a folder. the only parameter needs to be year (2024-2025). a scrollbar for selecting year should be fine
- add new project doesnt do anything. it should give a form that allows you to upload an image (showing one of the images i show now is completely fine, as we will tackle the image problem later. try to make it easy however to change the way we retrieve the image as this will likely be hardcoded but changed to pull from supabase later), then all the relevant data displayed in the closer view of the card. e.g. title of project, landowner information (name, email, phone), project status (status (active/inactive), startDate, endDate), project description, project address, key metrics. in essence, we need to add the same data we are reading. 
- the attach new document doesn't actually do anything. make it attach a new document. it is fine for now if the document is always the same. but, it should look like a generic api call from the frotnend so i can easily change the functionality later.
- for the landowner side, there is no actualy text to help landowners complete the steps. i want you to just provide specific text and instructions to help the landowners proceed. in my idea, the steps would include a brief blurb or description followed by check boxes (with perhaps links or a short decription) that should all be checked. only after all of the checkboxes have been filled can we proceed to the next step. 
- we should also be able to easily remove a document. implement this functionality somehow. ALWAYS heed the generic api thing
- edit project doesnt actually allow you to edit the project
- back button brings you back to the folder selection but should bring you back to the active projects for the given year you were on.
- delete button doesnt actually delete.
- i think the documentSerivces and storageServices.js add code bloat and reinvent the wheel. how can i avoid depednences on htis whilst keeping my code clean and functional?
- the main place where i will get all this information is from AIRTABLE. i will probably interact with the airtable using the airtable javascript library. i think MOST data will come from the airtable, but not everyhting. for example, user auth for the entire app will probably need to be done separately. also, i dont know whether or not we can create images and store them using airtable. so, we are planning to use some combo of airtable and supabase with supabase being used for auth and image storage. is this a good solution? it seems to be cluttered and a be convoluated, but i couldnt find a better way

- the add new map tab doesn't work. 
- the map tab allows you to click on the image to add comments, but the comments arent stored! they should appear on the bottom.
- the upload photos and add photos button do not work at all.

- im unaware of where i can store pdfs. can i read and upload pdfs via api to and from airtable? or is supabase, like image storage, the way to go for pdf storage?
- the notificatinos tab is completely nonexistent. for the landowners, it should present outstanding notifcations per landowner.
- long term, i would like to implement a pinging/notif system. the idea is that the admin can click a user to notify, then that land ownder will receive a notif on their end. the ui for the notif page will prob be dif amongst both the landowenr and admin. 
- add some user login page. it should segregate by landowner/admin but only let landowners to sign up for now.

- the main place where i will get all this information is from AIRTABLE. i will probably interact with the airtable using the airtable javascript library. i think MOST data will come from the airtable, but not everyhting. for example, user auth for the entire app will probably need to be done separately. also, i dont know whether or not we can create images and store them using airtable. so, we are planning to use some combo of airtable and supabase with supabase being used for auth and image storage. is this a good solution? it seems to be cluttered and a be convoluated, but i couldnt find a better way
- make the treefolks logo go to the respective admin or landowner homepage (depends on who is viewing the dashboard).
- the bottom left user drop down doesnt do anything.


Here is the relevant code
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import ProjectDetail from "./pages/admin/ProjectDetail";
import Documents from "./pages/Documents";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentDetail from "./pages/DocumentDetail";
import Map from "./pages/Map";
import PhotoGallery from "./pages/PhotoGallery";
import Forms from "./pages/Forms";
import FormDetail from "./pages/admin/FormDetail";
import LandownerLayout from "./pages/landowner/LandownerLayout";
import LandownerDashboard from "./pages/landowner/LandownerDashboard";

// Temporary auth simulation - in real app, this would come from your auth system
const isAdmin = true; // Set to true to see admin view

/**
 * Main App component with routing configuration
 */
function App() {
  // Redirect to appropriate dashboard based on user role
  const defaultRedirect = isAdmin ? "/admin/dashboard" : "/landowner";

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to appropriate dashboard */}
        <Route path="/" element={<Navigate to={defaultRedirect} replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="project/:id" element={<ProjectDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="documents/upload" element={<DocumentUpload />} />
          <Route path="documents/:id" element={<DocumentDetail />} />
          <Route path="map" element={<Map />} />
          <Route path="gallery" element={<PhotoGallery />} />
          <Route path="forms" element={<Forms />} />
          <Route path="forms/:id" element={<FormDetail />} />
        </Route>

        {/* Landowner Routes */}
        <Route path="/landowner" element={<LandownerLayout />}>
          <Route index element={<LandownerDashboard />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

@tailwind base;
@tailwind components;
@tailwind utilities;

import { pdfjs } from 'react-pdf';
// Update path to match the file location in public/pdfs directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfs/pdf.min.js';
export default pdfjs;

services.js (empty)

AdminDashboard.js
import { useState } from "react";
import AddNewFolder from "../../assets/icons/AddNewFolder.svg?react";
import AddNewProject from "../../assets/icons/AddNewProject.svg?react";

import ProjectCard from "../../components/projects/ProjectCard";
import SeasonCard from "../../components/SeasonCard";
import SearchBar from "../../components/SearchBar";
import projectsData from "../../data/projectsData";

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState("seasons");
  const [searchTerm, setSearchTerm] = useState("");

  // Projects data is imported from projectsData.js

  // Sample seasons data
  const seasonsData = [
    { id: 1, year: "2024", projectCount: 0 },
    { id: 2, year: "2023", projectCount: 0 },
    { id: 3, year: "2022", projectCount: 0 },
    { id: 4, year: "2021", projectCount: 0 },
    { id: 5, year: "2020", projectCount: 0 },
    { id: 6, year: "2019", projectCount: 0 },
  ];

  // Filter projects based on search term
  const filteredProjects = projectsData.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.address && project.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.landowner && project.landowner.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              {viewMode === "projects"
                ? "Your Reforestation Projects"
                : "Your Reforestation Seasons"}
            </h1>
            <div className="mt-4">
              {viewMode === "seasons" ? (
                <AddNewFolder className="h-10 w-auto cursor-pointer" />
              ) : (
                <AddNewProject className="h-10 w-auto cursor-pointer" />
              )}
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                viewMode === "projects"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setViewMode("projects")}
            >
              Projects
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                viewMode === "seasons"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setViewMode("seasons")}
            >
              Seasons
            </button>
          </div>
        </div>

        <div className="mt-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {viewMode === "projects"
          ? filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          : seasonsData.map((season) => (
              <SeasonCard key={season.id} season={season} />
            ))}
      </div>
    </>
  );
};

export default AdminDashboard;

AdminLayout.js
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layouts/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;


FormDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Download, Eye } from "lucide-react";
import { Document, Page } from "react-pdf";
import UserAvatar from "../../components/common/UserAvatar";
import "../../pdfWorker"; // Import the PDF worker configuration

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

ProjectDetail.jsx
import { useNavigate, useParams } from "react-router-dom";
import {
  TreePine,
  User,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import projectsData from "../../data/projectsData";

/**
 * ProjectDetail component displays detailed information about a specific project
 */
const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find the project with the matching id
  const project =
    projectsData.find((p) => p.id === parseInt(id)) || projectsData[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Edit className="w-5 h-5 mr-2" />
              Edit Project
            </button>
            <button className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Project Image - Moved to the top */}
        {project.image && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-sm">
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{project.location || "No location specified"}</span>
            </div>
          </div>
          
          {/* Rest of your project content */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Project Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Project Description
              </h2>
              <p className="text-gray-600">{project.description}</p>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(project.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 mb-1">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Landowner Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Landowner Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{project.landowner}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{project.contact.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{project.contact.email}</span>
                </div>
              </div>
            </div>

            {/* Project Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Project Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-600 mb-1">Status</div>
                  <div className="font-semibold">{project.status}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Start Date</div>
                  <div className="font-semibold">{project.startDate}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Last Updated</div>
                  <div className="font-semibold">{project.lastUpdated}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

Landowner/DocumentDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Maximize,
  Download,
  FileText,
} from "lucide-react";
import Sidebar from "../components/layouts/AdminSidebar";
import storageService from "../services/storageService";
import UserAvatar from "../components/common/UserAvatar";

/**
 * Document detail page showing document preview and associated members
 */
const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock collaborators data - in a real app, this would come from your backend
  const [collaborators, setCollaborators] = useState([
    {
      id: 1,
      name: "Jane Doe",
      role: "Landowner",
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
    },
    {
      id: 3,
      name: "Theodore Doe",
      role: "TreeFolks Admin",
      email: "theodore.doe@treefolks.org",
      phone: "+1 (555) 456-7890",
      avatar: null,
    },
  ]);

  // Fetch document details
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const docs = storageService.getDocumentsFromStorage();
        const doc = docs.find((d) => d.id === id);

        if (doc) {
          setDocument(doc);
        } else {
          setError("Document not found");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

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

  // Handle assigning a user
  const handleAssignUser = (userId) => {
    // In a real app, this would update the document's collaborators
    console.log(`Assigning user ${userId} to document ${id}`);
    alert(`User assignment would be updated in a real application`);
  };

  // Handle making changes to the document
  const handleMakeChanges = () => {
    // In a real app, this might open an editor or form
    alert("This would allow editing the document in a real application");
  };

  // Handle another action (placeholder for additional functionality)
  const handleAnotherAction = () => {
    alert("This would trigger another action in a real application");
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

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
            <p>{error || "Document not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>

          <h1 className="text-3xl font-bold mb-8">{document.title}</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Document Preview Section */}
            <div className="lg:w-1/2">
              <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center relative mb-6">
                {document.fileType?.includes("image") ? (
                  <img
                    src={document.fileUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : document.fileType?.includes("pdf") ? (
                  <object
                    data={document.fileUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    className="rounded-lg"
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <FileText size={64} className="text-gray-400 mb-4" />
                      <p className="text-gray-600">PDF preview not available</p>
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Open PDF
                      </a>
                    </div>
                  </object>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FileText size={64} className="text-gray-400 mb-4" />
                    <p className="text-gray-600">Preview not available</p>
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Download File
                    </a>
                  </div>
                )}
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <Maximize size={20} />
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">Document Details:</h2>
                <p className="mb-4">
                  {document.description ||
                    "A short synopsis of the location and reforestation efforts."}
                </p>

                <p className="mb-4">
                  Include net coverage and other carbon credit growth or stats
                  that may be associated with the specific location.
                </p>

                <p className="mb-4">
                  This body of text can also serve as latest updates (can be
                  imported from the notification section)
                </p>

                <h3 className="text-lg font-bold mt-6 mb-2">Latest Updates:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Signed On:{" "}
                    {formatDate(document.signedDate || document.uploadDate)}
                  </li>
                  <li>
                    Last modified:{" "}
                    {formatDate(document.lastModified || document.uploadDate)}
                  </li>
                  <li>
                    Document Upload Date: {formatDate(document.uploadDate)}
                  </li>
                </ul>
              </div>
            </div>

            {/* Associated Members Section */}
            <div className="lg:w-1/2">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleMakeChanges}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                >
                  Make Changes
                </button>
                <button
                  onClick={handleAnotherAction}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                >
                  Another Action
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
                          <span className="bg-gray-200 h-4 w-48 rounded"></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <span className="bg-gray-200 h-4 w-48 rounded"></span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAssignUser(user.id)}
                        className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white py-1 px-4 rounded-lg text-sm"
                      >
                        Assign "user"
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg">
                  Cancel
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg">
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

export default DocumentDetail;


landownder Documents.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Search, Filter } from "lucide-react";
import DocumentCard from "../components/documents/DocumentCard";
import storageService from "../services/storageService";
import { DOCUMENT_CATEGORIES } from "../config/constants";
import { documentService } from "../services/documentService";

/**
 * Documents page component for displaying and managing documents
 */
const Documents = () => {
  const [documents, setDocuments] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Documents");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Categories for document filtering - moved to a constant that could be imported
  const categories = ["All Documents", ...DOCUMENT_CATEGORIES];

  // Fetch documents on component mount and when category changes
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const docs = await storageService.getDocuments(selectedCategory);
        console.log("Fetched documents:", docs); // Debug log
        setDocuments(docs || []); // Ensure we always set an array
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedCategory]);

  const handleFileUpload = async (file, category) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // File validation
      if (!file) throw new Error("No file selected");
      if (file.size > 10 * 1024 * 1024)
        throw new Error("File size exceeds 10MB limit");

      // Upload with progress tracking
      await documentService.uploadDocument(file, category, (progress) => {
        setUploadProgress(progress);
      });

      // Refresh document list after successful upload
      const newDocs = await documentService.getDocuments(selectedCategory);
      setDocuments(newDocs);

      // Reset states
      setUploadProgress(0);
      setIsUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message);
      setIsUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!documents) return <div>No documents found</div>;

  // Now documents is guaranteed to be an array
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.landowner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Documents</h1>

            <Link
              to="/documents/upload"
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Attach New Document
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative md:w-64">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg appearance-none bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText size={48} />
              <p className="mt-4 text-lg">No documents found</p>
              <p className="mt-2">Upload a document to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Add upload progress indicator */}
      {isUploading && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="w-full bg-gray-200 rounded-full">
            <div
              className="bg-green-500 rounded-full h-2"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm mt-2">Uploading: {uploadProgress}%</p>
        </div>
      )}

      {/* Show upload error if any */}
      {uploadError && (
        <div className="fixed top-4 right-4 bg-red-100 text-red-700 p-4 rounded-lg">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default Documents;

Landowner DocumentUpload.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowLeft, File, X } from "lucide-react";
import storageService from "../services/storageService";

/**
 * Component for uploading new documents
 */
const DocumentUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Property Maps",
    projectId: "",
    landowner: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Document categories
  const DOCUMENT_CATEGORIES = [
    "Property Maps",
    "Carbon Credit Agreements",
    "Applications",
    "Quiz Results",
    "Planting Reports",
    "Other",
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title with file name if title is empty
      if (!formData.title) {
        setFormData((prev) => ({
          ...prev,
          title: selectedFile.name.split(".")[0],
        }));
      }
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setFile(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!formData.title) {
      setError("Please enter a document title");
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      // Upload document using the storage service
      await storageService.uploadDocument(file, formData, (progress) =>
        setUploadProgress(progress)
      );

      // Navigate back to documents page after successful upload
      navigate("/documents");
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload document. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>
          <h1 className="text-2xl font-bold mb-8">Upload New Document</h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Document File
              </label>
              {!file ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX up to 10MB
                  </p>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <File className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            {/* Document Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-gray-700 font-medium mb-2"
              >
                Document Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            {/* Description */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-gray-700 font-medium mb-2"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            {/* Category */}
            <div className="mb-6">
              <label
                htmlFor="category"
                className="block text-gray-700 font-medium mb-2"
              >
                Document Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="projectId"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Project ID (Optional)
                </label>
                <input
                  type="text"
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="landowner"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Landowner (Optional)
                </label>
                <input
                  type="text"
                  id="landowner"
                  name="landowner"
                  value={formData.landowner}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            {/* Error Message */}
            {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Uploading: {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}
            {/* Map Upload Guidelines */}
            {formData.category === "Property Maps" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  Map Upload Guidelines
                </h3>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  <li>
                    Upload high-resolution images of property maps (minimum
                    1920x1080 pixels recommended)
                  </li>
                  <li>Use PNG or JPEG formats for best quality</li>
                  <li>
                    Avoid compressed or low-quality images to prevent blurriness
                  </li>
                  <li>
                    Maps will be displayed in the Map tab where you can add
                    comments by clicking on the map
                  </li>
                  <li>
                    Larger file sizes will preserve more detail (up to 10MB
                    recommended)
                  </li>
                </ul>
              </div>
            )}
            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;

Landowner forms.jsx
import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Forms = () => {
  // Sample forms data (replace with actual API calls later)
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

  // Filter forms based on search term
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

          {/* Search */}
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

          {/* Forms grid */}
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

Landowner Map.jsx
import { useState, useEffect } from "react";
import { MapPin, Image, Plus, Search, MessageCircle } from "lucide-react";
import storageService from "../services/storageService";

/**
 * Map page component for displaying property maps with comments
 */
const Map = () => {
  const [selectedMap, setSelectedMap] = useState(null);
  const [maps, setMaps] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newCommentPosition, setNewCommentPosition] = useState({ x: 0, y: 0 });
  const [newCommentText, setNewCommentText] = useState("");

  // Fetch maps on component mount
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true);
        // Get documents with category "Property Maps" - now returns a promise
        const docs = await storageService.getDocuments("Property Maps");
        console.log("Fetched maps with URLs:", docs);

        setMaps(docs);

        // Select the first map by default if available
        if (docs.length > 0) {
          setSelectedMap(docs[0]);
          loadCommentsForMap(docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching maps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();

    // Clean up blob URLs on unmount
    return () => {
      maps.forEach((map) => {
        if (map.fileUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(map.fileUrl);
        }
      });
    };
  }, []);

  // Load comments for a specific map
  const loadCommentsForMap = (mapId) => {
    // Implementation for loading comments
    // This would typically fetch from a database or local storage
    const mapComments = []; // Replace with actual comment loading logic
    setComments(mapComments);
  };

  // Handle map selection
  const handleMapSelect = (map) => {
    setImageLoading(true);
    setSelectedMap(map);
    loadCommentsForMap(map.id);
  };

  // Handle map click for adding comments
  const handleMapClick = (e) => {
    // Get click position relative to the map container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewCommentPosition({ x, y });
    setShowCommentModal(true);
  };

  // Handle image load event
  const handleImageLoad = () => {
    console.log("Image loaded successfully:", selectedMap?.title);
    setImageLoading(false);
  };

  // Handle image error event
  const handleImageError = () => {
    console.error("Failed to load image:", selectedMap);
    setImageLoading(false);
  };

  // Format date for comment timestamps
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Filter maps based on search term
  const filteredMaps = maps.filter(
    (map) =>
      map.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      map.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Property Maps</h1>

            <div className="flex space-x-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search maps..."
                  className="pl-10 p-2 border border-gray-300 rounded-lg w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <a
                href="/documents/upload"
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Map
              </a>
            </div>
          </div>

          {!loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Map List - Left Sidebar */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-bold text-lg mb-4">Available Maps</h2>

                {filteredMaps.length > 0 ? (
                  <div className="space-y-2">
                    {filteredMaps.map((map) => (
                      <div
                        key={map.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMap?.id === map.id
                            ? "bg-gray-100 border-l-4 border-gray-600"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleMapSelect(map)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                            <Image size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">{map.title}</h3>
                            <p className="text-sm text-gray-500 truncate">
                              {map.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No maps found
                  </p>
                )}
              </div>

              {/* Map Display - Right Content */}
              <div className="lg:col-span-3">
                {selectedMap ? (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="font-bold text-xl mb-4">
                      {selectedMap.title}
                    </h2>

                    {/* Map Container - Simple Image Display */}
                    <div
                      className="relative rounded-lg overflow-hidden"
                      style={{ height: "calc(100vh - 16rem)" }}
                      onClick={handleMapClick}
                    >
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
                        </div>
                      )}

                      {selectedMap.fileUrl ? (
                        <img
                          src={selectedMap.fileUrl}
                          alt={selectedMap.title}
                          className="w-full h-full object-contain"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-white">
                          <Image size={64} className="text-gray-400 mb-4" />
                          <p className="text-gray-600">
                            Map image not available
                          </p>
                        </div>
                      )}

                      {/* Map Comments */}
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="absolute cursor-pointer"
                          style={{
                            left: `${comment.x}%`,
                            top: `${comment.y}%`,
                          }}
                          title={comment.text}
                        >
                          <div className="relative">
                            <MessageCircle
                              size={24}
                              className="text-gray-600 fill-yellow-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comments Section */}
                    <div className="mt-4">
                      <h3 className="font-medium text-lg mb-2">
                        Comments ({comments.length})
                      </h3>
                      <div className="max-h-60 overflow-y-auto">
                        {comments.length > 0 ? (
                          comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-3 border-b border-gray-100"
                            >
                              <div className="flex justify-between items-start">
                                <p className="font-medium">{comment.author}</p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.timestamp)}
                                </span>
                              </div>
                              <p className="text-gray-700 mt-1">
                                {comment.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 p-3">
                            No comments yet. Click on the map to add a comment.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                    <MapPin size={64} className="text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      No Map Selected
                    </h3>
                    <p className="text-gray-500 text-center">
                      Select a map from the list or upload a new one to get
                      started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mb-4"></div>
              <h3 className="text-xl font-medium text-gray-700">
                Loading Maps...
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Comment</h3>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 h-32"
              placeholder="Enter your comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                onClick={() => {
                  // Implementation for adding comment
                  setShowCommentModal(false);
                }}
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;

Landownder PhotoGallery.jsx
import { useState, useEffect } from "react";
import {
  Image,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import storageService from "../services/storageService";

/**
 * Photo Gallery component for displaying property images
 */
const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fetch photos on component mount
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        // Get documents with image file types
        const docs = storageService.getDocuments();
        const imageFiles = docs.filter(
          (doc) =>
            doc.fileType?.startsWith("image/") &&
            doc.category !== "Property Maps" // Exclude maps
        );
        setPhotos(imageFiles);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Handle photo selection for lightbox
  const openLightbox = (photo) => {
    setImageLoading(true);
    setSelectedPhoto(photo);
    setLightboxOpen(true);
  };

  // Handle image load in lightbox
  const handleLightboxImageLoad = () => {
    setImageLoading(false);
  };

  // Navigate to next photo in lightbox
  const nextPhoto = () => {
    setImageLoading(true);
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[nextIndex]);
  };

  // Navigate to previous photo in lightbox
  const prevPhoto = () => {
    setImageLoading(true);
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIndex]);
  };

  // Filter photos based on search term
  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Photo Gallery</h1>

            <div className="flex space-x-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search photos..."
                  className="pl-10 p-2 border border-gray-300 rounded-lg w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <a
                href="/documents/upload"
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Photos
              </a>
            </div>
          </div>

          {!loading ? (
            filteredPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openLightbox(photo)}
                  >
                    <div className="h-48 relative">
                      {photo.fileUrl ? (
                        <img
                          src={photo.fileUrl}
                          alt={photo.title || photo.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Image size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium truncate">
                        {photo.title || photo.fileName}
                      </h3>
                      {photo.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64">
                <Image size={64} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Photos Found
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Upload photos to start building your gallery.
                </p>
                <a
                  href="/documents/upload"
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Photos
                </a>
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mb-4"></div>
              <h3 className="text-xl font-medium text-gray-700">
                Loading Photos...
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={24} />
          </button>

          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={prevPhoto}
          >
            <ChevronLeft size={32} />
          </button>

          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}

          <img
            src={selectedPhoto.fileUrl}
            alt={selectedPhoto.title || selectedPhoto.fileName}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onLoad={handleLightboxImageLoad}
          />

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={nextPhoto}
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            <h3 className="text-xl font-medium">
              {selectedPhoto.title || selectedPhoto.fileName}
            </h3>
            {selectedPhoto.description && (
              <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
                {selectedPhoto.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;

DocumentService.js (poentital code bloat)
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { storage, db } from "../config/firebase";

/**
 * Service for handling document operations with Firebase
 */
export const documentService = {
  /**
   * Upload a document to Firebase Storage and save metadata to Firestore
   * @param {File} file - The file to upload
   * @param {Object} metadata - Document metadata (title, description, etc.)
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} - Promise resolving to the uploaded document data
   */
  uploadDocument: async (file, metadata, progressCallback) => {
    try {
      // Create a storage reference
      const storageRef = ref(
        storage,
        `documents/${metadata.category}/${Date.now()}_${file.name}`
      );

      // Start the file upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Return a promise that resolves when the upload is complete
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Calculate and report progress
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressCallback) {
              progressCallback(progress);
            }
          },
          (error) => {
            // Handle upload errors
            reject(error);
          },
          async () => {
            // Upload completed successfully, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save document metadata to Firestore
            const docData = {
              ...metadata,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              fileUrl: downloadURL,
              uploadDate: new Date(),
            };

            const docRef = await addDoc(collection(db, "documents"), docData);

            // Resolve with the complete document data
            resolve({
              id: docRef.id,
              ...docData,
            });
          }
        );
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  /**
   * Get all documents from Firestore
   * @param {string} category - Optional category to filter documents
   * @returns {Promise<Array>} - Promise resolving to array of documents
   */
  getDocuments: async (category = null) => {
    try {
      let documentsQuery;

      if (category) {
        documentsQuery = query(
          collection(db, "documents"),
          where("category", "==", category)
        );
      } else {
        documentsQuery = collection(db, "documents");
      }

      const querySnapshot = await getDocs(documentsQuery);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting documents:", error);
      throw error;
    }
  },

  /**
   * Delete a document from both Storage and Firestore
   * @param {string} documentId - Firestore document ID
   * @param {string} fileUrl - Storage file URL
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  deleteDocument: async (documentId, fileUrl) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "documents", documentId));

      // Delete from Storage
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);

      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },
};

// Alternative default export if needed
export default documentService;

storageService.js

/**
 * Abstract storage service that can be easily switched between local storage and Firebase
 */
class StorageService {
  /**
   * Upload a document to storage
   * @param {File} file - The file to upload
   * @param {Object} metadata - Document metadata
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} - Promise resolving to the uploaded document data
   */
  async uploadDocument(file, metadata, progressCallback) {
    try {
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progressCallback) progressCallback(progress);
        if (progress >= 100) clearInterval(progressInterval);
      }, 300);

      // Create a local URL for the file
      const fileUrl = URL.createObjectURL(file);

      // Create document data
      const docData = {
        id: Date.now().toString(),
        ...metadata,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: fileUrl,
        uploadDate: new Date(),
        localFilePath: `documents/${metadata.category}/${Date.now()}_${
          file.name
        }`,
      };

      // Save to local storage
      const documents = this.getDocumentsFromStorage();
      documents.push(docData);
      localStorage.setItem("documents", JSON.stringify(documents));

      // Save the actual file to IndexedDB
      await this.saveFileToIndexedDB(file, docData.localFilePath);

      return docData;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  /**
   * Get all documents from storage
   * @param {string} category - Optional category filter
   * @returns {Array} - Array of documents
   */
  getDocuments(category = null) {
    try {
      const documents = this.getDocumentsFromStorage();

      if (category && category !== "All Documents") {
        return documents.filter((doc) => doc.category === category);
      }

      return documents;
    } catch (error) {
      console.error("Error getting documents:", error);
      return [];
    }
  }

  /**
   * Delete a document from storage
   * @param {string} documentId - Document ID
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  async deleteDocument(documentId) {
    try {
      const documents = this.getDocumentsFromStorage();
      const docIndex = documents.findIndex((doc) => doc.id === documentId);

      if (docIndex !== -1) {
        const docToDelete = documents[docIndex];

        // Remove from local storage
        documents.splice(docIndex, 1);
        localStorage.setItem("documents", JSON.stringify(documents));

        // Remove from IndexedDB
        await this.deleteFileFromIndexedDB(docToDelete.localFilePath);

        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(docToDelete.fileUrl);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  /**
   * Helper method to get documents from localStorage
   * @returns {Array} - Array of documents
   */
  getDocumentsFromStorage() {
    const documentsString = localStorage.getItem("documents");

    // Make sure we ALWAYS return an array, even if storage is empty
    if (!documentsString) {
      return [];
    }

    try {
      return JSON.parse(documentsString) || [];
    } catch (error) {
      console.error("Error parsing documents from storage:", error);
      // Return empty array on error instead of corrupted data
      return [];
    }
  }

  /**
   * Save file to IndexedDB for local storage
   * @param {File} file - The file to save
   * @param {string} path - The path to save the file to
   * @returns {Promise} - Promise resolving when save is complete
   */
  saveFileToIndexedDB(file, path) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DocumentsDB", 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "path" });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");

        const fileData = {
          path: path,
          data: file,
          timestamp: new Date().getTime(),
        };

        const storeRequest = store.put(fileData);

        storeRequest.onsuccess = () => resolve();
        storeRequest.onerror = () =>
          reject(new Error("Failed to save file to IndexedDB"));
      };

      request.onerror = () => reject(new Error("Failed to open IndexedDB"));
    });
  }

  /**
   * Delete file from IndexedDB
   * @param {string} path - The path of the file to delete
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  deleteFileFromIndexedDB(path) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DocumentsDB", 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");

        const deleteRequest = store.delete(path);

        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () =>
          reject(new Error("Failed to delete file from IndexedDB"));
      };

      request.onerror = () => reject(new Error("Failed to open IndexedDB"));
    });
  }

  /**
   * Get collaborators for a document
   * @param {string} documentId - Document ID
   * @returns {Array} - Array of collaborators
   */
  getDocumentCollaborators(documentId) {
    try {
      // In a real app, this would fetch from your database
      // For now, we'll return mock data
      return [
        {
          id: 1,
          name: "Jane Doe",
          role: "Landowner",
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
        },
        {
          id: 3,
          name: "Theodore Doe",
          role: "TreeFolks Admin",
          email: "theodore.doe@treefolks.org",
          phone: "+1 (555) 456-7890",
          avatar: null,
        },
      ];
    } catch (error) {
      console.error("Error getting document collaborators:", error);
      return [];
    }
  }

  /**
   * Add a collaborator to a document
   * @param {string} documentId - Document ID
   * @param {Object} collaborator - Collaborator data
   * @returns {Promise} - Promise resolving when addition is complete
   */
  async addDocumentCollaborator(documentId, collaborator) {
    try {
      // In a real app, this would update your database
      console.log(
        `Adding collaborator to document ${documentId}:`,
        collaborator
      );
      return { success: true };
    } catch (error) {
      console.error("Error adding document collaborator:", error);
      throw error;
    }
  }

  /**
   * Remove a collaborator from a document
   * @param {string} documentId - Document ID
   * @param {string} collaboratorId - Collaborator ID
   * @returns {Promise} - Promise resolving when removal is complete
   */
  async removeDocumentCollaborator(documentId, collaboratorId) {
    try {
      // In a real app, this would update your database
      console.log(
        `Removing collaborator ${collaboratorId} from document ${documentId}`
      );
      return { success: true };
    } catch (error) {
      console.error("Error removing document collaborator:", error);
      throw error;
    }
  }

  /**
   * Add a document to storage
   * @param {Object} document - Document to add
   * @returns {Promise} - Promise resolving to added document
   */
  async addDocument(document) {
    try {
      // Get existing documents
      const documents = this.getDocumentsFromStorage();

      // Add new document (with new ID)
      const newDocument = {
        ...document,
        id: document.id || this.generateId(),
        createdAt: document.createdAt || new Date().toISOString(),
      };

      // IMPORTANT: Append to existing array, don't replace it
      documents.push(newDocument);

      // Save updated documents array back to storage
      localStorage.setItem("documents", JSON.stringify(documents));

      // Save file to IndexedDB if needed
      if (document.file && document.localFilePath) {
        await this.saveFileToIndexedDB(document.file, document.localFilePath);
      }

      return newDocument;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  }

  /**
   * Get documents from storage with working file URLs
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} - Array of documents with working file URLs
   */
  async getDocuments(category = null) {
    try {
      const documents = this.getDocumentsFromStorage();

      // For each document with a localFilePath, ensure it has a working fileUrl
      const docsWithUrls = await Promise.all(
        documents.map(async (doc) => {
          if (doc.localFilePath) {
            // Get file from IndexedDB
            const file = await this.getFileFromIndexedDB(doc.localFilePath);
            if (file) {
              // If old blob URL exists, revoke it
              if (doc.fileUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(doc.fileUrl);
              }
              // Create new blob URL
              doc.fileUrl = URL.createObjectURL(
                new Blob([file], { type: doc.fileType })
              );
            }
          }
          return doc;
        })
      );

      // Filter by category if provided
      if (category) {
        return docsWithUrls.filter((doc) => doc.category === category);
      }

      return docsWithUrls;
    } catch (error) {
      console.error("Error getting documents:", error);
      return [];
    }
  }

  /**
   * Get file from IndexedDB
   * @param {string} path - File path
   * @returns {Promise<Blob|null>} File blob or null if not found
   */
  getFileFromIndexedDB(path) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DocumentsDB", 1);

      request.onerror = () => {
        console.error("IndexedDB error");
        resolve(null);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["files"], "readonly");
        const store = transaction.objectStore("files");
        const getRequest = store.get(path);

        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null);
        };

        getRequest.onerror = () => {
          console.error("Error getting file from IndexedDB");
          resolve(null);
        };
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "path" });
        }
      };
    });
  }
}

export default new StorageService();

data/projectsData.jos

/**
 * Mock project data for the application
 */
const projectsData = [
  {
    id: 1,
    name: "ABCD Park",
    landowner: "John Doe",
    location: "California",
    address: "Bee Caves, Austin TX",
    canopyGrowth: "15% increase",
    biodiversity: "24 species",
    image: "/images/project-images/forest_revival.jpg",
    contact: {
      phone: "+1 234 567 8900",
      email: "john@example.com",
    },
    metrics: {
      canopyGrowth: "15% increase",
      biodiversity: "24 species",
      carbonOffset: "150 tons",
      treesSurvival: "92%",
    },
    description:
      "A comprehensive reforestation project aimed at restoring native woodland...",
    status: "Active",
    startDate: "2023-01-15",
    lastUpdated: "2024-01-20",
  },
  {
    id: 2,
    name: "Forest Revival",
    landowner: "Jane Smith",
    location: "Oregon",
    address: "2100 Nueces St, Austin TX",
    canopyGrowth: "22% increase",
    biodiversity: "31 species",
    image: "/images/project-images/abcd_park.jpg",
    contact: {
      phone: "+1 345 678 9012",
      email: "jane@example.com",
    },
    metrics: {
      canopyGrowth: "22% increase",
      biodiversity: "31 species",
      carbonOffset: "180 tons",
      treesSurvival: "88%",
    },
    description:
      "A project focused on reviving forest ecosystems in the Pacific Northwest...",
    status: "Active",
    startDate: "2023-03-10",
    lastUpdated: "2024-02-15",
  },
  {
    id: 3,
    name: "Green Future",
    landowner: "Bob Wilson",
    location: "Washington",
    address: "123 Rio Grande St, Austin TX",
    canopyGrowth: "18% increase",
    biodiversity: "27 species",
    image: "/images/project-images/green_future.jpeg",
    contact: {
      phone: "+1 456 789 0123",
      email: "bob@example.com",
    },
    metrics: {
      canopyGrowth: "18% increase",
      biodiversity: "27 species",
      carbonOffset: "130 tons",
      treesSurvival: "95%",
    },
    description:
      "An innovative approach to urban reforestation in Washington state...",
    status: "Active",
    startDate: "2023-05-20",
    lastUpdated: "2024-01-30",
  },
];

export default projectsData;

config/firebase.js (i should remove this eventaully as i am not using firebase anymmore)
config/constants.js (not sure if i use this in my code)
/**
 * Application-wide constants
 */

// Document categories
export const DOCUMENT_CATEGORIES = [
  "Property Maps",
  "Carbon Credit Agreements",
  "Applications",
  "Quiz Results",
  "Planting Reports",
  "Other",
];

// Project statuses
export const PROJECT_STATUSES = ["Active", "Completed", "Pending", "Cancelled"];

// Default pagination settings
export const PAGINATION = {
  itemsPerPage: 10,
  maxPagesToShow: 5,
};


components/common/UserAvatar.jsx
import PropTypes from "prop-types";

/**
 * UserAvatar component displays a user's avatar or their initials if no avatar is available
 */
const UserAvatar = ({ name, size = 40, image = null }) => {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a consistent background color based on the name
  const getBackgroundColor = (name) => {
    if (!name) return "#CCCCCC";

    // Simple hash function to generate a number from a string
    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Use a predefined set of colors that match your design
    const colors = [
      "#68D391", // green
      "#4FD1C5", // teal
      "#76A9FA", // blue
      "#9F7AEA", // purple
      "#F687B3", // pink
      "#FC8181", // red
      "#F6AD55", // orange
      "#F6E05E", // yellow
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);
  const fontSize = Math.max(size / 2.5, 12); // Scale font size with avatar size

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        fontSize: `${fontSize}px`,
      }}
    >
      {initials}
    </div>
  );
};

UserAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  image: PropTypes.string,
};

export default UserAvatar;


Documents/documentCard.jsx
import PropTypes from "prop-types";
import {
  FileText,
  Download,
  Trash2,
  User,
  FileImage,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Component for displaying a document card
 */
const DocumentCard = ({ document, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Get file extension for icon display
  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toLowerCase();
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle document deletion
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        setIsDeleting(true);
        await onDelete(document.id);
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Determine icon based on file type
  const getFileIcon = () => {
    const extension = getFileExtension(document.fileName);

    switch (extension) {
      case "pdf":
        return <FileText size={40} className="text-red-500" />;
      case "doc":
      case "docx":
        return <FileText size={40} className="text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet size={40} className="text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage size={40} className="text-purple-500" />;
      case "html":
      case "css":
      case "js":
        return <FileCode size={40} className="text-yellow-500" />;
      default:
        return <FileText size={40} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Document Preview - Make this a link to the detail page */}
      <Link to={`/documents/${document.id}`}>
        <div className="h-40 bg-gray-100 flex items-center justify-center">
          {getFileIcon()}
        </div>
      </Link>

      {/* Document Info */}
      <div className="p-4">
        <Link to={`/documents/${document.id}`} className="hover:text-blue-600">
          <h3
            className="font-medium text-lg mb-1 truncate"
            title={document.title}
          >
            {document.title}
          </h3>
        </Link>

        <div
          className="text-sm text-gray-600 mb-3 truncate"
          title={document.description}
        >
          {document.description || "No description"}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            <p className="truncate" title={document.fileName}>
              {document.fileName}
            </p>
            <p>{formatFileSize(document.fileSize)}</p>
          </div>

          <div className="mt-3 flex items-center text-xs text-gray-500">
            <User size={14} className="mr-1" />
            <span>Uploaded {formatDate(document.uploadDate)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-3 flex justify-between">
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
          download={document.fileName}
        >
          <Download size={16} className="mr-1" />
          Download
        </a>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-gray-600 hover:text-red-600 flex items-center text-sm"
        >
          <Trash2 size={16} className="mr-1" />
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

DocumentCard.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    fileName: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    fileUrl: PropTypes.string.isRequired,
    uploadDate: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.object, // For Firestore Timestamps
      PropTypes.string, // For date strings
    ]).isRequired,
    category: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DocumentCard;


layouts/AdminSideBar.jsx
import {
  TreePine,
  Files,
  FormInput,
  Bell,
  Map,
  LogOut,
  Settings,
  ChevronDown,
  Home,
  FileText,
  ClipboardList,
  Image,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import TreeFolks from "../../assets/icons/treefolks.svg?react";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <TreePine size={24} />, label: "Properties", path: "/admin/properties" },
    { icon: <Files size={24} />, label: "Documents", path: "/admin/documents" },
    { icon: <FormInput size={24} />, label: "Forms", path: "/admin/forms" },
    { icon: <Bell size={24} />, label: "Notifications", path: "/admin/notifications" },
    { icon: <Map size={24} />, label: "Map", path: "/admin/map" },
    { icon: <Image size={24} />, label: "Photos", path: "/admin/gallery" },
  ];

  // Check if a path is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <TreeFolks className="w-32 h-32 text-green-600" />
          {/* <span className="text-xl font-semibold">TreeFolks</span> */}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mb-1 transition-colors ${
              isActive(item.path)
                ? "text-green-600 bg-green-50 border-l-4 border-green-600"
                : ""
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {/* You can replace this with an actual profile image */}
              <span className="text-gray-600 font-medium">JD</span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
          <ChevronDown size={20} className="text-gray-500" />
        </div>

        {/* Settings and Logout */}
        <div className="mt-4 space-y-2">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              /* Handle logout */
            }}
            className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

Layouts/LandownderSidebar.jsx
import {
  TreePine,
  Files,
  FormInput,
  Bell,
  Map,
  LogOut,
  Settings,
  ChevronDown,
  Home,
  FileText,
  ClipboardList,
  Image,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import TreeFolks from "../../assets/icons/treefolks.svg?react";

const LandownerSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <TreePine size={24} />, label: "Properties", path: "/properties" },
    { icon: <Files size={24} />, label: "Documents", path: "/documents" },
    { icon: <FormInput size={24} />, label: "Forms", path: "/forms" },
    {
      icon: <Bell size={24} />,
      label: "Notifications",
      path: "/notifications",
    },
    { icon: <Map size={24} />, label: "Map", path: "/map" },
    { icon: <Image size={24} />, label: "Photos", path: "/gallery" },
  ];

  // Check if a path is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <TreeFolks className="w-32 h-32 text-green-600" />
          {/* <span className="text-xl font-semibold">TreeFolks</span> */}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mb-1 transition-colors ${
              isActive(item.path)
                ? "text-green-600 bg-green-50 border-l-4 border-green-600"
                : ""
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {/* You can replace this with an actual profile image */}
              <span className="text-gray-600 font-medium">JD</span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
          <ChevronDown size={20} className="text-gray-500" />
        </div>

        {/* Settings and Logout */}
        <div className="mt-4 space-y-2">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              /* Handle logout */
            }}
            className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandownerSidebar;


Projects/projectCard.jsx



import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";

const ProjectCard = ({ project }) => {
  return (
<div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col">
{/* Image at the top */}
      {project.image ? (
        <div className="relative h-48 w-full">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-gray-200 h-48 flex items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      )}

      {/* Content below the image */}
      <div className="p-4 flex flex-col flex-1">

        <h3 className="font-medium text-lg mb-2">{project.name}</h3>

        {/* Address */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{project.address || "No address provided"}</span>
        </div>

        {/* Start Date */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          <span>
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "No date specified"}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
  {project.description}
</p>

<div className="mt-auto">
  <Link
    to={`/admin/project/${project.id}`}
    className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
  >
    View Details
  </Link>
</div>
      </div>
    </div>
  );
};

export default ProjectCard;

searchbar.jsx
// /Users/sahils/Desktop/clientProject/clientProject/frontend/src/components/SearchBar.jsx
const SearchBar = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search..."
      className="w-full p-2 border border-gray-300 rounded-lg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default SearchBar;

SeasonCard.jsx
// /Users/sahils/Desktop/clientProject/clientProject/frontend/src/components/seasons/SeasonCard.jsx
import Folder from "../assets/icons/folder.svg?react";

const SeasonCard = ({ season }) => {
  return (
    <div className="cursor-pointer transform transition-transform hover:scale-105">
      <div className="bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex items-center justify-center h-32 mb-4">
          <Folder className="w-40 h-40 text-gray-400" />
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-800">
          {season.year}
        </h3>
        <p className="text-center text-sm text-gray-500">
          {season.projectCount} {season.projectCount === 1 ? "project" : "projects"}
        </p>
      </div>
    </div>
  );
};

export default SeasonCard;

vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

AGAIN, I want you to tell me your approach for tackling each priority, then get the get go from me, then implement it in the respective files, adhering to modularity (creating files if needed) and giving me the full code.