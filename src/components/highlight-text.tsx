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
              key={index}
              style={{
                backgroundColor: "#f0f0f0",
                color: isDesc ? "#36454F" : "#d73a49",
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
