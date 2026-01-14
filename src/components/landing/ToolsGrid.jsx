import React from 'react';
import { motion } from 'framer-motion';
import ToolCard from './ToolCard';
import {
  FileText, Table, FileImage, Presentation, Image, Code, ScanLine,
  Camera, Palette, Sparkles, User, Link2, MessagesSquare, BarChart3
} from 'lucide-react';

// Tool definitions organized by new category structure
// Custom File Logo Component
const FileLogo = ({ type, className }) => {
  const baseClasses = `relative flex items-center justify-center ${className}`;

  switch (type) {
    case 'docx':
      return (
        <div className={baseClasses} title="Microsoft Word">
          <div className="w-8 h-10 bg-white border border-blue-200 rounded relative shadow-sm overflow-hidden">
            {/* Lines simulation */}
            <div className="absolute top-3 left-1 right-1 h-0.5 bg-gray-100 mb-1"></div>
            <div className="absolute top-5 left-1 right-1 h-0.5 bg-gray-100 mb-1"></div>
            <div className="absolute top-7 left-1 right-1 h-0.5 bg-gray-100"></div>
            {/* Badge */}
            <div className="absolute top-0 left-0 bg-[#2B579A] w-5 h-5 rounded-br-md flex items-center justify-center z-10">
              <span className="text-white text-[10px] font-bold font-sans">W</span>
            </div>
          </div>
        </div>
      );

    case 'xlsx':
      return (
        <div className={baseClasses} title="Microsoft Excel">
          <div className="w-8 h-10 bg-white border border-green-200 rounded relative shadow-sm overflow-hidden">
            {/* Cells simulation */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-[1px] bg-green-50/30 p-1">
              {[...Array(12)].map((_, i) => <div key={i} className="bg-white/80"></div>)}
            </div>
            {/* Badge */}
            <div className="absolute top-0 left-0 bg-[#217346] w-5 h-5 rounded-br-md flex items-center justify-center z-10">
              <span className="text-white text-[10px] font-bold font-sans">X</span>
            </div>
          </div>
        </div>
      );

    case 'pptx':
      return (
        <div className={baseClasses} title="Microsoft PowerPoint">
          <div className="w-10 h-8 bg-white border border-orange-200 rounded relative shadow-sm overflow-hidden flex items-center justify-center">
            {/* Chart simulation */}
            <div className="w-4 h-4 rounded-full border-2 border-orange-100 relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-orange-100 rounded-tr-full"></div>
            </div>
            {/* Badge */}
            <div className="absolute top-0 left-0 bg-[#D24726] w-5 h-5 rounded-br-md flex items-center justify-center z-10">
              <span className="text-white text-[10px] font-bold font-sans">P</span>
            </div>
          </div>
        </div>
      );

    case 'pdf':
      return (
        <div className={baseClasses} title="PDF Document">
          <div className="w-8 h-10 bg-white border border-red-200 rounded relative shadow-sm flex items-center justify-center">
            <div className="text-[#F40F02] text-[8px] font-bold tracking-tighter transform -rotate-90 origin-center absolute -left-2 top-4">PDF</div>
            <div className="w-full h-full flex flex-col items-end pt-1 pr-1 gap-1">
              <div className="w-4 h-0.5 bg-gray-100"></div>
              <div className="w-5 h-0.5 bg-gray-100"></div>
              <div className="w-3 h-0.5 bg-gray-100"></div>
            </div>
            {/* Badge */}
            <div className="absolute top-2 -left-1 bg-[#F40F02] px-1 py-0.5 rounded shadow-sm z-10">
              <span className="text-white text-[7px] font-bold block leading-none">PDF</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

// Tool definitions organized by new category structure
const toolCategories = [
  {
    id: 'unified',
    title: 'Unified AI Assistant',
    description: 'Chat with AI to create anything - automatically selects the right tool for your needs',
    featured: true,
    gradient: 'from-brand-accent-500 to-brand-accent-700',
    tools: [
      {
        id: 'unified-chat',
        title: 'Unified AI Assistant',
        description: 'Simply describe what you need to create. Our AI automatically selects the right tool and guides you through every step.',
        icon: MessagesSquare,
        route: '/chat',
        isExternal: false,
        featured: true,
        examples: [
          'Create a quarterly sales report with charts',
          'Design a modern landing page',
          'Generate product marketing images'
        ]
      }
    ]
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Create and process all types of business documents',
    icon: FileText,
    gradient: 'from-brand-accent-50 to-brand-accent-100/50',
    iconColor: 'text-brand-accent-600',
    tools: [
      {
        id: 'docx',
        title: 'Business Reports & Word Documents',
        description: 'Create contracts, reports, resumes, and proposals with professional formatting.',
        iconType: 'docx',
        icon: FileText, // Fallback
        route: '/chat?skill=docx',
        isExternal: false,
        tags: ['Templates', 'Editing', 'Collaboration']
      },
      {
        id: 'xlsx',
        title: 'Data Analysis & Spreadsheets',
        description: 'Build spreadsheets, formulas, charts, and interactive dashboards.',
        iconType: 'xlsx',
        icon: BarChart3, // Fallback
        route: '/chat?skill=xlsx',
        isExternal: false,
        tags: ['Formulas', 'Charts', 'Analysis']
      },
      {
        id: 'pptx',
        title: 'Presentations & Slides',
        description: 'Design professional pitch decks, training materials, and presentation slides.',
        iconType: 'pptx',
        icon: Presentation, // Fallback
        route: '/chat?skill=pptx',
        isExternal: false,
        tags: ['Slides', 'Design', 'Templates']
      },
      {
        id: 'pdf',
        title: 'PDF Processing',
        description: 'Create, merge, extract data from PDFs, and fill interactive forms.',
        iconType: 'pdf',
        icon: FileImage, // Fallback
        route: '/chat?skill=pdf',
        isExternal: false,
        tags: ['Forms', 'Merge', 'Extract']
      },
      {
        id: 'handwritten-ocr',
        title: 'Handwritten OCR',
        description: 'Extract text from handwritten notes and documents with AI-powered recognition.',
        icon: ScanLine,
        route: '/chat?skill=handwritten-ocr',
        isExternal: false,
        tags: ['OCR', 'Handwriting', 'Extract']
      }
    ]
  },
  {
    id: 'digital-marketing', // Renamed from design-creative
    title: 'Digital Marketing', // Changed Heading
    description: 'AI-powered visual content and brand assets',
    icon: Sparkles,
    gradient: 'from-brand-accent-50 to-brand-accent-100/50',
    iconColor: 'text-brand-accent-600',
    tools: [
      {
        id: 'imagegen',
        title: 'Image Generation',
        description: 'Generate and edit images with AI-powered tools and advanced models.',
        icon: Image,
        route: '/chat?skill=imagegen',
        isExternal: false,
        tags: ['AI', 'Generation', 'Editing']
      },
      {
        id: 'frontend-design',
        title: 'Frontend Design',
        description: 'Create React components, web interfaces, and modern UI layouts.',
        icon: Code,
        route: '/chat?skill=frontend-design',
        isExternal: false,
        tags: ['React', 'Web', 'Components']
      },
      {
        id: 'design-generation',
        title: 'Design Generation',
        description: 'Create logos, text-on-image designs, and professional brand assets.',
        icon: Palette,
        route: '/design-generation',
        isExternal: true,
        tags: ['Logos', 'Branding', 'Assets']
      },
      {
        id: 'product-photography',
        title: 'Product Photography',
        description: 'Flat lay, ghost mannequin effects, and professional product staging.',
        icon: Camera,
        route: '/product-photography',
        isExternal: true,
        tags: ['E-commerce', 'Staging', 'Enhancement']
      },
      {
        id: 'content-generation',
        title: 'Content Creation',
        description: 'Generate engaging social media posts and marketing content.',
        icon: Sparkles,
        route: '/content-generation',
        isExternal: true,
        tags: ['Social', 'Marketing', 'Copy']
      },
      {
        id: 'virtual-model',
        title: 'Virtual Model',
        description: 'Virtual try-on experiences and realistic product visualization.',
        icon: User,
        route: '/virtual-model',
        isExternal: true,
        tags: ['Try-on', 'Fashion', 'AR']
      }
    ]
  },
  {
    id: 'connect',
    title: 'Connect',
    description: 'Integrate with external apps and services to enhance your workflow',
    icon: Link2,
    gradient: 'from-brand-accent-50 to-brand-accent-100/50',
    iconColor: 'text-brand-accent-600',
    tools: [
      {
        id: 'connect',
        title: 'App Connectors',
        description: 'Connect Gmail, Google Drive, HubSpot, Airtable, and 40+ more apps.',
        icon: Link2,
        route: '/connect',
        isExternal: true,
        tags: ['Integrations', 'Apps', 'Workflow']
      }
    ]
  }
];


const CategorySection = ({ category, layout }) => {
  // Special layout for Unified Assistant (featured)
  if (category.featured) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <div className="max-w-4xl mx-auto">
          {category.tools.map(tool => (
            <ToolCard
              key={tool.id}
              {...tool}
              gradient={category.gradient}
            />
          ))}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={layout === 'half' ? 'lg:col-span-1' : 'col-span-full'}
    >
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-6">
        {category.icon && (
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center
            bg-gradient-to-br ${category.gradient}
          `}>
            <category.icon className={`w-8 h-8 ${category.iconColor}`} />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-light-text">
            {category.title}
          </h2>
          <p className="text-sm text-light-text-secondary">
            {category.description}
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {category.tools.map((tool, index) => (
          <ToolCard
            key={tool.id}
            {...tool}
            gradient={category.gradient}
            iconColor={category.iconColor}
            delay={0.1 + index * 0.05}
            // Pass the custom logo component if type matches
            customIcon={tool.iconType ? <FileLogo type={tool.iconType} /> : null}
          />
        ))}
      </div>
    </motion.section>
  );
};

const ToolsGrid = () => {
  const [unified, documents, digitalMarketing, connect] = toolCategories; // Reordered extraction

  return (
    <div className="space-y-12">
      {/* Documents - Full Width */}
      <CategorySection category={documents} />

      {/* Digital Marketing - Full Width */}
      <CategorySection category={digitalMarketing} />

      {/* Unified Assistant - Full Width, Featured */}
      <CategorySection category={unified} />

      {/* Connect - Full Width */}
      <CategorySection category={connect} />
    </div>
  );
};

export { ToolsGrid, toolCategories };
export default ToolsGrid;
