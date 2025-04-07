// /Users/sahils/Desktop/clientProject/clientProject/frontend/src/pages/landowner/LandownerDashboard.jsx
import React from "react";

const LandownerDashboard = () => {
  // These would come from your backend in a real app
  const steps = [
    "Initial Contact",
    "Property Assessment",
    "Agreement",
    "Planning",
    "Implementation",
    "Monitoring",
    "Completion",
    "Maintenance",
  ];

  // Current step (this would come from your backend)
  const currentStep = 1;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Landowner Home</h1>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-medium mb-6">
          Please Complete the Required Steps
        </h2>

        {/* Progress Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 
                    ${
                      index <= currentStep
                        ? "bg-green-600"
                        : index === currentStep + 1
                        ? "bg-white border-2 border-green-600"
                        : "bg-gray-200"
                    }`}
                >
                  {index <= currentStep && (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandownerDashboard;
