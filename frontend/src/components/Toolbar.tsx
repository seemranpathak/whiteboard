// src/components/Toolbar.tsx
import React from 'react';
import type { DrawingTool } from '../Whiteboard'; // Import DrawingTool type

// Define props for the Toolbar component
interface ToolbarProps {
  activeTool: DrawingTool;
  onToolClick: (tool: DrawingTool) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolClick,
  onClear,
  onUndo,
  onRedo,
}) => {
  // Helper function to apply active styling
  const getButtonClass = (tool: DrawingTool) =>
    `p-2 rounded-md transition-colors duration-200 ${
      activeTool === tool
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`;

  const getActionClass = () =>
    `p-2 rounded-md transition-colors duration-200 text-muted-foreground hover:bg-accent hover:text-accent-foreground`;

  return (
    <div className="flex items-center gap-1">
      {/* Select Tool Button */}
      <button
        onClick={() => onToolClick("select")}
        className={getButtonClass("select")}
        title="Select"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mouse-pointer-2"><path d="m4 4 7.07 17 2.51-7.31L21 11.07Z"/><path d="M11.07 11.07 4 4"/></svg>
      </button>

      {/* Draw Tool Button (Pen) */}
      <button
        onClick={() => onToolClick("draw")}
        className={getButtonClass("draw")}
        title="Pen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      </button>

      {/* Rectangle Tool Button */}
      <button
        onClick={() => onToolClick("rectangle")}
        className={getButtonClass("rectangle")}
        title="Rectangle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rectangle"><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
      </button>

      {/* Circle Tool Button */}
      <button
        onClick={() => onToolClick("circle")}
        className={getButtonClass("circle")}
        title="Circle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle"><circle cx="12" cy="12" r="10"/></svg>
      </button>

      {/* Eraser Tool Button */}
      <button
        onClick={() => onToolClick("eraser")}
        className={getButtonClass("eraser")}
        title="Eraser"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eraser"><path d="M22 2L11 13"/><path d="M15.5 8.5 8.5 15.5C6.9 17.1 5 18 3 18c-1 0-2 0-3-1s-1-3 0-4c1.1-1.2 2.5-2.1 4-2.5 1.5-.4 3-.5 4.5-.3L22 2Z"/></svg>
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-tool-border mx-1" />

      {/* Undo Button */}
      <button
        onClick={onUndo}
        className={getActionClass()}
        title="Undo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo-2"><path d="M9.5 12.5 7 10 9.5 7.5"/><path d="M17.5 6.5V10H7"/><path d="M3 10a7 7 0 0 0 14 0 7 7 0 0 0-14 0"/></svg>
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        className={getActionClass()}
        title="Redo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-redo-2"><path d="m14.5 12.5 2.5 2.5-2.5 2.5"/><path d="M6.5 17.5V14H17"/><path d="M21 14a7 7 0 0 0-14 0 7 7 0 0 0 14 0"/></svg>
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-tool-border mx-1" />

      {/* Clear Canvas Button */}
      <button
        onClick={onClear}
        className={getActionClass()}
        title="Clear Canvas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
      </button>
    </div>
  );
};
