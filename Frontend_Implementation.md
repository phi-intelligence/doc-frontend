# Phi Docs Frontend Implementation Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Core Features & Implementation](#core-features--implementation)
6. [Components Breakdown](#components-breakdown)
7. [Hooks & State Management](#hooks--state-management)
8. [API Integration](#api-integration)
9. [Styling & Theming](#styling--theming)
10. [Build & Development Setup](#build--development-setup)

---

## Overview

Phi Docs is a modern, AI-powered document processing and generation application built with React. The frontend provides an intuitive chat-based interface where users can interact with an AI assistant to create, edit, and enhance various document types including PDFs, Word documents, Excel spreadsheets, PowerPoint presentations, and more.

### Key Capabilities
- **Chat-based AI Interaction**: Natural language interface for document creation and editing
- **Multi-format Document Support**: PDF, DOCX, PPTX, XLSX, images, and code files
- **Real-time Progress Tracking**: Server-Sent Events (SSE) for live progress updates
- **Document Preview**: In-browser preview for multiple file types
- **File Management**: Upload, organize, and manage documents
- **Session Management**: Multiple conversation sessions with history
- **RAG Integration**: Document indexing and retrieval for enhanced context
- **Connect Integration**: OAuth-based integrations with Gmail, Google Drive, HubSpot, Airtable
- **AI Enhancement**: Add AI-generated images to documents

---

## Technology Stack

### Core Framework & Libraries
- **React 19.2.0**: Modern React with latest features
- **Vite 7.2.4**: Fast build tool and dev server
- **React DOM 19.2.0**: React rendering library

### UI & Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Framer Motion 12.23.26**: Animation library for smooth transitions
- **Lucide React 0.562.0**: Icon library (replacement for Feather icons)
- **classnames 2.5.1**: Conditional className utility

### Document Processing & Preview
- **xlsx 0.18.5**: Excel file parsing and manipulation
- **mermaid 11.12.2**: Diagram/chart generation from text
- **react-markdown 10.1.0**: Markdown rendering
- **react-live 4.1.8**: Live React code editing and preview
- **prism-react-renderer 2.4.1**: Syntax highlighting for code blocks

### HTTP & API
- **axios 1.13.2**: HTTP client for API requests

### Development Tools
- **ESLint 9.39.1**: Code linting
- **PostCSS 8.5.6**: CSS processing
- **Autoprefixer 10.4.23**: CSS vendor prefixing
- **@vitejs/plugin-react 5.1.1**: Vite React plugin

---

## Project Structure

```
client/doc-frontend/
├── public/                          # Static assets
│   ├── loading_preview.mp4         # Loading animation video
│   ├── Logo_Animation_of_Phi_Symbol.mp4
│   ├── logophi_brown.png           # Brand logo
│   └── ...
├── src/
│   ├── api/                        # API service layer
│   │   ├── index.js                # Axios instance & interceptors
│   │   ├── chat.js                 # Chat API endpoints
│   │   ├── files.js                # File upload/download API
│   │   ├── rag.js                  # RAG (Retrieval Augmented Generation) API
│   │   └── sessions.js             # Session management API
│   ├── components/                 # Reusable UI components
│   │   ├── artifacts/
│   │   │   └── ArtifactCard.jsx    # Artifact display card
│   │   ├── common/
│   │   │   ├── FileChip.jsx        # File chip component
│   │   │   └── FileIcon.jsx        # File type icon component
│   │   ├── connect/
│   │   │   └── ConnectMenu.jsx     # OAuth integration menu
│   │   ├── layout/
│   │   │   ├── ChatHistorySidebar.jsx  # Session history sidebar
│   │   │   └── Header.jsx          # Application header
│   │   ├── preview/
│   │   │   ├── DocumentPreview.jsx # Main document preview component
│   │   │   ├── ExcelPreview.jsx    # Excel file preview
│   │   │   ├── MermaidPreview.jsx  # Mermaid diagram preview
│   │   │   └── ReactLivePreview.jsx # React code live preview
│   │   └── progress/
│   │       ├── ProcessCard.jsx     # Process step card
│   │       ├── ProgressDisplay.jsx # Progress timeline display
│   │       └── TerminalBlock.jsx   # Code terminal block
│   ├── features/                   # Feature-specific components
│   │   ├── artifacts/
│   │   │   └── components/
│   │   │       └── EnhancementCard.jsx  # AI enhancement progress card
│   │   └── chat/
│   │       └── components/
│   │           └── WelcomeScreen.jsx    # Welcome screen component
│   ├── hooks/                      # Custom React hooks
│   │   ├── useArtifacts.js        # Artifact state management
│   │   ├── useConnect.js          # Connect integration state
│   │   ├── useFiles.js            # File upload state management
│   │   ├── useLocalStorage.js     # LocalStorage sync hook
│   │   ├── useProgressStream.js   # SSE progress stream hook
│   │   └── useSession.js          # Session management hook
│   ├── utils/                      # Utility functions
│   │   ├── constants.js           # Application constants
│   │   ├── fileUtils.js           # File utility functions
│   │   ├── storage.js             # LocalStorage helpers
│   │   └── timeUtils.js           # Time formatting utilities
│   ├── App.jsx                     # Main application component
│   ├── App.css                     # Application styles
│   ├── index.css                   # Global styles & Tailwind imports
│   └── main.jsx                    # Application entry point
├── eslint.config.js               # ESLint configuration
├── index.html                      # HTML template
├── package.json                    # Dependencies & scripts
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
└── vite.config.js                  # Vite configuration
```

---

## Architecture & Design Patterns

### Component Architecture
The application follows a **feature-based component organization** with clear separation of concerns:

1. **Layout Components**: Handle overall page structure (Header, Sidebars)
2. **Feature Components**: Domain-specific functionality (Chat, Artifacts, Connect)
3. **Common Components**: Reusable UI elements (FileChip, FileIcon)
4. **Preview Components**: Specialized document renderers

### State Management Pattern
- **Local Component State**: Using React hooks (`useState`, `useEffect`)
- **Custom Hooks**: Encapsulated state logic for reusability
- **LocalStorage Persistence**: Session data and UI preferences persisted client-side
- **Server State**: Managed through API calls and SSE streams

### Data Flow
```
User Action → Component Handler → Custom Hook → API Service → Backend
                ↓                                    ↓
         State Update ←─── SSE Stream ←─────────── Backend
```

### Key Design Patterns

1. **Container/Presentational Pattern**: 
   - `App.jsx` acts as container managing state
   - Components are mostly presentational

2. **Custom Hooks Pattern**:
   - Business logic extracted into reusable hooks
   - Examples: `useSession`, `useFiles`, `useArtifacts`, `useConnect`

3. **Service Layer Pattern**:
   - API calls abstracted into service modules (`api/` directory)
   - Centralized axios instance with interceptors

4. **Observer Pattern**:
   - SSE (Server-Sent Events) for real-time progress updates
   - `useProgressStream` hook manages SSE connection

---

## Core Features & Implementation

### 1. Chat Interface

**Location**: `src/App.jsx`

The main chat interface provides:
- **Message Input**: Text input with file attachment support
- **Message History**: Scrollable list of user queries and AI responses
- **Process Cards**: Collapsible cards showing AI processing steps
- **Real-time Updates**: Live progress via SSE stream

**Key Implementation Details**:
- Uses `useProgressStream` hook for SSE connection
- Process cards track steps, code generation, and final results
- Supports request cancellation via AbortController
- Messages persist in localStorage per session

### 2. File Management

**Location**: `src/hooks/useFiles.js`, `src/api/files.js`

Features:
- **Multi-file Upload**: Batch file uploads with progress tracking
- **File Type Detection**: Automatic file type identification
- **File Preview**: In-browser preview for supported formats
- **File Removal**: Delete uploaded or generated files

**Supported File Types**:
- Documents: PDF, DOCX, DOC
- Spreadsheets: XLSX, XLS
- Presentations: PPTX, PPT
- Images: JPG, PNG, GIF, WEBP
- Code: JS, JSX, HTML, CSS, JSON, MD, TXT
- Diagrams: Mermaid

### 3. Document Preview System

**Location**: `src/components/preview/DocumentPreview.jsx`

Multi-format preview system with specialized renderers:

- **PDF**: Embedded iframe with page navigation
- **Office Documents (DOCX/PPTX)**: Converted to PDF via backend, displayed in iframe
- **Excel**: Custom table renderer using `xlsx` library
- **Images**: Direct image display
- **Code Files**: Syntax-highlighted code blocks
- **Mermaid**: Rendered diagrams
- **React/JSX**: Live code preview with `react-live`
- **HTML**: Sandboxed iframe preview

**Loading States**:
- Video loading animation (`loading_preview.mp4`) during document conversion
- Loading indicators for async operations
- Error handling with fallback UI

### 4. Session Management

**Location**: `src/hooks/useSession.js`, `src/components/layout/ChatHistorySidebar.jsx`

Features:
- **Multiple Sessions**: Create, switch, and delete conversation sessions
- **Session Persistence**: Data saved to localStorage per session
- **Chat History**: Sidebar showing recent conversations
- **Session Isolation**: Each session maintains its own files and process cards

**Storage Structure**:
```javascript
{
  sessionId: string,
  processCards: Array,
  allFiles: Array,
  chatHistory: Array<{id, title, timestamp}>
}
```

### 5. Progress Tracking (SSE)

**Location**: `src/hooks/useProgressStream.js`

Real-time progress updates via Server-Sent Events:

**Event Types**:
- `step_start`: New processing step begins
- `code_start`: Code generation starts
- `code_output`: Code output streaming
- `thought`: AI reasoning/thinking process
- `progress`: General progress updates
- `step_complete`: Step finished successfully
- `step_error`: Step failed
- `file_created`: New artifact created
- `message`: Final response message

**Implementation**:
- Auto-reconnects on connection loss
- Deduplicates events by ID
- Streams code output incrementally
- Handles nested substeps

### 6. RAG (Retrieval Augmented Generation)

**Location**: `src/api/rag.js`, `src/components/layout/Header.jsx`

Features:
- **Document Indexing**: Index uploaded/generated documents for context
- **Status Tracking**: Visual indicator showing RAG availability and indexed status
- **Automatic Indexing**: New documents auto-indexed when RAG is available

### 7. Connect Integration

**Location**: `src/hooks/useConnect.js`, `src/components/connect/ConnectMenu.jsx`

OAuth-based integrations with external services:

**Supported Services**:
- Gmail (Email)
- Google Drive (Storage)
- Google Docs (Document editing)
- HubSpot (CRM)
- Airtable (Database)

**Features**:
- **OAuth Flow**: Popup-based OAuth authentication
- **Connection Status**: Track connected/disconnected state per service
- **Active Toggle**: Enable/disable integrations per session
- **Visual Indicators**: Chips showing active integrations

**Implementation Flow**:
1. User clicks Connect button
2. Dropdown shows available services
3. Click service → OAuth popup opens
4. User authorizes → Popup closes
5. Status updates → Service becomes available
6. Toggle active state to enable for current session

### 8. AI Enhancement

**Location**: `src/features/artifacts/components/EnhancementCard.jsx`

Add AI-generated images to documents:

- **Supported Formats**: DOCX, PPTX, XLSX, PDF
- **Enhancement Process**: 
  1. User clicks "Enhance with AI" button
  2. Backend generates images based on document content
  3. Images inserted into document
  4. New enhanced file created
- **Progress Tracking**: Visual card showing enhancement progress
- **Style Options**: Professional, creative, etc. (configurable)

---

## Components Breakdown

### Layout Components

#### Header (`src/components/layout/Header.jsx`)
- Application branding (Phi Docs logo)
- RAG status indicator
- Clear All button

#### ChatHistorySidebar (`src/components/layout/ChatHistorySidebar.jsx`)
- Collapsible sidebar
- New Chat button
- Session list with timestamps
- Delete session functionality
- User profile stub

### Preview Components

#### DocumentPreview (`src/components/preview/DocumentPreview.jsx`)
**Main preview orchestrator**:
- Routes to appropriate preview component based on file type
- Manages loading states
- Handles page navigation for paginated documents
- Memoized for performance optimization

**Key Features**:
- Loading video overlay during document conversion
- Page navigation controls (Previous/Next)
- Error handling with fallback UI
- Preview URL cache busting

#### ExcelPreview (`src/components/preview/ExcelPreview.jsx`)
- Parses Excel files using `xlsx` library
- Renders as HTML table
- Sticky header row
- Alternating row colors

#### MermaidPreview (`src/components/preview/MermaidPreview.jsx`)
- Renders Mermaid diagrams
- Error handling for invalid syntax
- SVG output display

#### ReactLivePreview (`src/components/preview/ReactLivePreview.jsx`)
- Live React code execution
- Split view: Preview + Code editor
- Error display
- Uses `react-live` library

### Progress Components

#### ProcessCard (`src/components/progress/ProcessCard.jsx`)
- Collapsible card showing AI processing steps
- Status indicators (processing, completed, error)
- Retry functionality for failed operations
- Final result display with markdown rendering

#### ProgressDisplay (`src/components/progress/ProgressDisplay.jsx`)
- Timeline view of processing steps
- Expandable step items
- Code blocks with syntax highlighting
- Thought/reasoning display
- File creation notifications

#### TerminalBlock (`src/components/progress/TerminalBlock.jsx`)
- Code display with syntax highlighting
- Language detection
- Streaming support for live updates

### Common Components

#### FileChip (`src/components/common/FileChip.jsx`)
- File display chip
- File type icon
- Remove button
- Active state styling

#### FileIcon (`src/components/common/FileIcon.jsx`)
- Returns appropriate Lucide icon based on file type
- Supports: Images, Documents, Spreadsheets, Presentations, Code

### Feature Components

#### WelcomeScreen (`src/features/chat/components/WelcomeScreen.jsx`)
- First-time user experience
- Quick action suggestions
- File upload prompt
- Branding display

#### EnhancementCard (`src/features/artifacts/components/EnhancementCard.jsx`)
- AI enhancement progress display
- Status indicators
- View enhanced file button

#### ConnectMenu (`src/components/connect/ConnectMenu.jsx`)
- Dropdown menu for OAuth integrations
- Connection status per service
- Active connector chips
- OAuth initiation flow

---

## Hooks & State Management

### useSession (`src/hooks/useSession.js`)

**Purpose**: Manage conversation sessions

**State**:
- `sessionId`: Current session identifier
- `chatHistory`: List of all sessions

**Methods**:
- `createNewSession()`: Create new session via API
- `selectSession(id)`: Switch to different session
- `deleteSession(id)`: Delete session and its data
- `updateChatHistory(id, title)`: Update session title

**Persistence**: Session data stored in localStorage

### useFiles (`src/hooks/useFiles.js`)

**Purpose**: Manage uploaded files

**State**:
- `uploadedFiles`: Array of uploaded file objects
- `isUploading`: Upload progress flag

**Methods**:
- `uploadFiles(files)`: Upload multiple files
- `removeFile(filename)`: Remove file from list
- `clearFiles()`: Clear all files

**File Object Structure**:
```javascript
{
  filename: string,
  type: string,        // File extension (uppercase)
  url: string,        // Download URL
  previewUrl: string, // Preview URL
  isOutput: boolean,  // Generated vs uploaded
  uploadedAt: string  // ISO timestamp
}
```

### useArtifacts (`src/hooks/useArtifacts.js`)

**Purpose**: Manage generated artifacts (output files)

**State**:
- `outputArtifacts`: Array of artifact objects
- `activeArtifact`: Currently selected artifact
- `artifactContent`: Text content for code/text files
- `previewLoading`: Loading state for previews
- `documentPreviewLoading`: Loading state for documents
- `currentPage`: Current page number (for paginated docs)
- `totalPages`: Total pages count

**Methods**:
- `selectArtifact(artifact)`: Select artifact for preview
- `addArtifacts(artifacts)`: Add new artifacts
- `removeArtifact(filename)`: Remove artifact
- `clearArtifacts()`: Clear all artifacts

### useProgressStream (`src/hooks/useProgressStream.js`)

**Purpose**: Connect to SSE stream for real-time progress

**State**:
- `items`: Array of progress events
- `isConnected`: SSE connection status
- `error`: Error state
- `isComplete`: Stream completion flag

**Methods**:
- `clear()`: Clear progress items

**Event Handling**:
- Parses SSE events
- Deduplicates by ID
- Streams code output incrementally
- Handles nested substeps
- Auto-reconnects on disconnect

### useConnect (`src/hooks/useConnect.js`)

**Purpose**: Manage OAuth integrations

**State**:
- `connectors`: Available integration services
- `connectionStatus`: OAuth connection status per service
- `activeConnectors`: Active state per service (for current session)
- `connectAvailable`: Service availability flag

**Methods**:
- `toggleConnector(appId)`: Toggle active state
- `connectApp(appId)`: Initiate OAuth flow
- `getIntegrations()`: Get active integrations object

**OAuth Flow**:
1. Check connection status
2. If not connected, open OAuth popup
3. Poll for popup close
4. Recheck connection status
5. Auto-activate on successful connection

### useLocalStorage (`src/hooks/useLocalStorage.js`)

**Purpose**: Sync React state with localStorage

**Features**:
- Automatic serialization/deserialization
- Cross-tab synchronization
- Error handling

---

## API Integration

### API Client (`src/api/index.js`)

**Axios Instance Configuration**:
- Base URL: Empty string (uses Vite proxy)
- Timeout: 300 seconds (5 minutes)
- Request/Response interceptors for error handling

### Chat API (`src/api/chat.js`)

**Endpoints**:
- `sendMessage(message, contextFiles, sessionId, activeDocument, currentPage, integrations, signal)`
  - Sends user message to backend
  - Includes context files and active document
  - Supports request cancellation via AbortSignal
  - Returns response with artifacts

- `batchProcess(message, uploadedFiles, sessionId)`
  - Process multiple files with same query

- `getProgressStreamUrl(sessionId)`
  - Returns SSE endpoint URL

### Files API (`src/api/files.js`)

**Endpoints**:
- `uploadFile(file, sessionId)`: Upload single file
- `uploadFiles(files, sessionId)`: Upload multiple files
- `getFileUrl(filename)`: Get download URL
- `getPreviewUrl(filename, cacheBust)`: Get preview URL with cache busting
- `getFileMetadata(filename)`: Get file metadata
- `listArtifacts()`: List all artifacts
- `clearArtifacts()`: Clear all artifacts
- `clearUploads()`: Clear all uploads
- `enhanceWithImages(filename, sessionId, imageStyle)`: Enhance document with AI images

### RAG API (`src/api/rag.js`)

**Endpoints**:
- `getRAGStatus(sessionId)`: Check RAG service availability
- `indexDocument(filename, sessionId)`: Index document for RAG
- `queryDocuments(query, sessionId, topK)`: Query indexed documents
- `removeDocument(filename, sessionId)`: Remove document from index

### Sessions API (`src/api/sessions.js`)

**Endpoints**:
- `createSession()`: Create new session
- `deleteSession(sessionId)`: Delete session

### Vite Proxy Configuration (`vite.config.js`)

All API requests are proxied to `http://localhost:8000`:

```javascript
proxy: {
  '/chat': 'http://localhost:8000',
  '/api': 'http://localhost:8000',
  '/upload': 'http://localhost:8000',
  '/rag': 'http://localhost:8000',
  '/files': 'http://localhost:8000',
  '/preview': 'http://localhost:8000',
  '/artifacts': 'http://localhost:8000',
  '/session': 'http://localhost:8000',
  '/templates': 'http://localhost:8000',
  '/enhance-with-images': 'http://localhost:8000',
  '/connect': 'http://localhost:8000',
}
```

---

## Styling & Theming

### Design System

**Color Palette** (defined in `tailwind.config.js`):

**Background Colors**:
- `light-bg`: `#FAF9F6` - Main warm cream background
- `light-surface`: `#FFFFFF` - White surfaces
- `light-sidebar`: `#F5F3EE` - Sidebar background

**Border Colors**:
- `light-border`: `#E8E4DD` - Default borders
- `light-border-hover`: `#D4CFC5` - Hover state borders

**Text Colors**:
- `light-text`: `#1A1A1A` - Primary text
- `light-text-secondary`: `#6B6B6B` - Secondary text
- `light-text-muted`: `#8B8680` - Muted text

**Brand Colors**:
- `brand-accent`: `#886C4A` - Warm brown/gold accent
  - Shades: 50-900 available
  - Used for primary actions and highlights

**Status Colors**:
- `status-success`: `#27C93F` - Green
- `status-error`: `#FF5F56` - Red
- `status-warning`: `#FFBD2E` - Yellow

**Typography**:
- **Sans**: Inter (system fallbacks)
- **Serif**: Playfair Display (Georgia fallback)
- **Mono**: JetBrains Mono (Fira Code fallback)

**Spacing & Layout**:
- Custom letter spacing utilities
- Custom line height utilities
- Soft shadows for depth

### Custom CSS (`src/index.css`)

**Scrollbar Styling**:
- Custom scrollbar colors matching warm theme
- Thin variant for compact areas
- Hide option for specific elements

**Utility Classes**:
- `.focus-ring`: Focus ring styles
- `.btn-base`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`: Button variants
- `.input-base`: Input field styles
- `.card`, `.card-hover`: Card styles
- `.stable-layout`: Layout stability utilities
- `.transition-stable`: Smooth transitions without layout shifts

**Animations**:
- `.process-card-enter`: Slide-in animation
- Custom keyframes for smooth transitions

### Component Styling Approach

1. **Tailwind Utility Classes**: Primary styling method
2. **CSS Modules**: Not used (pure Tailwind)
3. **Inline Styles**: Minimal, only for dynamic values
4. **Framer Motion**: For animations and transitions

### Responsive Design

- Mobile-first approach
- Breakpoints via Tailwind defaults (sm, md, lg, xl)
- Collapsible sidebars for mobile
- Responsive grid layouts

---

## Build & Development Setup

### Development Server

```bash
npm run dev
```

- Starts Vite dev server
- Hot Module Replacement (HMR) enabled
- Proxy configured for API requests

### Build for Production

```bash
npm run build
```

- Creates optimized production build
- Outputs to `dist/` directory
- Code splitting and minification

### Preview Production Build

```bash
npm run preview
```

- Serves production build locally
- Tests production optimizations

### Linting

```bash
npm run lint
```

- ESLint configuration
- React hooks rules
- React refresh plugin

### Configuration Files

#### `vite.config.js`
- React plugin configuration
- Proxy setup for API requests
- Development server settings

#### `tailwind.config.js`
- Custom color palette
- Typography settings
- Extended theme configuration

#### `postcss.config.js`
- Tailwind CSS plugin
- Autoprefixer plugin

#### `eslint.config.js`
- ESLint flat config format
- React hooks plugin
- React refresh plugin
- Browser globals

### Environment Variables

Currently no environment variables used. API base URL is empty string (uses proxy).

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- CSS Grid and Flexbox
- LocalStorage API
- EventSource API (for SSE)

---

## Key Implementation Details

### Performance Optimizations

1. **Component Memoization**:
   - `DocumentPreview` memoized with custom comparison
   - `ProcessCard` memoized
   - Prevents unnecessary re-renders

2. **Lazy Loading**:
   - Code splitting via Vite
   - Dynamic imports for heavy components

3. **State Management**:
   - LocalStorage persistence for session data
   - Efficient state updates
   - Debounced operations where needed

4. **Rendering Optimizations**:
   - Virtual scrolling considerations
   - Conditional rendering
   - Key props for list items

### Error Handling

1. **API Errors**:
   - Axios interceptors catch errors
   - User-friendly error messages
   - Retry mechanisms for failed requests

2. **File Upload Errors**:
   - Per-file error tracking
   - Error messages displayed to user
   - Failed uploads don't block successful ones

3. **Preview Errors**:
   - Fallback UI for unsupported formats
   - Error states for failed previews
   - Loading state timeouts

### Accessibility

1. **Keyboard Navigation**:
   - Focus management
   - Keyboard shortcuts (where applicable)
   - Tab order

2. **ARIA Labels**:
   - Semantic HTML
   - Button labels
   - Status announcements

3. **Screen Reader Support**:
   - Alt text for images
   - Descriptive labels
   - Status updates

### Security Considerations

1. **XSS Prevention**:
   - React's built-in escaping
   - Sanitized markdown rendering
   - Sandboxed iframes

2. **File Upload Security**:
   - File type validation
   - Size limits (backend)
   - Secure file handling

3. **OAuth Security**:
   - Popup-based OAuth flow
   - Secure token handling (backend)
   - Session isolation

---

## Future Enhancements

### Potential Improvements

1. **State Management**:
   - Consider Context API for global state
   - Redux/Zustand for complex state
   - React Query for server state

2. **Testing**:
   - Unit tests for hooks
   - Component tests with React Testing Library
   - E2E tests with Playwright/Cypress

3. **Performance**:
   - Virtual scrolling for long lists
   - Image lazy loading
   - Code splitting improvements

4. **Features**:
   - Dark mode support
   - Keyboard shortcuts
   - Drag-and-drop file upload
   - Collaborative editing
   - Export conversations

5. **Developer Experience**:
   - TypeScript migration
   - Storybook for components
   - Better error boundaries
   - Enhanced logging

---

## Conclusion

The Phi Docs frontend is a well-structured, modern React application that provides a seamless user experience for AI-powered document processing. The architecture emphasizes:

- **Modularity**: Clear separation of concerns
- **Reusability**: Custom hooks and components
- **Performance**: Optimized rendering and state management
- **User Experience**: Smooth animations and intuitive interface
- **Maintainability**: Clean code structure and documentation

The application successfully integrates multiple complex features including real-time progress tracking, multi-format document preview, OAuth integrations, and AI-powered enhancements, all while maintaining a clean and maintainable codebase.

