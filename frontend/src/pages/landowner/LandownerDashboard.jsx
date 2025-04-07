import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LandownerDashboard = () => {
  const steps = [
    { name: "Initial Assessment", description: "Property evaluation and initial consultation" },
    { name: "Site Planning", description: "Developing a customized reforestation plan" },
    { name: "Agreement", description: "Review and sign project agreement" },
    { name: "Site Preparation", description: "Preparing the land for planting" },
    { name: "Planting Phase", description: "Tree planting and initial care" },
    { name: "Monitoring", description: "Regular checks and maintenance" },
    { name: "Project Completion", description: "Final assessment and documentation" },
  ];

  const [currentStep, setCurrentStep] = useState(1);

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 bg-gray-50 px-4 py-8">
      {/* Welcome Section */}
      <div className="max-w-6xl w-full mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Your Reforestation Journey</h2>
        <p className="text-gray-600 mb-6">Track your progress and manage your reforestation project all in one place. Complete each step to move forward with your project.</p>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-medium text-green-700 mb-2">Current Phase</h3>
            <p className="text-green-600">Site Planning</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-700 mb-2">Next Action</h3>
            <p className="text-blue-600">Submit Property Documents</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-medium text-purple-700 mb-2">Project Status</h3>
            <p className="text-purple-600">On Track</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-6xl w-full mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
          Please Complete the Required Steps
        </h2>

        <div className="flex items-center justify-between space-x-4">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`p-2 rounded-full ${currentStep === 0 ? 'text-gray-400' : 'text-green-600 hover:bg-green-50'}`}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Progress Steps */}
          <div className="flex-1">
            {/* Steps */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300
                      ${index <= currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-white border-2 border-gray-300'}`}
                  >
                    {index <= currentStep ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-gray-500">{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-3 w-32 text-center">
                    <p className={`text-sm font-medium ${index <= currentStep ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={`p-2 rounded-full ${currentStep === steps.length - 1 ? 'text-gray-400' : 'text-green-600 hover:bg-green-50'}`}
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Space for future content */}
        <div className="h-32"></div>

        {/* Bottom section */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Next Steps</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Schedule site visit with our expert
              </li>
              <li className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Review preliminary assessment report
              </li>
              <li className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sign and return agreement documents
              </li>
            </ul>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Project Guidelines
              </li>
              <li className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Watch Tutorial Video
              </li>
              <li className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Contact Support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandownerDashboard;
