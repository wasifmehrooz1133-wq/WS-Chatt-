import React, { useState, useEffect } from 'react';
import { Chat } from '../types';
import { PhoneIcon, VideoIcon, MicrophoneIcon, SpeakerIcon } from './Icons';

interface CallScreenProps {
    contact: Chat;
    type: 'voice' | 'video';
    status: 'ringing' | 'connected' | 'ended';
    duration: number;
    onEndCall: () => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function CallScreen({ contact, type, status, duration, onEndCall }: CallScreenProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const [isVideo, setIsVideo] = useState(type === 'video');

    const statusText = {
        ringing: 'Ringing...',
        connected: formatTime(duration),
        ended: 'Call ended'
    }[status];

    return (
        <div className="absolute inset-0 bg-gray-800 z-50 flex flex-col items-center justify-between p-8 text-white animate-fade-in-fast">
            <div className="text-center mt-16">
                <img src={contact.avatarUrl} alt={contact.name} className="w-32 h-32 rounded-full mb-4 ring-4 ring-white ring-opacity-20" />
                <h2 className="text-3xl font-bold">{contact.name}</h2>
                <p className="text-lg opacity-80">{statusText}</p>
            </div>

            <div className="flex items-center justify-center space-x-8 mb-16">
                <button onClick={() => setIsSpeaker(!isSpeaker)} className={`p-4 rounded-full transition-colors ${isSpeaker ? 'bg-white text-gray-800' : 'bg-white bg-opacity-20'}`}>
                    <SpeakerIcon className="w-8 h-8" />
                </button>
                 <button onClick={() => setIsVideo(!isVideo)} className={`p-4 rounded-full transition-colors ${isVideo ? 'bg-white text-gray-800' : 'bg-white bg-opacity-20'}`}>
                    <VideoIcon className="w-8 h-8" />
                </button>
                 <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-white text-gray-800' : 'bg-white bg-opacity-20'}`}>
                    <MicrophoneIcon className="w-8 h-8" />
                </button>
            </div>
            
             <button onClick={onEndCall} className="bg-red-500 p-5 rounded-full hover:bg-red-600">
                {/* Fix: Replaced unsupported 'style' prop with a Tailwind CSS class for rotation. */}
                <PhoneIcon className="w-8 h-8 rotate-[135deg]" />
            </button>

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