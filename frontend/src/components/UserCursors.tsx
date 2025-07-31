
import React, { useState, useEffect } from 'react';

// Define type for a collaborator
interface Collaborator {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

// Define props for UserCursors component
interface UserCursorsProps {
  collaborators: Collaborator[];
}

export const UserCursors: React.FC<UserCursorsProps> = ({ collaborators }) => {
  // Mock cursor positions for demo. In a real app, these would come from Socket.IO.
  const [cursorPositions, setCursorPositions] = useState<{ [key: string]: { x: number; y: number } }>({});

  useEffect(() => {
    // Simulate cursor movement for mock collaborators
    const interval = setInterval(() => {
      const newPositions: { [key: string]: { x: number; y: number } } = {};
      collaborators.forEach(collab => {
        if (collab.isActive) {
          newPositions[collab.id] = {
            x: Math.random() * (window.innerWidth - 100) + 50, // Random X within bounds
            y: Math.random() * (window.innerHeight - 100) + 50, // Random Y within bounds
          };
        }
      });
      setCursorPositions(newPositions);
    }, 500); // Update every 500ms

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [collaborators]);

  return (
    <>
      {collaborators.map((collab) => {
        const position = cursorPositions[collab.id];
        if (!position) return null; // Don't render if no position yet

        return (
          <div
            key={collab.id}
            className="absolute z-20 pointer-events-none transition-transform duration-100 ease-out"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -50%)', // Center the cursor on the coordinates
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={collab.color}
              stroke={collab.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-mouse-pointer-2 drop-shadow-md"
            >
              <path d="m4 4 7.07 17 2.51-7.31L21 11.07Z"/>
              <path d="M11.07 11.07 4 4"/>
            </svg>
            {/* Collaborator Name Tag */}
            <span
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-md shadow-sm whitespace-nowrap"
              style={{ backgroundColor: collab.color, color: 'white' }}
            >
              {collab.name}
            </span>
          </div>
        );
      })}
    </>
  );
};
