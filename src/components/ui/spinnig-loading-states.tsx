import React from "react";
import { cn } from "../../utils/utils";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "destructive";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  color = "primary",
}) => {
  const sizeMap = {
    small: 8,
    medium: 16,
    large: 24,
  };

  return (
    <div className="flex justify-center">
      <div
        className={cn(
          "animate-spin rounded-full",
          `h-${sizeMap[size]} w-${sizeMap[size]}`,
          "border-t-2 border-b-2",
          color
        )}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
