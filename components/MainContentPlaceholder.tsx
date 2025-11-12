
import React from 'react';
import { LaptopIcon } from './Icons';

export default function MainContentPlaceholder() {
  return (
    <div className="flex flex-col h-full w-full bg-[#F0F2F5] items-center justify-center text-center border-l border-gray-300 relative">
      <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-200 rounded-full flex items-center justify-center">
        <LaptopIcon className="w-32 h-32 md:w-40 md:h-40 text-gray-400" />
      </div>
      <h1 className="text-2xl md:text-3xl text-gray-600 mt-8 font-light">WS Chatt for Web</h1>
      <p className="text-gray-500 mt-4 max-w-sm px-4">
        Send and receive messages without keeping your phone online.
        <br />
        Use WS Chatt on up to 4 linked devices and 1 phone at the same time.
      </p>
      <div className="absolute bottom-6 text-xs text-gray-400">
        End-to-end encrypted
      </div>
    </div>
  );
}
