import React from 'react';
import UnifiedSectionEditor from '../shared/UnifiedSectionEditor';

const legalSuggestions = [
  "Analyze this contract for potential risk factors",
  "Summarize the termination clauses in this agreement",
  "Draft a standard NDA from the following parties",
  "Check this document for GDPR compliance",
  "Generate a summary of legal obligations"
];

const LegalSectionEditor = () => {
  return (
    <UnifiedSectionEditor 
      sectionName="Legal & Compliance" 
      sectionKey="legal"
      suggestions={legalSuggestions}
      backTo="/app/legal"
    />
  );
};

export default LegalSectionEditor;
