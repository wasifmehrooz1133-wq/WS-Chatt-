import React from 'react';
import { Chat } from '../types';
import { PhoneIcon } from './Icons';

interface IncomingCallProps {
    contact: Chat;
    onAccept: () => void;
    onDecline: () => void;
}

export default function IncomingCall({ contact, onAccept, onDecline }: IncomingCallProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-between p-8 text-white animate-fade-in-fast">
             <div className="text-center mt-16">
                <h2 className="text-3xl font-bold">{contact.name}</h2>
                <p className="text-lg opacity-80">WS Chatt Incoming Call</p>
            </div>

            <img src={contact.avatarUrl} alt={contact.name} className="w-40 h-40 rounded-full ring-4 ring-white ring-opacity-20" />

            <div className="flex w-full justify-around items-center mb-16">
                 <div className="text-center">
                    <button onClick={onDecline} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600">
                        {/* Fix: Replaced unsupported 'style' prop with a Tailwind CSS class for rotation. */}
                        <PhoneIcon className="w-10 h-10 rotate-[135deg]"/>
                    </button>
                    <p className="mt-2">Decline</p>
                </div>
                 <div className="text-center">
                    <button onClick={onAccept} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600">
                        <PhoneIcon className="w-10 h-10" />
                    </button>
                    <p className="mt-2">Accept</p>
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