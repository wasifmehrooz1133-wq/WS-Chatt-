import React from 'react';
import { SplashLogo } from './Icons';

interface SplashScreenProps {
  isFading: boolean;
}

export default function SplashScreen({ isFading }: SplashScreenProps) {
  return (
    <div className={`fixed inset-0 bg-primary flex flex-col items-center justify-center z-50 transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center animate-fade-in">
        <SplashLogo className="w-24 h-24 text-white mx-auto" />
        <h1 className="text-4xl font-bold text-white mt-6" style={{ fontFamily: 'sans-serif' }}>
          WS Chatt
        </h1>
      </div>
    </div>
  );
}