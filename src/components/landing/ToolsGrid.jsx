import React from 'react';
import { motion } from 'framer-motion';
import ToolCard from './ToolCard';
import {
  FileText, Table, FileImage, Presentation, Image, Code, ScanLine,
  Camera, Palette, Sparkles, User, Link2, MessagesSquare
} from 'lucide-react';

// Tool definitions organized by category
const toolCategories = [
  {
    id: 'unified',
    title: 'All-in-One Assistant',
    description: 'Access all tools through a unified chat interface',
    tools: [
      {
        id: 'unified-chat',
        title: 'Unified Assistant',
        description: 'Chat with AI to create documents, images, code, and more - auto-selects the right tool.',
        icon: MessagesSquare,
        route: '/chat',
        isExternal: false,
        featured: true
      }
    ]
  },
  {
    id: 'documents',
    title: 'Document Processing',
    description: 'Create, edit, and transform documents with AI assistance',
    tools: [
      {
        id: 'docx',
        title: 'Word Documents',
        description: 'Create and edit Word documents, contracts, reports, and more.',
        icon: FileText,
        route: '/chat?skill=docx',
        isExternal: false
      },
      {
        id: 'xlsx',
        title: 'Excel Spreadsheets',
        description: 'Work with spreadsheets, formulas, data analysis, and charts.',
        icon: Table,
        route: '/chat?skill=xlsx',
        isExternal: false
      },
      {
        id: 'pdf',
        title: 'PDF Processing',
        description: 'Create, edit, merge PDFs and extract data from forms.',
        icon: FileImage,
        route: '/chat?skill=pdf',
        isExternal: false
      },
      {
        id: 'pptx',
        title: 'Presentations',
        description: 'Design professional PowerPoint slides and pitch decks.',
        icon: Presentation,
        route: '/chat?skill=pptx',
        isExternal: false
      }
    ]
  },
  {
    id: 'ai-creative',
    title: 'AI Creative Tools',
    description: 'Generate images, code, and creative content with AI',
    tools: [
      {
        id: 'imagegen',
        title: 'Image Generation',
        description: 'Generate and enhance images with AI-powered tools.',
        icon: Image,
        route: '/chat?skill=imagegen',
        isExternal: false
      },
      {
        id: 'frontend-design',
        title: 'Frontend Design',
        description: 'Generate React components and web interfaces.',
        icon: Code,
        route: '/chat?skill=frontend-design',
        isExternal: false
      },
      {
        id: 'handwritten-ocr',
        title: 'Handwritten OCR',
        description: 'Extract text from handwritten notes and documents.',
        icon: ScanLine,
        route: '/chat?skill=handwritten-ocr',
        isExternal: false
      }
    ]
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'Professional product photography and content creation tools',
    tools: [
      {
        id: 'product-photography',
        title: 'Product Photography',
        description: 'Flat lay, ghost mannequin, product staging and enhancement.',
        icon: Camera,
        route: '/product-photography',
        isExternal: true
      },
      {
        id: 'design-generation',
        title: 'Design Generation',
        description: 'Create logos, text images, and brand assets.',
        icon: Palette,
        route: '/design-generation',
        isExternal: true
      },
      {
        id: 'content-generation',
        title: 'Content Generation',
        description: 'Generate social media posts and marketing content.',
        icon: Sparkles,
        route: '/content-generation',
        isExternal: true
      },
      {
        id: 'virtual-model',
        title: 'Virtual Model',
        description: 'Virtual try-on and model product visualization.',
        icon: User,
        route: '/virtual-model',
        isExternal: true
      }
    ]
  },
  {
    id: 'connectors',
    title: 'Connectors',
    description: 'Connect external apps and services to your workflow',
    tools: [
      {
        id: 'connect',
        title: 'App Connectors',
        description: 'Connect Gmail, Google Drive, HubSpot, Airtable and more.',
        icon: Link2,
        route: '/connect',
        isExternal: true
      }
    ]
  }
];

const CategorySection = ({ category, startIndex }) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: startIndex * 0.1 }}
      className="mb-12"
    >
      {/* Category Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-light-text mb-1">
          {category.title}
        </h2>
        <p className="text-sm text-light-text-secondary">
          {category.description}
        </p>
      </div>
      
      {/* Tools Grid */}
      <div className={`grid gap-4 ${
        category.tools.length === 1 
          ? 'grid-cols-1 max-w-md' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {category.tools.map((tool, index) => (
          <ToolCard
            key={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            route={tool.route}
            isExternal={tool.isExternal}
            featured={tool.featured}
            delay={0.1 + index * 0.05}
          />
        ))}
      </div>
    </motion.section>
  );
};

const ToolsGrid = () => {
  let toolIndex = 0;
  
  return (
    <div className="space-y-8">
      {toolCategories.map((category, catIndex) => {
        const startIndex = toolIndex;
        toolIndex += category.tools.length;
        return (
          <CategorySection 
            key={category.id} 
            category={category} 
            startIndex={catIndex}
          />
        );
      })}
    </div>
  );
};

export { ToolsGrid, toolCategories };
export default ToolsGrid;
