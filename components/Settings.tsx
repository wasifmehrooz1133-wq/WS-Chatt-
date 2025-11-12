

import React, { useState, useEffect } from 'react';
import { Theme, THEMES } from '../types';
import { 
    CheckCircleIcon, ChevronLeftIcon, UserIcon, LockIcon, BellIcon, CircleHelpIcon, HeartHandshakeIcon, LanguagesIcon, PaletteIcon, SunIcon, UsersIcon, ShieldCheckIcon, KeyRoundIcon, EyeOffIcon, FileClockIcon, BotIcon, MessageSquareTextIcon, InfoIcon, HardDriveIcon, WifiIcon, AccessibilityIcon, UserPlusIcon, Trash2Icon, LogOutIcon, PhoneIcon, CameraIcon, PencilIcon, ImageIcon, CornerDownLeftIcon, EyeIcon, CaseSensitiveIcon, ArchiveIcon, UploadCloudIcon, FileSymlinkIcon, BellRingIcon, VibrateIcon, MessageSquareMoreIcon, ArrowUpCircleIcon, ThumbsUpIcon, SparklesIcon, MinusCircleIcon, ShieldAlertIcon, StickerIcon, ClockIcon, LinkIcon, CheckCheckIcon, MapPinIcon, AddressBookIcon, BanIcon, StarIcon, ListPlusIcon, InboxIcon, ServerIcon, SignalIcon, PlaneIcon, FileTextIcon, Share2Icon 
} from './Icons';

interface SettingsProps {
    onBack: () => void;
    activeTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    onLogout: () => void;
}

type SettingsPage = 'main' | 'profile' | 'account' | 'privacy' | 'lists' | 'chats' | 'notifications' | 'storage' | 'accessibility' | 'language' | 'help' | 'invite' | 'theme';

const SettingsHeader: React.FC<{ title: string; onBack: () => void; children?: React.ReactNode }> = ({ title, onBack, children }) => (
    <div className="bg-primary text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-4"><ChevronLeftIcon className="w-6 h-6" /></button>
            <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div>{children}</div>
    </div>
);

const SettingsItem: React.FC<{ icon: React.ElementType, title: string, subtitle?: string, onClick: () => void }> = ({ icon: Icon, title, subtitle, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-4 hover:bg-gray-100 text-left">
        <Icon className="w-6 h-6 text-gray-500 mr-6" />
        <div className="flex-1">
            <p className="text-base text-gray-800">{title}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
    </button>
);

const SettingsToggleItem: React.FC<{ icon: React.ElementType; title: string; subtitle?: string; isChecked: boolean; onToggle: () => void; }> = ({ icon: Icon, title, subtitle, isChecked, onToggle }) => (
    <div className="w-full flex items-center p-4">
        <Icon className="w-6 h-6 text-gray-500 mr-6 flex-shrink-0" />
        <div className="flex-1 min-w-0" onClick={onToggle}>
            <p className="text-base text-gray-800">{title}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input type="checkbox" checked={isChecked} onChange={onToggle} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color-light)]"></div>
        </label>
    </div>
);


const ThemeSettingsPage: React.FC<{ onBack: () => void; activeTheme: Theme; onThemeChange: (theme: Theme) => void; }> = ({ onBack, activeTheme, onThemeChange }) => {
    return (
        <>
            <SettingsHeader title="Theme" onBack={onBack} />
            <div className="p-4 space-y-2">
                <p className="px-2 text-sm text-primary font-semibold">CHOOSE THEME</p>
                {THEMES.map(theme => (
                    <button 
                        key={theme.name} 
                        onClick={() => onThemeChange(theme)}
                        className={`w-full flex items-center p-3 rounded-lg ${activeTheme.name === theme.name ? 'bg-primary-lightest' : 'hover:bg-gray-100'}`}
                    >
                        <div className="w-8 h-8 rounded-full mr-4" style={{ backgroundColor: theme.primaryLight }}></div>
                        <span className="flex-1 text-left">{theme.name}</span>
                        {activeTheme.name === theme.name && <CheckCircleIcon className="w-6 h-6 text-primary" />}
                    </button>
                ))}
            </div>
        </>
    );
};

const ChatsSettingsPage: React.FC<{ onBack: () => void; onNavigate: (page: SettingsPage) => void; }> = ({ onBack, onNavigate }) => {
    const [enterIsSend, setEnterIsSend] = useState(true);
    const [mediaVisibility, setMediaVisibility] = useState(true);
    const [voiceTranscripts, setVoiceTranscripts] = useState(false);
    const [keepArchived, setKeepArchived] = useState(true);

    return (
        <>
            <SettingsHeader title="Chats" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9]">
                <div className="pt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Display</p>
                    <div className="bg-white">
                        <SettingsItem icon={PaletteIcon} title="Theme" subtitle="Change the app's color scheme" onClick={() => onNavigate('theme')} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={ImageIcon} title="Wallpaper" subtitle="Set a default chat wallpaper" onClick={() => {}} />
                    </div>
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Chat setting</p>
                    <div className="bg-white">
                        <SettingsToggleItem icon={CornerDownLeftIcon} title="Enter is send" subtitle="Enter key will send your message" isChecked={enterIsSend} onToggle={() => setEnterIsSend(p => !p)} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsToggleItem icon={EyeIcon} title="Media visibility" subtitle="Show newly downloaded media in your device's gallery" isChecked={mediaVisibility} onToggle={() => setMediaVisibility(p => !p)} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={CaseSensitiveIcon} title="Font size" subtitle="Medium" onClick={() => {}} />
                         <div className="border-t border-gray-200 mx-4" />
                        <SettingsToggleItem icon={MessageSquareTextIcon} title="Voice message transcripts" subtitle="Show text from voice messages" isChecked={voiceTranscripts} onToggle={() => setVoiceTranscripts(p => !p)} />
                    </div>
                </div>

                 <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Archived chats</p>
                    <div className="bg-white">
                        <SettingsToggleItem icon={ArchiveIcon} title="Keep chats archived" subtitle="Archived chats will remain archived when you receive a new message" isChecked={keepArchived} onToggle={() => setKeepArchived(p => !p)} />
                    </div>
                </div>

                <div className="pt-2 mt-2">
                    <div className="bg-white">
                        <SettingsItem icon={UploadCloudIcon} title="Chat backup" subtitle="Backup your messages and media" onClick={() => {}} />
                         <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={FileSymlinkIcon} title="Transfer chats" subtitle="Transfer chat history to another device" onClick={() => {}} />
                         <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={FileClockIcon} title="Chat history" subtitle="Export, archive, or clear all chats" onClick={() => {}} />
                    </div>
                </div>

            </div>
        </>
    );
}

const NotificationSettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [conversationTones, setConversationTones] = useState(true);
    const [messageHighPriority, setMessageHighPriority] = useState(true);
    const [messageReactions, setMessageReactions] = useState(true);
    const [groupHighPriority, setGroupHighPriority] = useState(false);
    const [groupReactions, setGroupReactions] = useState(true);
    const [statusHighPriority, setStatusHighPriority] = useState(true);
    const [statusReactions, setStatusReactions] = useState(true);

    return (
        <>
            <SettingsHeader title="Notifications" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9] pb-4">

                <div className="bg-white mt-4">
                     <SettingsToggleItem 
                        icon={BellRingIcon} 
                        title="Conversation tones" 
                        subtitle="Play sounds for incoming and outgoing messages"
                        isChecked={conversationTones} 
                        onToggle={() => setConversationTones(p => !p)} 
                    />
                    <div className="border-t border-gray-200 mx-4" />
                    <SettingsItem 
                        icon={SparklesIcon} 
                        title="Reminders" 
                        subtitle="Manage notifications for reminders"
                        onClick={() => {}} 
                    />
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Messages</p>
                    <div className="bg-white">
                        <SettingsItem icon={BellIcon} title="Notification tone" subtitle="Default" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={VibrateIcon} title="Vibrate" subtitle="Default" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={MessageSquareMoreIcon} title="Popup notification" subtitle="No popup" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={SunIcon} title="Light" subtitle="White" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsToggleItem 
                            icon={ArrowUpCircleIcon} 
                            title="Use high priority notification" 
                            subtitle="Show previews of notifications at the top of the screen"
                            isChecked={messageHighPriority} 
                            onToggle={() => setMessageHighPriority(p => !p)} 
                        />
                         <div className="border-t border-gray-200 mx-4" />
                        <SettingsToggleItem 
                            icon={ThumbsUpIcon} 
                            title="Reaction Notifications" 
                            subtitle="Show notifications for reactions to messages you send"
                            isChecked={messageReactions} 
                            onToggle={() => setMessageReactions(p => !p)} 
                        />
                    </div>
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Groups</p>
                    <div className="bg-white">
                        <SettingsItem icon={BellIcon} title="Notification tone" subtitle="Default" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={VibrateIcon} title="Vibrate" subtitle="Default" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={MessageSquareMoreIcon} title="Popup notification" subtitle="No popup" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={SunIcon} title="Light" subtitle="White" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsToggleItem 
                            icon={ArrowUpCircleIcon} 
                            title="Use high priority notification" 
                            subtitle="Show previews of notifications at the top of the screen"
                            isChecked={groupHighPriority} 
                            onToggle={() => setGroupHighPriority(p => !p)} 
                        />
                         <div className="border-t border-gray-200 mx-4" />
                        <SettingsToggleItem 
                            icon={ThumbsUpIcon} 
                            title="Reaction Notifications" 
                            subtitle="Show notifications for reactions to messages you send"
                            isChecked={groupReactions} 
                            onToggle={() => setGroupReactions(p => !p)} 
                        />
                    </div>
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Calls</p>
                    <div className="bg-white">
                        <SettingsItem icon={PhoneIcon} title="Ringtone" subtitle="Default" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={VibrateIcon} title="Vibrate" subtitle="Default" onClick={() => {}} />
                    </div>
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Status</p>
                    <div className="bg-white">
                         <SettingsItem icon={BellIcon} title="Notification tone" subtitle="Default" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsItem icon={VibrateIcon} title="Vibrate" subtitle="Default" onClick={() => {}} />
                        <div className="border-t border-gray-200 mx-4" />
                        <SettingsToggleItem 
                            icon={ArrowUpCircleIcon} 
                            title="Use high priority notification" 
                            subtitle="Show previews of notifications at the top of the screen"
                            isChecked={statusHighPriority} 
                            onToggle={() => setStatusHighPriority(p => !p)} 
                        />
                         <div className="border-t border-gray-200 mx-4" />
                        <SettingsToggleItem 
                            icon={ThumbsUpIcon} 
                            title="Reaction Notifications" 
                            subtitle="Show notifications for reactions to messages you send"
                            isChecked={statusReactions} 
                            onToggle={() => setStatusReactions(p => !p)} 
                        />
                    </div>
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Home screen notifications</p>
                    <div className="bg-white">
                         <SettingsItem icon={MinusCircleIcon} title="Clear count" subtitle="Clear unread message count from app icon" onClick={() => {}} />
                    </div>
                </div>
            </div>
        </>
    );
};


const ProfileSetting: React.FC<{icon: React.ElementType, label: string, value: string, onEdit: () => void}> = ({ icon: Icon, label, value, onEdit }) => (
    <div className="flex items-center p-4">
        <Icon className="w-6 h-6 text-gray-500 mr-6 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-base text-gray-800 truncate">{value}</p>
        </div>
        <button onClick={onEdit} className="ml-4 p-2 text-primary hover:text-primary-dark flex-shrink-0">
            <PencilIcon className="w-5 h-5" />
        </button>
    </div>
);

const ProfileSettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [name, setName] = useState('Your Name');
    const [about, setAbout] = useState('Hey there! I am using WS Chatt.');

    const handleEdit = (field: 'Name' | 'About') => {
        const currentValue = field === 'Name' ? name : about;
        const newValue = prompt(`Enter new ${field}:`, currentValue);
        if (newValue !== null && newValue.trim() !== '') {
            if (field === 'Name') setName(newValue);
            if (field === 'About') setAbout(newValue);
        }
    };

    return (
        <>
            <SettingsHeader title="Profile" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F0F2F5]">
                <div className="p-6 flex justify-center my-4">
                    <div className="relative">
                        <img src="https://picsum.photos/seed/ws-chatt-user/128/128" alt="User Avatar" className="w-32 h-32 rounded-full" />
                        <button className="absolute bottom-1 right-1 bg-primary-light text-white p-2 rounded-full shadow-md hover:bg-primary-dark" aria-label="Edit profile picture">
                            <CameraIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                
                <div className="bg-white shadow-sm mx-4 rounded-lg">
                    <ProfileSetting 
                        icon={UserIcon} 
                        label="Name" 
                        value={name}
                        onEdit={() => handleEdit('Name')}
                    />
                     <div className="border-t border-gray-200" style={{ marginLeft: '4rem' }} />
                    <ProfileSetting 
                        icon={InfoIcon} 
                        label="About" 
                        value={about}
                        onEdit={() => handleEdit('About')}
                    />
                     <div className="border-t border-gray-200" style={{ marginLeft: '4rem' }} />
                    <div className="flex items-center p-4">
                         <PhoneIcon className="w-6 h-6 text-gray-500 mr-6 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-base text-gray-800 truncate">+1 555 123 4567</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 px-6 py-2">This is not your username or pin. This name will be visible to your WS Chatt contacts.</p>

            </div>
        </>
    );
};

const PrivacySettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [readReceipts, setReadReceipts] = useState(true);
    const [allowCameraEffects, setAllowCameraEffects] = useState(false);

    return (
        <>
            <SettingsHeader title="Privacy" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9] pb-4">
                <div className="p-4">
                    <div className="bg-white rounded-lg shadow-sm p-1">
                        <SettingsItem icon={ShieldAlertIcon} title="Privacy Checkup" subtitle="Control your privacy settings" onClick={() => {}} />
                    </div>
                </div>

                <div>
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Who can see my personal info</p>
                    <div className="bg-white">
                        <SettingsItem icon={EyeOffIcon} title="Last seen and online" subtitle="Everyone" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={UserIcon} title="Profile picture" subtitle="Everyone" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={InfoIcon} title="About" subtitle="My contacts" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={LinkIcon} title="Links" subtitle="My contacts" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={CameraIcon} title="Status" subtitle="My contacts" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsToggleItem 
                            icon={CheckCheckIcon} 
                            title="Read receipts" 
                            subtitle="If turned off, you won't send or receive Read receipts. Read receipts are always sent for group chats."
                            isChecked={readReceipts} 
                            onToggle={() => setReadReceipts(p => !p)} 
                        />
                    </div>
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Disappearing messages</p>
                    <div className="bg-white">
                        <SettingsItem icon={ClockIcon} title="Default message timer" subtitle="Off" onClick={() => {}} />
                    </div>
                </div>
                
                <div className="pt-2 mt-2">
                    <div className="bg-white">
                        <SettingsItem icon={UsersIcon} title="Groups" subtitle="Who can add me to groups" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={StickerIcon} title="Avatar stickers" subtitle="Who can use my avatar stickers" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={MapPinIcon} title="Live location" subtitle="None" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={PhoneIcon} title="Calls" subtitle="Silence unknown callers" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={AddressBookIcon} title="Contacts" subtitle="Blocked contacts, manage contacts" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={LockIcon} title="Chat lock" subtitle="Lock and hide chats" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsToggleItem 
                            icon={CameraIcon} 
                            title="Allow camera effects" 
                            subtitle="Allow apps to add effects to the camera"
                            isChecked={allowCameraEffects} 
                            onToggle={() => setAllowCameraEffects(p => !p)} 
                        />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={ShieldCheckIcon} title="Advanced" subtitle="Protect IP address in calls" onClick={() => {}} />
                    </div>
                </div>

                 <p className="text-xs text-gray-500 text-center p-4">
                    Learn more about privacy on WS Chatt.
                </p>
            </div>
        </>
    );
};

const ListsSettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <>
            <SettingsHeader title="Lists" onBack={onBack}>
                <button onClick={() => {}} aria-label="Edit lists">
                    <PencilIcon className="w-5 h-5" />
                </button>
            </SettingsHeader>
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9]">
                <div className="p-4">
                    <button className="w-full flex items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-100 text-left">
                        <div className="p-2 bg-primary-lightest rounded-full mr-4">
                            <ListPlusIcon className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-base font-semibold text-primary">New list</span>
                    </button>
                </div>

                <div className="pt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Your lists</p>
                    <div className="bg-white">
                        <SettingsItem icon={InboxIcon} title="Unread" onClick={() => {}} />
                        <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={StarIcon} title="Favorites" onClick={() => {}} />
                         <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />
                        <SettingsItem icon={UsersIcon} title="Groups" onClick={() => {}} />
                    </div>
                </div>

                <div className="pt-2 mt-4">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Available presets</p>
                    <div className="bg-white">
                        <SettingsItem icon={UsersIcon} title="Communities" subtitle="Group multiple groups into a single community" onClick={() => {}} />
                    </div>
                </div>
            </div>
        </>
    );
};

const StorageSettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [useLessDataForCalls, setUseLessDataForCalls] = useState(false);

    return (
        <>
            <SettingsHeader title="Storage and data" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9] pb-4">
                <div className="bg-white mt-4">
                    <SettingsItem 
                        icon={HardDriveIcon} 
                        title="Manage storage" 
                        subtitle="1.2 GB"
                        onClick={() => {}} 
                    />
                    <div className="border-t border-gray-200 mx-4" />
                    <SettingsItem 
                        icon={WifiIcon} 
                        title="Network usage" 
                        subtitle="5.6 GB sent • 12.3 GB received"
                        onClick={() => {}} 
                    />
                </div>

                <div className="bg-white mt-4">
                    <SettingsToggleItem 
                        icon={PhoneIcon} 
                        title="Use less data for calls"
                        isChecked={useLessDataForCalls} 
                        onToggle={() => setUseLessDataForCalls(p => !p)} 
                    />
                </div>
                
                <div className="bg-white mt-4">
                     <SettingsItem 
                        icon={ServerIcon} 
                        title="Proxy" 
                        subtitle="Off"
                        onClick={() => {}} 
                    />
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Media upload quality</p>
                    <div className="bg-white">
                        <SettingsItem 
                            icon={ArrowUpCircleIcon} 
                            title="Photo upload quality"
                            subtitle="Auto (recommended)"
                            onClick={() => {}} 
                        />
                    </div>
                </div>

                <div className="pt-2 mt-2">
                    <p className="px-8 py-2 text-sm text-primary font-semibold">Media auto-download</p>
                    <p className="px-8 pb-2 text-xs text-gray-500">Voice messages are always automatically downloaded.</p>
                    <div className="bg-white">
                        <SettingsItem 
                            icon={SignalIcon}
                            title="When using mobile data"
                            subtitle="No media"
                            onClick={() => {}} 
                        />
                        <div className="border-t border-gray-200 mx-4" />
                         <SettingsItem 
                            icon={WifiIcon}
                            title="When connected on Wi-Fi"
                            subtitle="All media"
                            onClick={() => {}} 
                        />
                         <div className="border-t border-gray-200 mx-4" />
                         <SettingsItem 
                            icon={PlaneIcon}
                            title="When roaming"
                            subtitle="No media"
                            onClick={() => {}} 
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

const AccessibilitySettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [increaseContrast, setIncreaseContrast] = useState(() => localStorage.getItem('ws-chatt-accessibility-contrast') === 'true');
    const [animationsEnabled, setAnimationsEnabled] = useState(() => localStorage.getItem('ws-chatt-accessibility-animation') !== 'false');

    useEffect(() => {
        document.documentElement.classList.toggle('high-contrast', increaseContrast);
        localStorage.setItem('ws-chatt-accessibility-contrast', String(increaseContrast));
    }, [increaseContrast]);

    useEffect(() => {
        document.documentElement.classList.toggle('no-animations', !animationsEnabled);
        localStorage.setItem('ws-chatt-accessibility-animation', String(animationsEnabled));
    }, [animationsEnabled]);

    return (
        <>
            <SettingsHeader title="Accessibility" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9] pb-4">
                <div className="bg-white mt-4">
                    <SettingsToggleItem
                        icon={SunIcon}
                        title="Increase contrast"
                        subtitle="Makes some colors easier to see"
                        isChecked={increaseContrast}
                        onToggle={() => setIncreaseContrast(p => !p)}
                    />
                    <div className="border-t border-gray-200 mx-4" />
                    <SettingsToggleItem
                        icon={SparklesIcon}
                        title="Animation"
                        subtitle="Enable or disable in-app animations"
                        isChecked={animationsEnabled}
                        onToggle={() => setAnimationsEnabled(p => !p)}
                    />
                </div>
            </div>
        </>
    );
};

const HelpSettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <>
            <SettingsHeader title="Help" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9] flex flex-col">
                <div className="bg-white mt-4">
                    <SettingsItem 
                        icon={CircleHelpIcon} 
                        title="Help Center" 
                        onClick={() => {}} 
                    />
                    <div className="border-t border-gray-200 mx-4" />
                    <SettingsItem 
                        icon={HeartHandshakeIcon} 
                        title="Send feedback"
                        subtitle="Help us improve WS Chatt"
                        onClick={() => {}} 
                    />
                     <div className="border-t border-gray-200 mx-4" />
                    <SettingsItem 
                        icon={FileTextIcon} 
                        title="Terms and Privacy Policy"
                        onClick={() => {}} 
                    />
                     <div className="border-t border-gray-200 mx-4" />
                    <SettingsItem 
                        icon={InfoIcon} 
                        title="App info"
                        onClick={() => {}} 
                    />
                </div>
                <div className="text-center text-gray-400 text-xs p-6 mt-auto">
                    <p>WS Chatt</p>
                    <p>Version 1.0.0</p>
                </div>
            </div>
        </>
    );
};

const LANGUAGES = [
    { name: "English" }, { name: "اردو (Urdu)" }, { name: "हिन्दी (Hindi)" },
    { name: "Afrikaans" }, { name: "Shqip (Albanian)" }, { name: "አማርኛ (Amharic)" },
    { name: "العربية (Arabic)" }, { name: "Azərbaycan (Azerbaijani)" }, { name: "বাংলা (Bengali)" },
    { name: "Български (Bulgarian)" }, { name: "Català (Catalan)" }, { name: "简体中文 (Chinese, Simplified)" },
    { name: "繁體中文 (Chinese, Traditional)" }, { name: "Hrvatski (Croatian)" }, { name: "Čeština (Czech)" },
    { name: "Dansk (Danish)" }, { name: "Nederlands (Dutch)" }, { name: "Eesti (Estonian)" },
    { name: "Filipino (Tagalog)" }, { name: "Suomi (Finnish)" }, { name: "Français (French)" },
    { name: "Deutsch (German)" }, { name: "Ελληνικά (Greek)" }, { name: "ગુજરાતી (Gujarati)" },
    { name: "עברית (Hebrew)" }, { name: "Magyar (Hungarian)" }, { name: "Íslenska (Icelandic)" },
    { name: "Bahasa Indonesia (Indonesian)" }, { name: "Gaeilge (Irish)" }, { name: "Italiano (Italian)" },
    { name: "日本語 (Japanese)" }, { name: "ಕನ್ನಡ (Kannada)" }, { name: "Қазақ (Kazakh)" },
    { name: "ខ្មែរ (Khmer)" }, { name: "한국어 (Korean)" }, { name: "ລາว (Lao)" },
    { name: "Latviešu (Latvian)" }, { name: "Lietuvių (Lithuanian)" }, { name: "Македонски (Macedonian)" },
    { name: "Bahasa Melayu (Malay)" }, { name: "മലയാളം (Malayalam)" }, { name: "Malti (Maltese)" },
    { name: "मराठी (Marathi)" }, { name: "Монгол (Mongolian)" }, { name: "непали (Nepali)" },
    { name: "Norsk (Norwegian)" }, { name: "فارسی (Persian)" }, { name: "Polski (Polish)" },
    { name: "Português (Portuguese)" }, { name: "ਪੰਜਾਬੀ (Punjabi)" }, { name: "Română (Romanian)" },
    { name: "Русский (Russian)" }, { name: "Српски (Serbian)" }, { name: "සිංහල (Sinhala)" },
    { name: "Slovenčina (Slovak)" }, { name: "Slovenščina (Slovenian)" }, { name: "Español (Spanish)" },
    { name: "Kiswahili (Swahili)" }, { name: "Svenska (Swedish)" }, { name: "தமிழ் (Tamil)" },
    { name: "తెలుగు (Telugu)" }, { name: "ไทย (Thai)" }, { name: "Türkçe (Turkish)" },
    { name: "Українська (Ukrainian)" }, { name: "Tiếng Việt (Vietnamese)" }, { name: "Zulu" },
];

const LanguageSettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(
        () => localStorage.getItem('ws-chatt-language') || "English"
    );

    const handleSelectLanguage = (langName: string) => {
        setSelectedLanguage(langName);
        localStorage.setItem('ws-chatt-language', langName);
    };

    return (
        <>
            <SettingsHeader title="App language" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9]">
                <div className="bg-white my-4">
                    {LANGUAGES.map((lang, index) => (
                        <React.Fragment key={lang.name}>
                            <button
                                onClick={() => handleSelectLanguage(lang.name)}
                                className="w-full flex items-center p-4 hover:bg-gray-100 text-left"
                            >
                                <div className="w-6 h-6 mr-6 flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="language"
                                        checked={selectedLanguage === lang.name}
                                        onChange={() => handleSelectLanguage(lang.name)}
                                        className="form-radio h-5 w-5 text-primary focus:ring-primary-light border-gray-300"
                                    />
                                </div>
                                <span className="text-base text-gray-800">{lang.name}</span>
                            </button>
                            {index < LANGUAGES.length - 1 && <div className="border-t border-gray-200" style={{ marginLeft: '4.5rem' }} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </>
    );
};

const InviteFriendPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const handleShare = async () => {
        const shareData = {
            title: 'WS Chatt',
            text: 'Join me on WS Chatt for secure and private messaging!',
            url: 'https://ws-chatt.example.com',
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(shareData.url);
                alert('Invite link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
             if (err instanceof DOMException && err.name === 'AbortError') {
                return; // User cancelled the share dialog
            }
            alert('Could not share the link.');
        }
    };

    return (
        <>
            <SettingsHeader title="Invite a friend" onBack={onBack} />
            <div className="flex-1 overflow-y-auto bg-[#F9F9F9]">
                <div className="bg-white mt-4">
                    <SettingsItem 
                        icon={Share2Icon}
                        title="Share link" 
                        onClick={handleShare} 
                    />
                    <div className="border-t border-gray-200 mx-4" />
                    <SettingsItem 
                        icon={AddressBookIcon} 
                        title="From contacts" 
                        onClick={() => alert('Feature coming soon!')} 
                    />
                </div>
            </div>
        </>
    );
};


export default function Settings({ onBack, activeTheme, onThemeChange, onLogout }: SettingsProps) {
    const [page, setPage] = useState<SettingsPage>('main');
    const [appLanguage, setAppLanguage] = useState("English (device's language)");

    useEffect(() => {
        const savedLang = localStorage.getItem('ws-chatt-language');
        if (savedLang) {
            setAppLanguage(savedLang);
        }
    }, [page]); // Re-check when navigating back to main page


    const mainSettingsItems = [
        { icon: KeyRoundIcon, title: 'Account', subtitle: 'Security notifications, change number', page: 'account' },
        { icon: LockIcon, title: 'Privacy', subtitle: 'Block contacts, disappearing messages', page: 'privacy' },
        { icon: UsersIcon, title: 'Lists', subtitle: 'Manage your contact lists', page: 'lists' },
        { icon: MessageSquareTextIcon, title: 'Chats', subtitle: 'Theme, wallpaper, chat history', page: 'chats' },
        { icon: BellIcon, title: 'Notifications', subtitle: 'Message, group & call tones', page: 'notifications' },
        { icon: HardDriveIcon, title: 'Storage and data', subtitle: 'Network usage, auto-download', page: 'storage' },
        { icon: AccessibilityIcon, title: 'Accessibility', subtitle: 'Font size, contrast', page: 'accessibility' },
        { icon: LanguagesIcon, title: 'App language', subtitle: appLanguage, page: 'language' },
        { icon: CircleHelpIcon, title: 'Help and feedback', subtitle: 'Help center, contact us, privacy policy', page: 'help' },
        { icon: UserPlusIcon, title: 'Invite a friend', page: 'invite' },
    ];
    
    const handleLogoutClick = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            onLogout();
        }
    };

    const renderPage = () => {
        switch(page) {
            case 'main':
                return (
                    <>
                        <SettingsHeader title="Settings" onBack={onBack} />
                        <div className="flex-1 overflow-y-auto">
                            <button onClick={() => setPage('profile')} className="w-full flex items-center p-4 hover:bg-gray-100 text-left border-b border-gray-200">
                                <img src="https://picsum.photos/seed/ws-chatt-user/64/64" alt="User Avatar" className="w-16 h-16 rounded-full mr-4" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold text-gray-800 truncate">Your Name</p>
                                    <p className="text-sm text-gray-500 mt-1 truncate">Hey there! I am using WS Chatt.</p>
                                </div>
                            </button>

                            {mainSettingsItems.map(item => <SettingsItem key={item.title} icon={item.icon} title={item.title} subtitle={item.subtitle} onClick={() => setPage(item.page as SettingsPage)} />)}
                            
                            <div className="border-t border-gray-200 mt-2">
                                <button onClick={handleLogoutClick} className="w-full flex items-center p-4 hover:bg-gray-100 text-left">
                                    <LogOutIcon className="w-6 h-6 text-red-500 mr-6" />
                                    <div className="flex-1">
                                        <p className="text-base text-red-500">Log Out</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 'profile':
                return <ProfileSettingsPage onBack={() => setPage('main')} />;
            case 'account':
                 return (
                     <>
                        <SettingsHeader title="Account" onBack={() => setPage('main')} />
                        <div className="p-4">
                            <SettingsItem icon={ShieldCheckIcon} title="Security notifications" onClick={() => {}} />
                            <SettingsItem icon={KeyRoundIcon} title="Change number" onClick={() => {}} />
                            <SettingsItem icon={FileClockIcon} title="Request account info" onClick={() => {}} />
                            <SettingsItem icon={Trash2Icon} title="Delete my account" onClick={() => {}} />
                        </div>
                    </>
                );
            case 'privacy':
                  return <PrivacySettingsPage onBack={() => setPage('main')} />;
            case 'lists':
                return <ListsSettingsPage onBack={() => setPage('main')} />;
             case 'chats':
                return <ChatsSettingsPage onBack={() => setPage('main')} onNavigate={setPage} />;
            case 'theme':
                return <ThemeSettingsPage onBack={() => setPage('chats')} activeTheme={activeTheme} onThemeChange={onThemeChange} />;
            case 'notifications':
                return <NotificationSettingsPage onBack={() => setPage('main')} />;
            case 'storage':
                return <StorageSettingsPage onBack={() => setPage('main')} />;
            case 'accessibility':
                return <AccessibilitySettingsPage onBack={() => setPage('main')} />;
            case 'language':
                return <LanguageSettingsPage onBack={() => setPage('main')} />;
            case 'help':
                return <HelpSettingsPage onBack={() => setPage('main')} />;
            case 'invite':
                return <InviteFriendPage onBack={() => setPage('main')} />;
            default:
                return (
                    <>
                        <SettingsHeader title="Coming Soon" onBack={() => setPage('main')} />
                        <div className="p-6 text-center text-gray-500">
                           <p>This section is under construction.</p>
                        </div>
                    </>
                );
        }
    };
    
    return (
        <div className="flex flex-col h-full w-full bg-white">
            {renderPage()}
        </div>
    );
}