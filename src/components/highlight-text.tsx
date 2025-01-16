import { cn } from "@/lib/utils";
import React from "react";

interface HighlightBackticksProps {
  text: string;
  isDesc?: boolean;
}

const HighlightBackticks: React.FC<HighlightBackticksProps> = ({
  text,
  isDesc,
}) => {
  const parts = text.split(/(`[^`]+`)/);

  return (
    <p>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              className={cn(
                "bg-secondary-darker",
                isDesc
                  ? "text-secondary-foreground/70"
                  : "text-secondary-foreground/90",
              )}
              key={index}
              style={{
                padding: "2px 4px",
                borderRadius: "4px",
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};

export default HighlightBackticks;
