
import React from 'react';

// Define type for a collaborator
interface Collaborator {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

// Define props for CollaboratorsList component
interface CollaboratorsListProps {
  collaborators: Collaborator[];
}

export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ collaborators }) => {
  return (
    <div className="flex items-center -space-x-2">
      {collaborators.map((collab) => (
        <div
          key={collab.id}
          className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm font-semibold text-white shadow-md"
          style={{ backgroundColor: collab.color }}
          title={collab.name}
        >
          {collab.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {/* Add a placeholder for more users */}
      {collaborators.length > 3 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700 shadow-md">
          +{collaborators.length - 3}
        </div>
      )}
    </div>
  );
};
