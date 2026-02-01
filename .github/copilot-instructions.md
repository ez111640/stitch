# Stitchuation Copilot Instructions

## Project Overview
**Stitchuation** is a React-based creative design application built with Create React App. The app integrates multiple text editing and canvas manipulation libraries to enable users to create, style, and manipulate text and visual content. The project currently focuses on text editing capabilities with plans to expand curved/axis-based text manipulation.

### Key Goals
- Enable users to input and manipulate text along curves and axes
- Provide rich text editing capabilities
- Support canvas-based visual design and manipulation

## Architecture & Components

### Core Structure
```
src/
├── App.js              # Main app entry (renders TextEditor)
├── TextEditor.js       # Quill-based rich text editor with circular display
├── pages/
│   ├── HomePage.js     # Landing page with feature overview
│   ├── CanvasPage.js   # Fabric.js canvas for drawing/manipulation
│   └── AboutPage.js    # About page
└── styles/
    ├── TextEditor.css  # SVG text manipulation styles
    └── HomePage.css    # Landing page styles
```

### Dependencies
- **Text Editing**: `quill` (^2.0.3) - WYSIWYG editor with toolbar
- **Canvas**: `fabric.js` (^7.1.0) - Interactive object manipulation
- **Rich Text**: `@tinymce/tinymce-react` (^6.3.0) - Alternative editor (optional)
- **Draft.js** (^0.11.7) - Content state management (optional)
- **Routing**: `react-router-dom` (^7.13.0) - Multi-page navigation

## Development Patterns

### TextEditor Component Pattern
- Uses `useRef` to hold Quill instance (not state) to preserve editor state across renders
- Implements proper cleanup in useEffect return to destroy Quill on unmount
- Captures content via `'text-change'` event listener and stores in React state
- Strips HTML tags when displaying plain text: `content.replace(/<[^>]+>/g, '')`

### Styling Convention
- Component-specific CSS files placed in `src/styles/` or co-located with components
- `.curved-text` class already exists for SVG-based text manipulation (flexbox centered)
- Inline styles used for layout (flex, display) when component-specific

### Canvas Integration Pattern
- CanvasPage initializes Fabric.js canvas on mount
- Canvas ID must match element ID in JSX (`id="canvas"`)
- Fabric objects (Rect, Circle, etc.) added to canvas instance

## Development Workflow

### Running the App
```bash
npm start        # Development server (http://localhost:3000)
npm run build    # Production build
npm test         # Run tests
```

### Key Considerations
- **No routing configured yet** - Add React Router implementation for multi-page navigation (pages exist but not wired)
- **Text manipulation**: Extend TextEditor to render text along SVG paths using `<path>` elements and `<textPath>` for curved text
- **Quill customization**: Toolbar modules in TextEditor line 16-22 can be extended for text transform tools
- **State management**: Currently local component state; consider lifting state for multi-component coordination

## Text Manipulation Implementation Path
When implementing curved/axis text:
1. Capture text from Quill editor (already done via `content` state)
2. Generate SVG `<path>` for desired curve/axis
3. Render text on path using `<textPath>` element
4. Add controls to adjust path bezier curves, rotation, scale
5. Consider using `fabric.js` Path objects for interactive manipulation

## File Patterns to Follow
- React functional components with hooks
- useRef for DOM/external library management
- Separate styles into component CSS files
- Clean up subscriptions/listeners in useEffect cleanup functions
