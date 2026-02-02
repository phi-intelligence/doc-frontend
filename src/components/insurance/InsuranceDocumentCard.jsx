import React from 'react';
import { Shield, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const InsuranceDocumentCard = ({ document, onClick }) => {
  const navigate = useNavigate();

  const typeConfig = {
    policy: { icon: Shield, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    claim: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    underwriting: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    renewal: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
  };

  const config = typeConfig[document.type] || typeConfig.policy;
  const Icon = config.icon;

  const handleClick = () => {
    if (onClick) {
      onClick(document);
    } else if (document.id) {
      navigate(`/insurance/${document.type}s/${document.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-white rounded-xl border border-light-border p-4 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-800 truncate">
            {document.title || document.policy_number || document.claim_number}
          </h4>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {document.description || document.holder_name || document.applicant_name}
          </p>
          {document.status && (
            <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              document.status === 'active' ? 'bg-green-100 text-green-700' :
              document.status === 'pending' ? 'bg-amber-100 text-amber-700' :
              document.status === 'approved' ? 'bg-green-100 text-green-700' :
              document.status === 'denied' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {document.status}
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </motion.div>
  );
};

export default InsuranceDocumentCard;
