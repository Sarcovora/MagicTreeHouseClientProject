// src/features/admin/pages/ProjectDetail.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  MapPin,
  Trash2,
  User,
} from "lucide-react";
import Carousel from "../../../components/common/Carousel";
import InfoCard from "../../../components/common/InfoCard";
import InfoField from "../../../components/common/InfoField";
import apiService from "../../../services/apiService";

const formatDate = (value) => {
  if (!value) {
    return "Not recorded";
  }
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ensureText = (value, fallback = "Not provided") =>
  value ? String(value) : fallback;

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getProjectDetails(projectId);
        if (data) {
          setProject(data);
        } else {
          setError(`Project with ID ${projectId} not found.`);
        }
      } catch (err) {
        console.error("Failed to fetch project details:", err);
        setError("Could not load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!projectId) {
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete project "${project?.name || projectId}"? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }
    setError(null);
    try {
      await apiService.deleteProject(projectId);
      if (project?.seasonYear) {
        navigate(`/admin/seasons/${project.seasonYear}`);
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError(`Failed to delete project: ${err.message || "Please try again."}`);
    }
  };

  const handleGoBack = () => {
    if (project?.seasonYear) {
      navigate(`/admin/seasons/${project.seasonYear}`);
      return;
    }
    navigate("/admin/dashboard");
  };

  const beforePhotos = Array.isArray(project?.beforePhotoUrls)
    ? project.beforePhotoUrls.filter(Boolean)
    : [];
  const carouselPhotos =
    beforePhotos.length > 0
      ? beforePhotos
      : project?.image
      ? [project.image]
      : [];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-xl font-semibold text-red-600">
          Error Loading Project
        </h2>
        <p className="mb-6 text-gray-600">{error}</p>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mx-auto mt-6 flex items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center">Project data not found.</div>;
  }

  const primaryContactName = ensureText(
    project.ownerDisplayName || project.ownerFirstName || project.landowner
  );

  const associatedMemberFields = [
    {
      label: "Owner First Name or Organization",
      value: ensureText(project.ownerFirstName || project.landowner),
    },
    {
      label: "Owner Last Name or Site Name",
      value: ensureText(project.ownerDisplayName || project.landowner),
    },
    {
      label: "Email",
      value: project.email || project.contact?.email || "",
      href: project.email || project.contact?.email
        ? `mailto:${project.email || project.contact.email}`
        : undefined,
    },
  ];

  const activityDateFields = [
    {
      label: "Application Date",
      value: project.applicationDate ? formatDate(project.applicationDate) : "",
      placeholder: "Not recorded",
    },
    {
      label: "Consultation Date",
      value: project.consultationDate
        ? formatDate(project.consultationDate)
        : "",
      placeholder: "Not recorded",
    },
    {
      label: "Flagging Date",
      value: project.flaggingDate ? formatDate(project.flaggingDate) : "",
      placeholder: "Not recorded",
    },
    {
      label: "Planting Date",
      value: project.plantingDate ? formatDate(project.plantingDate) : "",
      placeholder: "Not recorded",
    },
  ];

  const quizScoreFields = [
    {
      label: "Quiz Score - Pre-consult",
      value: ensureText(project.quizScorePreConsultation, "Not recorded"),
      placeholder: "Not recorded",
    },
    {
      label: "Quiz Score - Post-planting",
      value: ensureText(project.quizScorePostPlanting, "Not recorded"),
      placeholder: "Not recorded",
    },
  ];

  const statusValueClass =
    project.status === "Active"
      ? "text-green-600"
      : project.status === "Completed"
      ? "text-blue-600"
      : "text-gray-700";

  const statusFields = [
    {
      label: "Status",
      value: project.status || "N/A",
      valueClassName: statusValueClass,
      placeholder: "N/A",
    },
    {
      label: "Season",
      value: project.seasonYear || "N/A",
      placeholder: "N/A",
    },
    {
      label: "Start Date",
      value: project.startDate ? formatDate(project.startDate) : "",
      placeholder: "Not recorded",
    },
  ];

  const hasQuizScores = quizScoreFields.some(
    (field) => field.value && field.value !== "Not recorded"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={handleGoBack}
            className="flex items-center text-sm text-gray-600 transition hover:text-gray-800"
            title={
              project?.seasonYear
                ? `Back to Season ${project.seasonYear}`
                : "Back to Dashboard"
            }
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>
          <div className="flex space-x-2">
            <Link
              to={`/admin/project/${projectId}/edit`}
              className="flex items-center rounded-lg px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={handleDeleteProject}
              className="flex items-center rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        {error && (
          <div className="mb-4 flex items-center justify-center rounded-lg bg-red-100 p-3 text-center text-red-500 shadow-sm">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {carouselPhotos.length > 0 ? (
              <Carousel
                images={carouselPhotos}
                className="mb-4 lg:mb-6"
                aspectClass="aspect-[4/3] lg:aspect-[3/2]"
              />
            ) : (
              <div className="mb-4 flex aspect-[4/3] max-h-[360px] items-center justify-center rounded-lg bg-gray-200 shadow-sm lg:mb-6">
                <p className="text-gray-500">No photos available</p>
              </div>
            )}

            <div className="space-y-2 text-gray-600">
              <h1 className="text-3xl font-bold text-gray-900">
                {project.name}
              </h1>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 flex-shrink-0" />
                <span>{project.address || "No property address recorded"}</span>
              </div>
              {project.location && (
                <div className="flex items-center">
                  <span className="ml-7">{project.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <InfoCard title="Associated Members">
              <div className="mb-1 flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {primaryContactName}
                  </p>
                  <p className="text-sm text-gray-500">Primary Contact</p>
                </div>
              </div>
              {associatedMemberFields.map(({ label, value, href }) => (
                <InfoField
                  key={label}
                  label={label}
                  value={value}
                  href={href}
                />
              ))}
            </InfoCard>

            <InfoCard title="Activity Dates">
              {activityDateFields.map(({ label, value, placeholder }) => (
                <InfoField
                  key={label}
                  label={label}
                  value={value}
                  placeholder={placeholder}
                />
              ))}
            </InfoCard>

            {(hasQuizScores || !quizScoreFields.every((f) => !f.value)) && (
              <InfoCard title="Quiz Scores">
                {quizScoreFields.map(({ label, value, placeholder }) => (
                  <InfoField
                    key={label}
                    label={label}
                    value={value}
                    placeholder={placeholder}
                  />
                ))}
              </InfoCard>
            )}

            <InfoCard title="Project Status">
              {statusFields.map(
                ({ label, value, valueClassName, placeholder }) => (
                  <InfoField
                    key={label}
                    label={label}
                    value={value}
                    valueClassName={valueClassName}
                    placeholder={placeholder}
                  />
                )
              )}
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
