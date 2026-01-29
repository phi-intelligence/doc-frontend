import React from 'react';
import UnifiedSectionEditor from '../shared/UnifiedSectionEditor';

const financeSuggestions = [
  "Generate a quarterly financial summary from these logs",
  "Create an expense report for the last month",
  "Analyze these spreadsheets for budget discrepancies",
  "Draft an audit trail for the recent transactions",
  "Generate a balance sheet template"
];

const FinanceSectionEditor = () => {
  return (
    <UnifiedSectionEditor 
      sectionName="Financial Management" 
      sectionKey="finance"
      suggestions={financeSuggestions}
      backTo="/app/finance"
    />
  );
};

export default FinanceSectionEditor;
