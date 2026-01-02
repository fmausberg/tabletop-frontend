import React, { useState } from "react";
import Heading from "./heading";

interface DivMainLeftProps {
  children: React.ReactNode;
}

export const DivMainLeft: React.FC<DivMainLeftProps> = ({ children }) => {
  // Remove fixed width, use "w-auto" and "flex-shrink-0" so it only takes as much space as needed
  return <div className="w-auto flex-shrink-0">{children}</div>;
};

interface DivMainRightProps {
  children: React.ReactNode;
}

export const DivMainRight: React.FC<DivMainRightProps> = ({ children }) => {
  // Remove fixed width, use flex-1 so it takes the remaining space
  return <div className="flex-1 flex flex-col gap-y-4">{children}</div>;
};

interface DivBlockProps {
  children: React.ReactNode;
  header?: React.ReactNode; // Optional header for the block
  type?: "menu" | "default"; // NEW: type attribute
}

export const DivBlock: React.FC<DivBlockProps> = ({ children, header, type = "default" }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // If type is "menu", expand/collapse horizontally (width), else vertically (height/content)
  if (type === "menu") {
    return (
      <div
        className={`bg-white border-r border-gray-200 p-4 rounded-lg shadow-lg transition-all duration-300`}
        style={{
          overflow: "hidden",
          width: isExpanded ? "auto" : "3.5rem", // 3.5rem ≈ w-16 in Tailwind
          minWidth: isExpanded ? undefined : "3.5rem",
          maxWidth: isExpanded ? "100%" : "3.5rem",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          {isExpanded ? (
            <>
              {header && <Heading>{header}</Heading>}
              <button
                onClick={toggleExpand}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Collapse menu"
              >
                ◀
              </button>
            </>
          ) : (
            <button
              onClick={toggleExpand}
              className="text-gray-500 hover:text-gray-700 focus:outline-none ml-auto"
              aria-label="Expand menu"
            >
              ▶
            </button>
          )}
        </div>
        <div style={{ display: isExpanded ? "block" : "none" }}>{children}</div>
      </div>
    );
  }

  // Default: vertical expand/collapse
  return (
    <div className="bg-white border-r border-gray-200 p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        {header && <Heading>{header}</Heading>}
        <button
          onClick={toggleExpand}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>
      {isExpanded && <div>{children}</div>}
    </div>
  );
};

