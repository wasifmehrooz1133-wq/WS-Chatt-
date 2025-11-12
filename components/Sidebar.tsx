

import React, { useState, useRef, useEffect } from 'react';
import { Chat, ContactStatus, Member, Call, UserContact } from '../types';
import { Tab } from '../App';
import { MoreVerticalIcon, SearchIcon, MessageSquarePlusIcon, UsersIcon, LinkIcon, StarIcon, CheckCircleIcon, SettingsIcon, PhoneIcon, ArrowDownLeftIcon, VideoIcon as VideoCallIcon, UserPlusIcon, CameraIcon, ChevronLeftIcon, ArchiveIcon, LockIcon, Trash2Icon, FileClockIcon, MessageSquareTextIcon, PlusIcon, BotIcon, BookOpenIcon, GlobeIcon, PaletteIcon, ArrowRightIcon, CheckIcon, ArrowUpRightIcon } from './Icons';

interface SidebarProps {
    chats: Chat[];
    activeChatId?: string;
    onOpenSettings: () => void;
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onSelectChat: (chatId: string) => void;
    onCreateChat: (contact: Omit<Chat, 'id' | 'messages'>) => void;
    onCreateGroup: (members: Omit<Member, 'isUser'>[], groupName: string) => void;
    statuses: ContactStatus[];
    onViewStatus: (contactId: string) => void;
    callHistory: Call[];
    onStartCall: (chat: Chat, type: 'voice' | 'video') => void;
    onSimulateIncomingCall: () => void;
    userContacts: UserContact[];
    onAddUserContact: (name: string) => void;
}

const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
};

const getLastMessage = (chat: Chat) => chat.messages[chat.messages.length - 1];

const ChatsList: React.FC<{ chats: Chat[], activeChatId?: string, onShowContacts: () => void, onSelectChat: (id: string) => void, searchQuery: string }> = ({ chats, activeChatId, onShowContacts, onSelectChat, searchQuery }) => {
    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col relative">
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                {filteredChats.map((chat) => {
                    const lastMessage = getLastMessage(chat);
                    return (
                        <div key={chat.id} onClick={() => onSelectChat(chat.id)} className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-xl transition-colors duration-150 ${activeChatId === chat.id ? 'bg-primary-lightest' : 'bg-white shadow-sm'}`}>
                            <div className="relative mr-4">
                                <img src={chat.avatarUrl} alt={`${chat.name} Avatar`} className="w-12 h-12 rounded-full" />
                                 {chat.isGroup && (
                                    <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow">
                                        <UsersIcon className="w-4 h-4 text-gray-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-gray-800 truncate">{chat.name}</p>
                                    <p className={`text-xs font-semibold ${activeChatId === chat.id ? 'text-primary' : 'text-gray-400'}`}>
                                        {lastMessage?.timestamp ? formatTimestamp(lastMessage.timestamp) : ''}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {lastMessage ? (lastMessage.sender === 'user' ? `You: ${lastMessage.text || '...'}` : `${lastMessage.senderName || ''}: ${lastMessage.text || '...'}`) : 'No messages yet'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button 
                onClick={onShowContacts}
                className="absolute bottom-6 right-6 bg-primary-light text-white p-4 rounded-2xl shadow-lg hover:bg-primary-dark transition-transform duration-200 hover:scale-105"
                aria-label="New chat"
            >
                <MessageSquarePlusIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

const AI_CONTACTS = [
    { id: 'ai-assistant-chat', name: 'AI Assistant', seed: 'ws-chatt-ai', icon: BotIcon, systemInstruction: 'You are a helpful and friendly AI assistant. Your name is WS Chatt AI.', avatarUrl: `https://picsum.photos/seed/ws-chatt-ai/50/50` },
    { id: 'creative-writer', name: 'Creative Writer', seed: 'writer', icon: BookOpenIcon, systemInstruction: 'You are a world-class creative writer, poet, and storyteller. You help users brainstorm ideas, write stories, craft poems, and refine their creative work with insightful suggestions.', avatarUrl: `https://picsum.photos/seed/writer/50/50` },
    { id: 'travel-guide', name: 'Travel Guide', seed: 'travel', icon: GlobeIcon, systemInstruction: 'You are an expert travel guide. You have immense knowledge about destinations worldwide. You can create itineraries, suggest hidden gems, provide cultural context, and answer any travel-related questions. You should leverage location data when available to give personalized recommendations.', avatarUrl: `https://picsum.photos/seed/travel/50/50` },
    { id: 'image-prompter', name: 'Image Prompter', seed: 'image-gen', icon: PaletteIcon, systemInstruction: 'You are an AI assistant specializing in creating detailed, vivid prompts for image generation models. When a user gives you an idea, you expand on it, adding details about style, lighting, composition, and mood to create the best possible prompt.', avatarUrl: `https://picsum.photos/seed/image-gen/50/50` },
];

const NewGroupFlow: React.FC<{ onBack: () => void; onCreateGroup: (members: Omit<Member, 'isUser'>[], groupName: string) => void; }> = ({ onBack, onCreateGroup }) => {
    const [step, setStep] = useState<'select' | 'details'>('select');
    const [selectedMembers, setSelectedMembers] = useState<Omit<Member, 'isUser'>[]>([]);
    const [groupName, setGroupName] = useState('');

    const handleToggleMember = (contact: typeof AI_CONTACTS[0]) => {
        const member = { id: contact.id, name: contact.name, avatarUrl: contact.avatarUrl, systemInstruction: contact.systemInstruction };
        setSelectedMembers(prev => 
            prev.find(m => m.id === member.id) 
            ? prev.filter(m => m.id !== member.id) 
            : [...prev, member]
        );
    };
    
    const handleCreateGroup = () => {
        if (groupName.trim() && selectedMembers.length > 0) {
            onCreateGroup(selectedMembers, groupName);
        }
    }

    if (step === 'details') {
        return (
             <div className="flex-1 flex flex-col bg-white">
                <header className="bg-primary text-white px-4 py-3 flex items-center shadow-md min-h-[60px] pt-5">
                    <button onClick={() => setStep('select')} className="mr-6"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <h2 className="text-lg font-semibold">New group</h2>
                </header>
                 <div className="p-4 flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                       <img src={`https://picsum.photos/seed/${groupName.replace(/\s+/g, '-') || 'new-group'}/128/128`} className="w-32 h-32 rounded-full" alt="Group Avatar" />
                        <button className="absolute bottom-1 right-1 bg-primary-light text-white p-2 rounded-full shadow-md hover:bg-primary-dark"><CameraIcon className="w-6 h-6" /></button>
                    </div>
                     <input 
                        type="text" 
                        value={groupName} 
                        onChange={(e) => setGroupName(e.target.value)} 
                        placeholder="Group name"
                        className="w-full text-center text-lg border-b-2 border-primary focus:outline-none py-2"
                        autoFocus
                    />
                    <p className="text-sm text-gray-500 mt-2">Selected: {selectedMembers.length} contacts</p>
                </div>
                <div className="mt-auto p-6">
                     <button 
                        onClick={handleCreateGroup}
                        disabled={!groupName.trim() || selectedMembers.length === 0}
                        className="w-16 h-16 bg-primary-light text-white rounded-full shadow-lg hover:bg-primary-dark transition-transform duration-200 hover:scale-105 flex items-center justify-center mx-auto disabled:bg-gray-400"
                    >
                        <CheckIcon className="w-8 h-8" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col bg-white relative">
            <header className="bg-primary text-white px-4 py-3 flex items-center shadow-md min-h-[60px] pt-5">
                <button onClick={onBack} className="mr-6"><ChevronLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-lg font-semibold">Add members</h2>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                {AI_CONTACTS.map(contact => {
                    const isSelected = selectedMembers.some(m => m.id === contact.id);
                    return (
                        <div key={contact.id} onClick={() => handleToggleMember(contact)} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg">
                            <div className="relative">
                                <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full mr-4" />
                                {isSelected && (
                                    <div className="absolute bottom-0 right-3 bg-primary-light text-white rounded-full p-0.5 border-2 border-white">
                                        <CheckIcon className="w-3 h-3"/>
                                    </div>
                                )}
                            </div>
                            <p className="font-semibold">{contact.name}</p>
                        </div>
                    );
                })}
            </div>
            {selectedMembers.length > 0 && (
                 <button 
                    onClick={() => setStep('details')}
                    className="absolute bottom-6 right-6 bg-primary-light text-white p-4 rounded-2xl shadow-lg hover:bg-primary-dark transition-transform duration-200 hover:scale-105"
                >
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};


const NewContactView: React.FC<{ onBack: () => void; onAddContact: (name: string) => void; }> = ({ onBack, onAddContact }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSave = () => {
        if (name.trim()) {
            onAddContact(name.trim());
            onBack();
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white">
            <header className="bg-primary text-white px-4 py-3 flex items-center shadow-md min-h-[60px] pt-5">
                <button onClick={onBack} className="mr-6"><ChevronLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-lg font-semibold">New contact</h2>
            </header>
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="contact-name" className="text-sm font-medium text-primary">Name</label>
                    <input 
                        id="contact-name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="First and last name"
                        className="w-full mt-1 border-b-2 border-gray-300 focus:border-primary focus:outline-none py-2"
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="contact-phone" className="text-sm font-medium text-primary">Phone</label>
                    <input 
                        id="contact-phone"
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="Phone number"
                        className="w-full mt-1 border-b-2 border-gray-300 focus:border-primary focus:outline-none py-2"
                    />
                </div>
                <div className="pt-4">
                     <button 
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="w-full bg-primary-light text-white font-semibold py-3 rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                    >
                        Save Contact
                    </button>
                </div>
            </div>
        </div>
    );
};


const NewChatList: React.FC<{ 
    onBack: () => void; 
    onCreateChat: (contact: Omit<Chat, 'id' | 'messages'>) => void; 
    onShowNewGroup: () => void; 
    onShowNewContact: () => void;
    userContacts: UserContact[];
}> = ({ onBack, onCreateChat, onShowNewGroup, onShowNewContact, userContacts }) => {
    return (
        <div className="flex-1 flex flex-col bg-white">
            <header className="bg-primary text-white px-4 py-3 flex items-center shadow-md min-h-[60px] pt-5">
                <button onClick={onBack} className="mr-6">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold">New Chat</h2>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                 <div onClick={onShowNewGroup} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mr-4">
                        <UsersIcon className="w-6 h-6 text-white"/>
                    </div>
                    <p className="font-semibold text-gray-800">New group</p>
                </div>
                 <div onClick={onShowNewContact} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mr-4">
                        <UserPlusIcon className="w-6 h-6 text-white"/>
                    </div>
                    <p className="font-semibold text-gray-800">New contact</p>
                </div>
                <p className="text-sm text-primary font-semibold px-3 mb-2 mt-4">START A CONVERSATION WITH AI</p>
                {AI_CONTACTS.map(contact => (
                    <div key={contact.seed} onClick={() => onCreateChat(contact)} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg">
                        <img src={`https://picsum.photos/seed/${contact.seed}/50/50`} alt={`${contact.name}'s Avatar`} className="w-12 h-12 rounded-full mr-4" />
                        <div className="flex-1">
                            <p className="font-semibold">{contact.name}</p>
                        </div>
                    </div>
                ))}
                 {userContacts.length > 0 && (
                    <>
                        <p className="text-sm text-primary font-semibold px-3 mb-2 mt-4">MY CONTACTS</p>
                        {userContacts.map(contact => {
                            const blueprint = {
                                name: contact.name,
                                avatarUrl: `https://picsum.photos/seed/${contact.id}/50/50`,
                                systemInstruction: 'You are a helpful AI assistant.'
                            };
                            return (
                                <div key={contact.id} onClick={() => onCreateChat(blueprint)} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg">
                                    <img src={blueprint.avatarUrl} alt={`${contact.name}'s Avatar`} className="w-12 h-12 rounded-full mr-4" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{contact.name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
};

const StatusList: React.FC<{ statuses: ContactStatus[], onViewStatus: (id: string) => void }> = ({ statuses, onViewStatus }) => {
    const hasUnviewedUpdates = (status: ContactStatus) => status.updates.some(u => !u.viewed);
    const recentUpdates = statuses.filter(s => s.contactId !== 'user-status');
    const myStatus = statuses.find(s => s.contactId === 'user-status');

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2 bg-[#F0F2F5]">
            <div className="flex items-center p-3 bg-white hover:bg-gray-100 cursor-pointer rounded-xl shadow-sm" onClick={() => alert('Feature to add status is coming soon!')}>
                <div className="relative">
                    <img src={myStatus?.contactAvatarUrl || `https://picsum.photos/seed/ws-chatt-user/50/50`} alt="My Status" className="w-12 h-12 rounded-full" />
                    <div className="absolute bottom-0 right-0 bg-primary-light text-white rounded-full p-0.5 border-2 border-white">
                        <PlusIcon className="w-4 h-4"/>
                    </div>
                </div>
                <div className="ml-4">
                    <p className="font-semibold text-gray-800">My status</p>
                    <p className="text-sm text-gray-500">Tap to add status update</p>
                </div>
            </div>
            
            <p className="px-3 pt-4 text-sm font-semibold text-gray-500">RECENT UPDATES</p>

            {recentUpdates.map(status => (
                <div key={status.contactId} onClick={() => onViewStatus(status.contactId)} className="flex items-center p-3 bg-white hover:bg-gray-100 cursor-pointer rounded-xl shadow-sm">
                    <div className={`p-1 rounded-full ${hasUnviewedUpdates(status) ? 'bg-gradient-to-tr from-green-400 to-primary' : ''}`}>
                         <img src={status.contactAvatarUrl} alt={`${status.contactName} Avatar`} className="w-12 h-12 rounded-full border-2 border-white" />
                    </div>
                    <div className="ml-4">
                        <p className="font-semibold text-gray-800">{status.contactName}</p>
                        <p className="text-sm text-gray-500">Today, {formatTimestamp(status.updates[0].timestamp)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const GroupsList: React.FC<{ chats: Chat[], onSelectChat: (id: string) => void }> = ({ chats, onSelectChat }) => {
    const groupChats = chats.filter(chat => chat.isGroup);

    if (groupChats.length === 0) {
        return <div className="p-4 text-center text-gray-500">You haven't joined any groups yet.</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
            {groupChats.map((chat) => {
                const lastMessage = getLastMessage(chat);
                return (
                    <div key={chat.id} onClick={() => onSelectChat(chat.id)} className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-xl transition-colors duration-150 bg-white shadow-sm`}>
                        <img src={chat.avatarUrl} alt={`${chat.name} Avatar`} className="w-12 h-12 rounded-full mr-4" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-gray-800 truncate">{chat.name}</p>
                                <p className={`text-xs font-semibold text-gray-400`}>
                                    {lastMessage?.timestamp ? formatTimestamp(lastMessage.timestamp) : ''}
                                </p>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                                {lastMessage ? (lastMessage.sender === 'user' ? `You: ${lastMessage.text || '...'}` : `${lastMessage.senderName || chat.name}: ${lastMessage.text || '...'}`) : 'No messages yet'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const CallsList: React.FC<{ calls: Call[], chats: Chat[], onStartCall: (chat: Chat, type: 'video' | 'voice') => void }> = ({ calls, chats, onStartCall }) => {
    const findChat = (contactId: string) => chats.find(c => c.id === contactId);

    const formatCallTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString();
    };

    return (
        <div className="flex-1 flex flex-col relative bg-[#F0F2F5]">
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2">
                <div className="flex items-center p-3 bg-white hover:bg-gray-100 cursor-pointer rounded-xl shadow-sm" onClick={() => alert('Feature to create call link is coming soon!')}>
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mr-4">
                        <LinkIcon className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                        <p className="font-semibold text-primary">Create call link</p>
                        <p className="text-sm text-gray-500">Share a link for your WS Chatt call</p>
                    </div>
                </div>

                <p className="px-3 pt-4 text-sm font-semibold text-gray-500">RECENT</p>

                {calls.map(call => {
                    const chat = findChat(call.contactId);
                    if (!chat) return null;

                    const isMissed = call.status === 'missed' || call.status === 'declined';
                    const Icon = call.direction === 'incoming' ? ArrowDownLeftIcon : ArrowUpRightIcon;

                    return (
                        <div key={call.id} className="flex items-center p-3 bg-white hover:bg-gray-100 rounded-xl shadow-sm">
                            <img src={call.contactAvatarUrl} alt={call.contactName} className="w-12 h-12 rounded-full mr-4" />
                            <div className="flex-1" onClick={() => onStartCall(chat, call.type)}>
                                <p className={`font-semibold ${isMissed ? 'text-red-500' : 'text-gray-800'}`}>{call.contactName}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Icon className={`w-4 h-4 mr-1 ${isMissed ? 'text-red-500' : 'text-green-600'}`} />
                                    <span>{formatCallTimestamp(call.timestamp)}</span>
                                </div>
                            </div>
                            <button onClick={() => onStartCall(chat, call.type)} className="p-2 text-primary hover:bg-gray-200 rounded-full">
                                {call.type === 'video' ? <VideoCallIcon className="w-6 h-6" /> : <PhoneIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    );
                })}

            </div>
            <button 
                onClick={() => {
                    const firstContact = chats.find(c => !c.isGroup && c.id !== 'user-status');
                    if (firstContact) onStartCall(firstContact, 'voice');
                }}
                className="absolute bottom-6 right-6 bg-primary-light text-white p-4 rounded-2xl shadow-lg hover:bg-primary-dark transition-transform duration-200 hover:scale-105"
                aria-label="New call"
            >
                <PhoneIcon className="w-6 h-6" />
            </button>
        </div>
    );
};
const ArchivedList: React.FC<{ onBack: () => void, searchQuery: string }> = ({ onBack, searchQuery }) => ( <div className="p-4 text-center text-gray-500">Archived chats coming soon.</div> );

const FilterButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-200 ${
            active
                ? 'bg-primary-lightest text-primary'
                : 'bg-white text-gray-600 hover:bg-gray-200'
        }`}
    >
        {label}
    </button>
);


export default function Sidebar({ chats, activeChatId, onOpenSettings, activeTab, onTabChange, onSelectChat, onCreateChat, onCreateGroup, statuses, onViewStatus, callHistory, onStartCall, onSimulateIncomingCall, userContacts, onAddUserContact }: SidebarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isShowingNewChat, setIsShowingNewChat] = useState(false);
    const [isShowingNewGroup, setIsShowingNewGroup] = useState(false);
    const [isShowingNewContact, setIsShowingNewContact] = useState(false);
    const [isShowingArchived, setIsShowingArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { label: 'New group', icon: UsersIcon, action: () => { setIsShowingNewGroup(true); setIsShowingNewChat(false); setIsShowingNewContact(false); } },
        { label: 'New contact', icon: UserPlusIcon, action: () => { setIsShowingNewChat(true); setIsShowingNewContact(true); setIsShowingNewGroup(false); } },
        { label: 'Archived', icon: ArchiveIcon, action: () => setIsShowingArchived(true) },
        { label: 'Starred messages', icon: StarIcon, action: () => {} },
        { label: 'Settings', icon: SettingsIcon, action: onOpenSettings },
        { label: 'Simulate Incoming Call', icon: PhoneIcon, action: onSimulateIncomingCall },
    ];

    const handleTabChange = (tab: Tab) => {
        if (tab !== 'chats') {
            setIsShowingNewChat(false);
            setIsShowingArchived(false);
            setIsShowingNewGroup(false);
            setIsShowingNewContact(false);
        }
        setSearchQuery('');
        onTabChange(tab);
    };
    
    const handleCreateGroup = (members: Omit<Member, 'isUser'>[], groupName: string) => {
        onCreateGroup(members, groupName);
        setIsShowingNewGroup(false);
    }
    
    const handleCreateChat = (contact: Omit<Chat, 'id' | 'messages'>) => {
        onCreateChat(contact);
        setIsShowingNewChat(false);
        setIsShowingNewContact(false);
    }

    const handleAddContact = (name: string) => {
        onAddUserContact(name);
        setIsShowingNewContact(false);
    };

    const renderContent = () => {
        if (isShowingNewGroup) {
            return <NewGroupFlow onBack={() => setIsShowingNewGroup(false)} onCreateGroup={handleCreateGroup} />;
        }
        if (isShowingNewChat) {
             if (isShowingNewContact) {
                return <NewContactView onBack={() => setIsShowingNewContact(false)} onAddContact={handleAddContact} />;
            }
            return <NewChatList 
                onBack={() => setIsShowingNewChat(false)} 
                onCreateChat={handleCreateChat} 
                onShowNewGroup={() => { setIsShowingNewChat(false); setIsShowingNewGroup(true); }}
                onShowNewContact={() => setIsShowingNewContact(true)}
                userContacts={userContacts}
            />;
        }

        switch (activeTab) {
            case 'chats': 
                if (isShowingArchived) {
                    return <ArchivedList onBack={() => setIsShowingArchived(false)} searchQuery={searchQuery} />
                }
                return <ChatsList chats={chats} activeChatId={activeChatId} onShowContacts={() => setIsShowingNewChat(true)} onSelectChat={onSelectChat} searchQuery={searchQuery} />;
            case 'status': return <StatusList statuses={statuses} onViewStatus={onViewStatus} />;
            case 'groups': return <GroupsList chats={chats} onSelectChat={onSelectChat} />;
            case 'calls': return <CallsList calls={callHistory} chats={chats} onStartCall={onStartCall} />;
            default: return null;
        }
    };
    
    const getSearchPlaceholder = () => {
        if (isShowingArchived) return "Search archived chats";
        if (isShowingNewChat || isShowingNewGroup || isShowingNewContact) return "Search contacts";
        return "Search or start new chat";
    }


    return (
        <div className="bg-[#F0F2F5] w-full flex flex-col h-full">
            <header className="bg-[#F0F2F5] px-4 py-[10px] flex justify-between items-center border-b border-gray-300 min-h-[60px]">
                 <h1 className="text-xl font-semibold text-gray-700">WS Chatt</h1>
                <div className="flex items-center space-x-4 text-gray-500">
                    <button onClick={() => alert('Camera feature coming soon!')} aria-label="Camera"><CameraIcon className="w-6 h-6" /></button>
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><MoreVerticalIcon className="w-6 h-6" /></button>
                        {menuOpen && (
                          <div className="absolute top-8 right-0 w-56 bg-white rounded-md shadow-lg z-20 py-2">
                            {menuItems.map(item => (
                              <button key={item.label} onClick={() => { item.action(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                <item.icon className="w-5 h-5 mr-3" />
                                <span>{item.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                </div>
            </header>
            
            {(activeTab === 'chats' || activeTab === 'groups') && !isShowingNewChat && !isShowingNewGroup && (
                <div className="p-2 border-b border-gray-200 bg-[#F0F2F5]">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={getSearchPlaceholder()}
                            className="w-full bg-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    { activeTab === 'chats' && !isShowingNewChat && !isShowingArchived && (
                        <div className="flex items-center space-x-2 mt-2 overflow-x-auto no-scrollbar pb-1">
                            <FilterButton label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                            <FilterButton label="Unread" active={activeFilter === 'unread'} onClick={() => setActiveFilter('unread')} />
                            <FilterButton label="Groups" active={activeFilter === 'groups'} onClick={() => setActiveFilter('groups')} />
                        </div>
                    )}
                </div>
            )}

            {renderContent()}

            <div className="flex justify-around items-center bg-white rounded-t-2xl border-t border-gray-200 shadow-[0_-2px_6px_rgba(0,0,0,0.05)] overflow-hidden">
                {[
                    { id: 'chats', label: 'Chats', icon: MessageSquareTextIcon },
                    { id: 'groups', label: 'Groups', icon: UsersIcon },
                    { id: 'status', label: 'Status', icon: CameraIcon },
                    { id: 'calls', label: 'Calls', icon: PhoneIcon },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as Tab)}
                        className={`w-full py-3 text-sm font-semibold flex flex-col items-center justify-center transition-colors duration-200 ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:bg-gray-200'}`}
                        aria-label={tab.label}
                    >
                        <tab.icon className="w-5 h-5 mb-1" />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}