
import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center space-x-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
}
