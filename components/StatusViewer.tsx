import React, { useState, useEffect, useRef } from 'react';
import { ContactStatus, StatusUpdate } from '../types';
import { XIcon } from './Icons';

interface StatusViewerProps {
    contactStatus: ContactStatus;
    onClose: () => void;
}

const ProgressBar: React.FC<{ duration: number, isActive: boolean, onFinished: () => void }> = ({ duration, isActive, onFinished }) => {
    const [progress, setProgress] = useState(0);
// Fix: Initialized useRef with null to prevent "Expected 1 arguments, but got 0" error in some environments.
    const requestRef = useRef<number | null>(null);
// Fix: Initialized useRef with null to prevent "Expected 1 arguments, but got 0" error in some environments.
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive) {
            startTimeRef.current = performance.now();
            const animate = (time: number) => {
                const elapsedTime = time - (startTimeRef.current || 0);
                const newProgress = (elapsedTime / duration) * 100;
                if (newProgress < 100) {
                    setProgress(newProgress);
                    requestRef.current = requestAnimationFrame(animate);
                } else {
                    setProgress(100);
                    onFinished();
                }
            };
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setProgress(0); // Reset if not active
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isActive, duration, onFinished]);

    return (
        <div className="w-full bg-gray-500 bg-opacity-50 h-1 rounded-full overflow-hidden">
            <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${isActive ? progress : 0}%` }}
            ></div>
        </div>
    );
};


export default function StatusViewer({ contactStatus, onClose }: StatusViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextStatus = () => {
        if (currentIndex < contactStatus.updates.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const prevStatus = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
        const clickX = e.clientX;
        const screenThird = window.innerWidth / 3;
        if (clickX < screenThird) {
            prevStatus();
        } else {
            nextStatus();
        }
    };

    const handleMouseDown = () => setIsPaused(true);
    const handleMouseUp = () => setIsPaused(false);
    
    useEffect(() => {
        // Close with escape key
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const currentUpdate = contactStatus.updates[currentIndex];

    return (
        <div 
            className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in-fast"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
        >
            <div className="absolute top-0 left-0 right-0 p-4 z-10">
                <div className="flex items-center gap-2 mb-2">
                    {contactStatus.updates.map((update, index) => (
                         <ProgressBar
                            key={update.id}
                            duration={update.duration || 5000}
                            isActive={!isPaused && index === currentIndex}
                            onFinished={nextStatus}
                        />
                    ))}
                </div>
                <div className="flex items-center">
                    <img src={contactStatus.contactAvatarUrl} alt={contactStatus.contactName} className="w-10 h-10 rounded-full mr-3" />
                    <div className="text-white">
                        <p className="font-bold">{contactStatus.contactName}</p>
                        <p className="text-xs">{new Date(currentUpdate.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-white p-2">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="relative w-full h-full flex items-center justify-center">
                {currentUpdate.type === 'image' ? (
                     <img src={currentUpdate.content} alt="Status update" className="max-w-full max-h-full object-contain" />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center p-8 text-center"
                        style={{ backgroundColor: currentUpdate.backgroundColor || '#075E54' }}
                    >
                        <p className="text-white text-3xl font-bold">{currentUpdate.content}</p>
                    </div>
                )}
                 {/* Click handlers */}
                <div className="absolute inset-0 grid grid-cols-3">
                    <div onClick={prevStatus} className="h-full"></div>
                    <div className="h-full"></div>
                    <div onClick={nextStatus} className="h-full"></div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
}