import React, { useState } from 'react';
import { 
  Building2, Globe, Mail, Phone, MapPin, Plus, X, ArrowRight, 
  ArrowLeft, Loader2, Link2, Upload, Image as ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Social platform configuration
const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
  { id: 'twitter', name: 'Twitter/X', placeholder: 'https://twitter.com/...' },
  { id: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/...' },
  { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/...' },
  { id: 'github', name: 'GitHub', placeholder: 'https://github.com/...' },
  { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/...' },
];

// Industry options
const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance & Banking',
  'Education',
  'Manufacturing',
  'Retail & E-commerce',
  'Professional Services',
  'Real Estate',
  'Media & Entertainment',
  'Non-profit',
  'Government',
  'Other',
];

/**
 * Dynamic list field component for emails, phones, addresses
 */
const DynamicListField = ({ label, icon: Icon, items, onAdd, onRemove, onChange, placeholder, type = 'text' }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-light-text-secondary">
        {label}
      </label>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="w-4 h-4 text-light-text-secondary/50" />
              </div>
              <input
                type={type}
                value={item}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 bg-light-surface border border-light-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-100 focus:border-brand-accent-300 transition-all"
              />
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 rounded-lg text-light-text-secondary hover:text-status-error hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 text-sm text-brand-accent-600 hover:text-brand-accent-700 font-medium"
      >
        <Plus className="w-4 h-4" />
        Add another
      </button>
    </div>
  );
};


/**
 * Manual entry form for company registration
 */
const ManualEntryForm = ({ onSubmit, onBack, isLoading = false }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    website: '',
    industry: '',
    emails: [''],
    phones: [''],
    addresses: [''],
    socialLinks: {},
  });

  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [showSocialLinks, setShowSocialLinks] = useState(false);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    // Validate emails
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = formData.emails.filter(e => e.trim());
    validEmails.forEach((email, i) => {
      if (email && !emailPattern.test(email)) {
        newErrors[`email_${i}`] = 'Invalid email format';
      }
    });

    // Validate website URL if provided
    if (formData.website) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
      if (!urlPattern.test(formData.website)) {
        newErrors.website = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleListAdd = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleListRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleListChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare profile data
    const profile = {
      name: formData.name.trim(),
      tagline: formData.tagline.trim() || null,
      description: formData.description.trim() || null,
      website: formData.website.trim() || null,
      industry: formData.industry || null,
      contact_info: {
        emails: formData.emails.filter(e => e.trim()),
        phones: formData.phones.filter(p => p.trim()),
        addresses: formData.addresses.filter(a => a.trim()),
      },
      social_links: Object.fromEntries(
        Object.entries(formData.socialLinks).filter(([_, v]) => v?.trim())
      ),
    };

    // If logo file exists, convert to base64
    if (logoFile) {
      profile.logo_base64 = logoPreview;
    }

    onSubmit(profile);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl text-light-text-secondary hover:text-light-text hover:bg-light-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-light-text">
            Enter Company Details
          </h2>
          <p className="text-light-text-secondary">
            Fill in your organization's information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name & Logo */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm">
          <h3 className="font-bold text-light-text mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-accent-500" />
            Basic Information
          </h3>

          <div className="flex gap-6">
            {/* Logo Upload */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-bold text-light-text-secondary mb-2">
                Logo
              </label>
              <label className="cursor-pointer">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-light-border hover:border-brand-accent-500 flex items-center justify-center overflow-hidden transition-colors bg-light-surface">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 text-light-text-secondary/50 mx-auto mb-1" />
                      <span className="text-xs text-light-text-secondary">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name & Tagline */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-bold text-light-text-secondary mb-2">
                  Company Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Acme Corporation"
                  className={`w-full px-4 py-3 bg-light-surface border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-accent-100 transition-all ${
                    errors.name ? 'border-status-error focus:border-status-error' : 'border-light-border focus:border-brand-accent-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-status-error">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-light-text-secondary mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Innovation at scale"
                  className="w-full px-4 py-3 bg-light-surface border border-light-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-accent-100 focus:border-brand-accent-300 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-bold text-light-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tell us about your company..."
              rows={3}
              className="w-full px-4 py-3 bg-light-surface border border-light-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-accent-100 focus:border-brand-accent-300 transition-all resize-none"
            />
          </div>

          {/* Industry & Website */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-bold text-light-text-secondary mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 bg-light-surface border border-light-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-accent-100 focus:border-brand-accent-300 transition-all"
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-light-text-secondary mb-2">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="w-4 h-4 text-light-text-secondary/50" />
                </div>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-light-surface border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-accent-100 transition-all ${
                    errors.website ? 'border-status-error focus:border-status-error' : 'border-light-border focus:border-brand-accent-300'
                  }`}
                />
              </div>
              {errors.website && (
                <p className="mt-1 text-sm text-status-error">{errors.website}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm">
          <h3 className="font-bold text-light-text mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-accent-500" />
            Contact Information
          </h3>

          <div className="space-y-6">
            <DynamicListField
              label="Email Addresses"
              icon={Mail}
              items={formData.emails}
              onAdd={() => handleListAdd('emails')}
              onRemove={(i) => handleListRemove('emails', i)}
              onChange={(i, v) => handleListChange('emails', i, v)}
              placeholder="contact@company.com"
              type="email"
            />

            <DynamicListField
              label="Phone Numbers"
              icon={Phone}
              items={formData.phones}
              onAdd={() => handleListAdd('phones')}
              onRemove={(i) => handleListRemove('phones', i)}
              onChange={(i, v) => handleListChange('phones', i, v)}
              placeholder="+1 (555) 123-4567"
              type="tel"
            />

            <DynamicListField
              label="Addresses"
              icon={MapPin}
              items={formData.addresses}
              onAdd={() => handleListAdd('addresses')}
              onRemove={(i) => handleListRemove('addresses', i)}
              onChange={(i, v) => handleListChange('addresses', i, v)}
              placeholder="123 Main St, City, State 12345"
            />
          </div>
        </div>

        {/* Social Links (Collapsible) */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setShowSocialLinks(!showSocialLinks)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-bold text-light-text flex items-center gap-2">
              <Link2 className="w-5 h-5 text-brand-accent-500" />
              Social Media Links
            </h3>
            <span className="text-sm text-light-text-secondary">
              {showSocialLinks ? 'Hide' : 'Show'} ({Object.values(formData.socialLinks).filter(v => v?.trim()).length} added)
            </span>
          </button>

          <AnimatePresence>
            {showSocialLinks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {SOCIAL_PLATFORMS.map(platform => (
                    <div key={platform.id}>
                      <label className="block text-sm font-medium text-light-text-secondary mb-1">
                        {platform.name}
                      </label>
                      <input
                        type="url"
                        value={formData.socialLinks[platform.id] || ''}
                        onChange={(e) => handleSocialLinkChange(platform.id, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full px-3 py-2 bg-light-surface border border-light-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-100 focus:border-brand-accent-300 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-4 rounded-2xl font-bold text-light-text-secondary bg-light-surface hover:bg-light-border transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
              isLoading || !formData.name.trim()
                ? 'bg-light-sidebar text-light-text-muted cursor-not-allowed'
                : 'bg-brand-accent-600 text-white hover:bg-brand-accent-700 shadow-xl shadow-brand-accent-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                Continue to Preview
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

    </motion.div>
  );
};

export default ManualEntryForm;
