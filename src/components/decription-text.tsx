// import React from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// interface DescriptionRendererProps {
//   description: string;
// }

// const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({
//   description,
// }) => {
//   return (
//     <ReactMarkdown
//       className={"text-sm text-secondary-foreground/80"}
//       children={description}
//       remarkPlugins={[remarkGfm]}
//       components={{
//         table: ({ children }) => (
//           <div className="table-wrapper">
//             <table className="styled-table">{children}</table>
//           </div>
//         ),
//         img: ({ src, alt }) => (
//           <div className="image-container">
//             <img
//               src={src || ""}
//               alt={alt || "Image"}
//               className="responsive-image"
//             />
//           </div>
//         ),
//         a: ({ href, children }) => (
//           <a
//             href={href}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="markdown-link"
//           >
//             {children}
//           </a>
//         ),
//       }}
//     />
//   );
// };

// export default DescriptionRenderer;

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DescriptionRendererProps {
  description: string;
}

const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({
  description,
}) => {
  return (
    <ReactMarkdown
      className="prose prose-sm max-w-none whitespace-pre-wrap break-words text-sm text-secondary-foreground/80"
      children={description}
      remarkPlugins={[remarkGfm]}
      components={{
        // Add proper wrapping to code blocks
        code: ({ className, children, ...props }) => (
          <code
            className={`${className} whitespace-pre-wrap break-words bg-secondary-darker`}
            {...props}
          >
            {children}
          </code>
        ),
        // Ensure tables are responsive
        table: ({ children }) => (
          <div className="w-full overflow-x-auto">
            <table className="styled-table table-auto border-collapse">
              {children}
            </table>
          </div>
        ),
        // Make images responsive
        img: ({ src, alt }) => (
          <div className="max-w-80">
            <img
              src={src || ""}
              alt={alt || "Image"}
              className="h-auto max-w-full object-contain"
            />
          </div>
        ),
        // Style links and ensure they wrap
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words text-blue-500 underline hover:text-blue-600"
          >
            {children}
          </a>
        ),
        // Ensure paragraphs wrap properly
        p: ({ children }) => (
          <p className="whitespace-pre-wrap break-words">{children}</p>
        ),
        // Style pre blocks for code
        pre: ({ children }) => (
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap rounded bg-secondary-darker">
            {children}
          </pre>
        ),
      }}
    />
  );
};

export default DescriptionRenderer;
