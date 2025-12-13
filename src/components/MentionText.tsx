import React from 'react';

interface MentionTextProps {
  content: string;
  onMentionClick?: (username: string) => void;
  className?: string;
}

/**
 * Component that parses text content and renders @mentions as clickable links
 * Supports both @username and @[Display Name](userId) formats
 */
const MentionText: React.FC<MentionTextProps> = ({ 
  content, 
  onMentionClick,
  className = ''
}) => {
  // Regular expressions to match mentions
  // Matches: @username (alphanumeric + underscore)
  const mentionRegex = /@(\w+)/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Parse the content and extract mentions
  while ((match = mentionRegex.exec(content)) !== null) {
    const matchStart = match.index;
    const matchEnd = mentionRegex.lastIndex;

    // Add text before the mention
    if (matchStart > lastIndex) {
      parts.push(content.substring(lastIndex, matchStart));
    }

    // Extract username (without the @)
    const username = match[1];

    // Add the clickable mention
    parts.push(
      <span
        key={matchStart}
        onClick={(e) => {
          e.stopPropagation();
          if (onMentionClick) {
            onMentionClick(username);
          }
        }}
        className="text-orange-500 font-medium hover:underline cursor-pointer transition-colors"
      >
        @{username}
      </span>
    );

    lastIndex = matchEnd;
  }

  // Add remaining text after the last mention
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return <span className={className}>{parts.length > 0 ? parts : content}</span>;
};

export default MentionText;
