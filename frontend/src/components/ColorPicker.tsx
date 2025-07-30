// src/components/ColorPicker.tsx
import React from 'react';

// Define props for the ColorPicker component
interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const colors = [
    "#8B5CF6", // Purple
    "#10B981", // Green
    "#EF4444", // Red
    "#F59E0B", // Amber
    "#3B82F6", // Blue
    "#000000", // Black
    "#FFFFFF", // White (for eraser)
  ];

  return (
    <div className="flex items-center gap-1">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full border-2 transition-transform duration-100 ${
            color === c ? 'scale-110 border-primary shadow-md' : 'border-transparent hover:scale-105'
          }`}
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  );
};
