// src/pages/landowner/LandownerDashboard.jsx
import React, { useState, useMemo } from "react"; // Added useMemo
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"; // Added CheckCircle

// --- Define Step Data (Same as before) ---
const stepsData = [
    { id: 0, name: "Initial Assessment", description: "Property evaluation and initial consultation", details: 'Evaluate your property\'s potential and discuss goals. Complete the following:', tasks: [{ id: 'task0_1', label: 'Schedule site visit with our expert.' },{ id: 'task0_2', label: 'Review preliminary assessment report.' },{ id: 'task0_3', label: 'Confirm understanding of program requirements.' },], nextAction: 'Submit Property Docs', nextStepsDescription: 'Prepare and submit required property documents.', resources: [{ label: 'Download Project Guidelines', link: '#' }, { label: 'Watch Introduction Video', link: '#' }, { label: 'Contact Support', link: '#' }] },
    { id: 1, name: "Site Planning", description: "Developing a customized reforestation plan", details: 'Developing a customized plan. Review and approve:', tasks: [{ id: 'task1_1', label: 'Review draft reforestation plan document.' },{ id: 'task1_2', label: 'Provide feedback/approval on species selection.' },{ id: 'task1_3', label: 'Confirm planting zones via online map tool.' },{ id: 'task1_4', label: 'Acknowledge site preparation needs.' },], nextAction: 'Sign Agreement', nextStepsDescription: 'Review and sign the formal agreement.', resources: [{ label: 'Understanding Your Plan', link: '#' }, { label: 'Access Map Tool', link: '#' }] },
    { id: 2, name: "Agreement", description: "Review and sign project agreement", details: 'Review and sign the official project agreement.', tasks: [{ id: 'task2_1', label: 'Review the Project Agreement PDF.' },{ id: 'task2_2', label: 'Electronically sign the agreement.' },{ id: 'task2_3', label: 'Download signed agreement copy.' },], nextAction: 'Begin Site Prep', nextStepsDescription: 'Start preparing planting areas.', resources: [{ label: 'View Project Agreement', link: '#' }, { label: 'Access Signing Portal', link: '#' }] },
    { id: 3, name: "Site Preparation", description: "Preparing the land for planting", details: 'Preparing the land for planting.', tasks: [{ id: 'task3_1', label: 'Confirm clearing of planting zones.' },{ id: 'task3_2', label: 'Verify soil preparation (if required).' },{ id: 'task3_3', label: 'Upload site readiness photos.' },], nextAction: 'Schedule Planting', nextStepsDescription: 'Coordinate tree delivery and planting.', resources: [{ label: 'Site Prep Guide', link: '#' }, { label: 'Upload Documentation', link: '#' }] },
    { id: 4, name: "Planting Phase", description: "Tree planting and initial care", details: 'Trees delivered and planted.', tasks: [{ id: 'task4_1', label: 'Confirm tree delivery receipt.' },{ id: 'task4_2', label: 'Acknowledge planting completion.' },{ id: 'task4_3', label: 'Review initial care instructions.' },], nextAction: 'Begin Monitoring', nextStepsDescription: 'Start regular monitoring.', resources: [{ label: 'Initial Tree Care Guide', link: '#' }, { label: 'Report Planting Issues', link: '#' }] },
    { id: 5, name: "Monitoring", description: "Regular checks and maintenance", details: 'Regular checks and maintenance.', tasks: [{ id: 'task5_1', label: 'Submit first monitoring report (3 months).' },{ id: 'task5_2', label: 'Submit second monitoring report (6 months).' },{ id: 'task5_3', label: 'Report significant issues.' },{ id: 'task5_4', label: 'Upload monitoring photos (optional).' },], nextAction: 'Await Final Assessment', nextStepsDescription: 'Continue monitoring until review.', resources: [{ label: 'Monitoring Guidelines', link: '#' }, { label: 'Submit Report Form', link: '#' }] },
    { id: 6, name: "Project Completion", description: "Final assessment and documentation", details: 'Final assessment and handover.', tasks: [{ id: 'task6_1', label: 'Participate in final site visit.' },{ id: 'task6_2', label: 'Review final project report.' },{ id: 'task6_3', label: 'Acknowledge final documentation.' },], nextAction: 'Project Complete!', nextStepsDescription: 'Congratulations!', resources: [{ label: 'View Final Report', link: '#' }, { label: 'Long-term Care Tips', link: '#' }] },
];

// Initialize task state (Same as before)
const initializeTaskState = () => {
  const initialState = {};
  stepsData.forEach(step => {
    initialState[step.id] = {};
    step.tasks.forEach(task => {
      initialState[step.id][task.id] = false; // Default to false
    });
  });
  return initialState;
};


const LandownerDashboard = () => {
  // Use the index for current step to match the original logic
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Add task status state
  const [taskStatus, setTaskStatus] = useState(initializeTaskState());

  // Find the active step data based on the index
  const activeStep = stepsData[currentStepIndex];
  // Keep original steps array for stepper mapping if needed, but use stepsData for content
  const steps = stepsData; // Use the detailed data

  // Calculate if tasks for the *current* step are complete
  const areCurrentStepTasksComplete = useMemo(() => {
    if (!activeStep) return false;
    const currentTasksState = taskStatus[activeStep.id];
    if (!currentTasksState) return false; // Handle case where state might not be initialized yet
    return activeStep.tasks.every(task => currentTasksState[task.id]);
  }, [activeStep, taskStatus]);

  // Checkbox change handler
  const handleCheckboxChange = (stepId, taskId) => {
    setTaskStatus(prevStatus => ({
      ...prevStatus,
      [stepId]: {
        ...prevStatus[stepId],
        [taskId]: !prevStatus[stepId]?.[taskId], // Toggle status
      },
    }));
  };

  // Modify original handlers to use new logic and check task completion
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    // Only allow moving next if tasks are complete OR if it's the final step already
     if ((areCurrentStepTasksComplete || currentStepIndex === steps.length - 1) && currentStepIndex < steps.length - 1) {
       setCurrentStepIndex(currentStepIndex + 1);
     }
     // Optional: Add user feedback if they try to advance without completing tasks
     else if (!areCurrentStepTasksComplete && currentStepIndex < steps.length - 1) {
         alert("Please complete all tasks for the current step before proceeding.");
     }
  };

  // --- Helper to determine status text ---
  const getProjectStatusText = () => {
      if (currentStepIndex === steps.length - 1 && areCurrentStepTasksComplete) {
          return 'Completed';
      }
      // Add more logic here if needed (e.g., check deadlines)
      return 'On Track';
  }

  return (
    // Keep original outer structure
    <div className="h-full flex flex-col space-y-8 bg-gray-50 px-4 py-8">
      {/* Welcome Section - Updated dynamically */}
      <div className="max-w-6xl w-full mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Your Reforestation Journey</h2>
        <p className="text-gray-600 mb-6">Track your progress and manage your reforestation project all in one place. Complete each step to move forward with your project.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6"> {/* Responsive columns */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="text-base font-medium text-green-700 mb-1">Current Phase</h3> {/* Adjusted size */}
            <p className="text-green-600 font-semibold">{activeStep?.name || 'N/A'}</p> {/* Dynamic */}
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-base font-medium text-blue-700 mb-1">Next Action</h3> {/* Adjusted size */}
            <p className="text-blue-600 font-semibold">{activeStep?.nextAction || 'N/A'}</p> {/* Dynamic */}
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="text-base font-medium text-purple-700 mb-1">Project Status</h3> {/* Adjusted size */}
            <p className="text-purple-600 font-semibold">{getProjectStatusText()}</p> {/* Dynamic */}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-6xl w-full mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
          Please Complete the Required Steps
        </h2>

        <div className="flex items-center justify-between space-x-4">
          {/* Previous Button - Uses modified handler */}
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`p-2 rounded-full ${currentStepIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}`}
            aria-label="Previous Step"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Progress Steps - Visuals updated based on state */}
          <div className="flex-1 overflow-x-auto py-2"> {/* Added overflow */}
            <div className="flex justify-between min-w-fit"> {/* min-w-fit to prevent squishing */}
              {steps.map((step, index) => {
                 // Determine if step is completed (index < current) or active (index === current)
                 const isCompleted = index < currentStepIndex;
                 const isActive = index === currentStepIndex;
                 // Check if all tasks for *this specific step index* are done (for checkmark logic)
                 const stepTasksCompleted = taskStatus[stepsData[index].id] && stepsData[index].tasks.every(task => taskStatus[stepsData[index].id][task.id]);

                return (
                  <div key={index} className="flex flex-col items-center px-2 md:px-4 flex-shrink-0 w-32 md:w-40"> {/* Added flex-shrink-0 and width */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 border-2
                        ${isActive ? 'border-green-500 bg-green-50 scale-105' : isCompleted ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'}
                      `}
                    >
                      {/* Show checkmark if step index is completed OR if it's the active step and its tasks are done */}
                      {isCompleted || (isActive && stepTasksCompleted) ? (
                         <CheckCircle size={20} className={isCompleted ? "text-white" : "text-green-600"} />
                      ) : (
                         <span className={`font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>{index + 1}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium line-clamp-1 ${isActive ? 'text-green-600' : isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Button - Uses modified handler and disabled logic */}
          <button
            onClick={handleNext}
            // Disable if tasks aren't complete OR if it's already the last step
            disabled={!areCurrentStepTasksComplete || currentStepIndex === steps.length - 1}
            className={`p-2 rounded-full ${(!areCurrentStepTasksComplete && currentStepIndex !== steps.length -1) || currentStepIndex === steps.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}`}
            aria-label="Next Step"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* --- REPLACE PLACEHOLDER WITH ACTIVE STEP DETAILS --- */}
        <div className="mt-10 pt-6 border-t border-gray-200">
             {activeStep && (
               <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                 <h3 className="text-lg font-semibold mb-2 text-gray-800">{activeStep.name}</h3>
                 <p className="text-sm text-gray-600 mb-4">{activeStep.details}</p>
                 <div className="space-y-3">
                   {activeStep.tasks.map(task => (
                     <label key={task.id} className="flex items-start p-3 bg-white rounded-md border border-gray-200 hover:bg-green-50 transition-colors cursor-pointer shadow-sm has-[:checked]:bg-green-50 has-[:checked]:border-green-200">
                       <input
                         type="checkbox"
                         checked={taskStatus[activeStep.id]?.[task.id] || false}
                         onChange={() => handleCheckboxChange(activeStep.id, task.id)}
                         className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-offset-0 focus:ring-2 focus:ring-green-400 cursor-pointer"
                       />
                       <span className={`ml-3 text-sm ${taskStatus[activeStep.id]?.[task.id] ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                           {task.label}
                       </span>
                     </label>
                   ))}
                 </div>
                 {/* Optional: Button to explicitly move next within this box */}
                  {areCurrentStepTasksComplete && currentStepIndex < steps.length - 1 && (
                      <div className="mt-6 text-right">
                          <button
                              onClick={handleNext} // Use the same next handler
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                              Next Step
                          </button>
                      </div>
                  )}
               </div>
             )}
        </div>
        {/* --- END REPLACEMENT --- */}


        {/* Bottom section - Updated dynamically */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-6 border-t border-gray-200">
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Next Steps</h3>
             <p className="text-gray-600 text-sm">{activeStep?.nextStepsDescription || (getProjectStatusText() === 'Completed' ? 'Project complete!' : 'Details will appear here.')}</p>
             {/* Could add more dynamic content/links here based on activeStep */}
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Resources</h3>
             {activeStep?.resources && activeStep.resources.length > 0 ? (
                <ul className="space-y-2">
                    {activeStep.resources.map((resource, index) => (
                        <li key={index}>
                            {/* Using simple anchor tags for now */}
                            <a
                                href={resource.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                            >
                                 {/* Generic link icon */}
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                {resource.label}
                            </a>
                        </li>
                    ))}
                </ul>
             ) : (
                <p className="text-gray-500 text-sm">No specific resources for this step.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandownerDashboard;