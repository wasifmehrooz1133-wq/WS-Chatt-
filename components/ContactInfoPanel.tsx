

import React from 'react';
import { Chat, Member } from '../types';
import { ChevronLeftIcon, PhoneIcon, VideoIcon, SearchIcon, BellIcon, ImageIcon, LockIcon, ClockIcon, BanIcon, FlagIcon, ListPlusIcon, EyeIcon, LogOutIcon } from './Icons';

interface ContactInfoPanelProps {
    chat: Chat;
    onClose: () => void;
}

const InfoSection: React.FC<{ children: React.ReactNode, title?: string }> = ({ children, title }) => (
    <div className="bg-white rounded-lg shadow-sm mb-4">
        {title && <h3 className="px-4 pt-4 pb-2 text-primary font-semibold text-sm">{title}</h3>}
        <div className="px-4 py-2">{children}</div>
    </div>
);

const InfoItem: React.FC<{ icon: React.ElementType; title: string; subtitle?: string; hasToggle?: boolean; }> = ({ icon: Icon, title, subtitle, hasToggle }) => (
    <div className="flex items-center py-3">
        <Icon className="w-6 h-6 text-gray-500 mr-5" />
        <div className="flex-1">
            <p className="text-gray-800">{title}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {hasToggle && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color-light)]"></div>
            </label>
        )}
    </div>
);

const MemberItem: React.FC<{ member: Member }> = ({ member }) => (
     <div className="flex items-center py-2">
        <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full mr-4" />
        <div className="flex-1">
            <p className="text-gray-800 font-semibold">{member.name}</p>
            {member.isUser && <p className="text-xs text-gray-500">You</p>}
        </div>
    </div>
);

export default function ContactInfoPanel({ chat, onClose }: ContactInfoPanelProps) {
    const isGroup = chat.isGroup;
    const members = chat.members || [];
    const aiMembers = members.filter(m => !m.isUser);
    const userMember = members.find(m => m.isUser);

    return (
        <div className="absolute inset-0 bg-black bg-opacity-30 z-30 flex justify-end">
            <div className="w-full max-w-sm h-full bg-[#F0F2F5] shadow-2xl flex flex-col animate-slide-in">
                <header className="bg-white px-4 py-3 flex items-center shadow-sm min-h-[60px]">
                    <button onClick={onClose} className="mr-6 text-gray-600">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">{isGroup ? 'Group info' : 'Contact info'}</h2>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                    <InfoSection>
                        <div className="flex flex-col items-center py-4">
                            <img src={chat.avatarUrl} alt={`${chat.name} Avatar`} className="w-24 h-24 rounded-full mb-3" />
                            <h3 className="text-xl font-semibold">{chat.name}</h3>
                            <p className="text-gray-500">{isGroup ? `Group • ${members.length} members` : 'online'}</p>
                        </div>
                        {!isGroup && (
                            <div className="flex justify-center space-x-8 py-3 border-t border-gray-200">
                                <button className="flex flex-col items-center text-primary"><PhoneIcon className="w-6 h-6 mb-1"/> Audio</button>
                                <button className="flex flex-col items-center text-primary"><VideoIcon className="w-6 h-6 mb-1"/> Video</button>
                                <button className="flex flex-col items-center text-primary"><SearchIcon className="w-6 h-6 mb-1"/> Search</button>
                            </div>
                        )}
                    </InfoSection>

                    {!isGroup && (
                        <InfoSection>
                            <p className="text-gray-600 text-sm py-2">Versatile AI assistant ready to help with your tasks.</p>
                        </InfoSection>
                    )}
                    
                    {isGroup && (
                        <InfoSection title={`${members.length} Members`}>
                            {userMember && <MemberItem member={userMember} />}
                            {aiMembers.map(member => <MemberItem key={member.id} member={member} />)}
                        </InfoSection>
                    )}

                    <InfoSection>
                        <InfoItem icon={BellIcon} title="Mute notifications" hasToggle />
                        <InfoItem icon={ImageIcon} title="Media visibility" subtitle="Show newly downloaded media from this chat in your device's gallery" />
                         <InfoItem icon={EyeIcon} title="Media, links, and docs" subtitle="12 files" />
                    </InfoSection>

                    <InfoSection>
                        <InfoItem icon={LockIcon} title="Encryption" subtitle="Messages are end-to-end encrypted. Tap to verify." />
                        <InfoItem icon={ClockIcon} title="Disappearing messages" subtitle="Off" />
                        {!isGroup && <InfoItem icon={BanIcon} title="Advanced chat privacy" subtitle="Use a secret code to find this chat" />}
                    </InfoSection>

                    <InfoSection>
                        {isGroup ? (
                            <>
                            <button className="w-full flex items-center py-3 text-red-500">
                               <LogOutIcon className="w-6 h-6 mr-5" /> Exit group
                            </button>
                             <button className="w-full flex items-center py-3 text-red-500">
                               <FlagIcon className="w-6 h-6 mr-5" /> Report group
                            </button>
                            </>
                        ) : (
                            <>
                            <button className="w-full flex items-center py-3 text-red-500">
                               <BanIcon className="w-6 h-6 mr-5" /> Block {chat.name}
                            </button>
                             <button className="w-full flex items-center py-3 text-red-500">
                               <FlagIcon className="w-6 h-6 mr-5" /> Report {chat.name}
                            </button>
                             <button className="w-full flex items-center py-3 text-primary">
                               <ListPlusIcon className="w-6 h-6 mr-5" /> Add to List
                            </button>
                            </>
                        )}
                    </InfoSection>
                </div>
            </div>
             <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}
