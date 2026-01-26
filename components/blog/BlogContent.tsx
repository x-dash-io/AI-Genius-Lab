"use client";

import React from "react";

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  // Simple markdown-like parser for blog content
  // In a real implementation, you might use a markdown library like react-markdown
  
  const parseContent = (text: string) => {
    // Split by double newlines to create paragraphs
    const sections = text.split(/\n\n/);
    
    return sections.map((section, index) => {
      // Handle headers
      if (section.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
            {section.replace("## ", "")}
          </h2>
        );
      }
      
      if (section.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
            {section.replace("### ", "")}
          </h3>
        );
      }
      
      // Handle lists
      if (section.includes("\n- ")) {
        const items = section.split("\n- ").filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        );
      }
      
      // Handle code blocks
      if (section.startsWith("```")) {
        const code = section.replace(/```[\w]*\n?/, "").replace(/```$/, "");
        return (
          <pre key={index} className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
            <code className="text-sm">{code}</code>
          </pre>
        );
      }
      
      // Handle inline code
      const processedText = section.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
      
      // Regular paragraph
      return (
        <p key={index} className="text-muted-foreground leading-relaxed my-4" 
           dangerouslySetInnerHTML={{ __html: processedText }} />
      );
    });
  };
  
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {parseContent(content)}
    </div>
  );
}
