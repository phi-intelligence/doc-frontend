import React from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedSectionEditor from '../shared/UnifiedSectionEditor';

const hrSuggestions = [
  "Draft an employment contract for a Senior Engineer",
  "Generate an offer letter from the candidate details",
  "Create an employee ID card using the uploaded photo",
  "Produce a Non-Disclosure Agreement (NDA)",
  "Summarize the resume and extract key skills"
];

const HRSectionEditor = () => {
  const location = useLocation();
  const employee = location.state?.employee || null;
  const initialFiles = location.state?.initialFiles || [];

  return (
    <UnifiedSectionEditor 
      sectionName="Human Resources" 
      sectionKey="hr"
      suggestions={hrSuggestions}
      backTo="/app/hr"
      employee={employee}
      initialFiles={initialFiles}
    />
  );
};

export default HRSectionEditor;
