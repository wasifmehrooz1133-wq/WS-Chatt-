

// Fix: Corrected React import and removed incorrect `aistudio` namespace.
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import Settings from './components/Settings';
import MainContentPlaceholder from './components/MainContentPlaceholder';
import StatusViewer from './components/StatusViewer';
import { useChat } from './hooks/useChat';
import { useStatus } from './hooks/useStatus';
import AuthScreen from './components/AuthScreen';
import SplashScreen from './components/SplashScreen';
import { Theme, THEMES, Chat } from './types';
import { useCalls } from './hooks/useCalls';
import CallScreen from './components/CallScreen';
import IncomingCall from './components/IncomingCall';

type View = 'main' | 'settings';
export type Tab = 'chats' | 'status' | 'groups' | 'calls';
type AuthState = 'unauthenticated' | 'authenticated';
type SplashState = 'visible' | 'fading' | 'hidden';
type CallState = 'idle' | 'ringing' | 'connected' | 'ended' | 'incoming';
type CallType = 'voice' | 'video';

export default function App() {
  const [splashState, setSplashState] = useState<SplashState>('visible');
  const [authState, setAuthState] = useState<AuthState>(() => {
    return localStorage.getItem('ws-chatt-auth') === 'true' ? 'authenticated' : 'unauthenticated';
  });
  
  const chatHookData = useChat();
  const { chats, activeChat, selectChat, createChat, createGroup, userContacts, addUserContact } = chatHookData;
  const statusHookData = useStatus(chats);
  const { statuses, markUpdatesAsViewed } = statusHookData;
  const callHookData = useCalls(chats);

  const [viewingStatusContactId, setViewingStatusContactId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('main');
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [activeTheme, setActiveTheme] = useState<Theme>(THEMES[0]);
  
  const [callState, setCallState] = useState<CallState>('idle');
  const [activeCall, setActiveCall] = useState<{ contact: Chat, type: CallType } | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashState('fading'), 2000);
    const hideTimer = setTimeout(() => setSplashState('hidden'), 2500);

    const savedThemeName = localStorage.getItem('ws-chatt-theme');
    const savedTheme = THEMES.find(t => t.name === savedThemeName) || THEMES[0];
    handleThemeChange(savedTheme, false);

    if (localStorage.getItem('ws-chatt-accessibility-contrast') === 'true') {
        document.documentElement.classList.add('high-contrast');
    }
    if (localStorage.getItem('ws-chatt-accessibility-animation') === 'false') {
        document.documentElement.classList.add('no-animations');
    }

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    let timer: number;
    if (callState === 'connected') {
      timer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const handleThemeChange = (theme: Theme, save: boolean = true) => {
    setActiveTheme(theme);
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--primary-color-dark', theme.primaryDark);
    root.style.setProperty('--primary-color-light', theme.primaryLight);
    root.style.setProperty('--primary-color-lightest', theme.primaryLightest);
    root.style.setProperty('--primary-text-color', theme.primary);
    if (save) {
      localStorage.setItem('ws-chatt-theme', theme.name);
    }
  };

  const openSettings = () => setCurrentView('settings');
  const closeSettings = () => setCurrentView('main');
  
  const handleLogin = () => {
    localStorage.setItem('ws-chatt-auth', 'true');
    setAuthState('authenticated');
  };
  
  const handleLogout = () => {
    localStorage.clear();
    chatHookData.loadInitialChats();
    statusHookData.loadInitialStatuses();
    callHookData.loadInitialCalls();
    setAuthState('unauthenticated');
    setCurrentView('main');
  };

  const handleBackFromChat = () => {
    selectChat(null);
  }

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
  }

  const handleViewStatus = (contactId: string) => {
    setViewingStatusContactId(contactId);
    markUpdatesAsViewed(contactId);
  };

  const handleStartCall = (contact: Chat, type: CallType) => {
    setActiveCall({ contact, type });
    setCallState('ringing');
    setCallDuration(0);
    setTimeout(() => {
        setCallState(prevState => prevState === 'ringing' ? 'connected' : prevState);
    }, 3000);
  };
  
  const handleEndCall = () => {
    if (!activeCall) return;
    const direction = callState === 'incoming' || (activeCall.contact.id === 'ai-travel-guide' && callState !== 'ringing') ? 'incoming' : 'outgoing';
    callHookData.addCallToHistory({
        contactId: activeCall.contact.id,
        contactName: activeCall.contact.name,
        contactAvatarUrl: activeCall.contact.avatarUrl,
        type: activeCall.type,
        direction: direction,
        status: callState === 'ringing' ? 'declined' : (callDuration > 0 ? 'answered' : 'missed'),
        timestamp: Date.now(),
        duration: callDuration,
    });
    setCallState('ended');
    setTimeout(() => {
        setCallState('idle');
        setActiveCall(null);
    }, 1500);
  };

  const handleSimulateIncomingCall = () => {
      const contact = chats.find(c => c.name === 'Travel Guide') || chats[1];
      if (contact) {
          setActiveCall({ contact, type: 'voice' });
          setCallState('incoming');
          setCallDuration(0);
      }
  };

  const handleAcceptCall = () => {
      setCallState('connected');
  };

  const handleDeclineCall = () => {
    if (!activeCall) return;
    callHookData.addCallToHistory({
        contactId: activeCall.contact.id,
        contactName: activeCall.contact.name,
        contactAvatarUrl: activeCall.contact.avatarUrl,
        type: activeCall.type,
        direction: 'incoming',
        status: 'declined',
        timestamp: Date.now(),
    });
    setCallState('idle');
    setActiveCall(null);
  };

  const renderMainPanel = () => {
    if (currentView === 'settings') {
      return <Settings onBack={closeSettings} activeTheme={activeTheme} onThemeChange={handleThemeChange} onLogout={handleLogout} />;
    }
    
    if (activeTab === 'chats' && activeChat) {
      return (
        <ChatPanel 
          key={activeChat.id}
          chat={activeChat}
          isTyping={chatHookData.isTyping} 
          onSendMessage={chatHookData.sendMessage} 
          onClearChat={chatHookData.clearChat}
          isMuted={chatHookData.isMuted}
          onToggleMute={chatHookData.toggleMute}
          onSuggestionClick={chatHookData.handleSuggestionClick}
          onSendImageGeneration={chatHookData.sendImageGenerationRequest}
          onSendImageEdit={chatHookData.sendImageEditRequest}
          onSendVideoGeneration={chatHookData.sendVideoGenerationRequest}
          onPlayAudio={chatHookData.playMessageAudio}
          onSendVoiceMessage={chatHookData.sendVoiceMessage}
          onBack={handleBackFromChat}
          onDeleteMessageForMe={chatHookData.deleteMessageForMe}
          onDeleteMessageForEveryone={chatHookData.deleteMessageForEveryone}
          onStartCall={(type) => handleStartCall(activeChat, type)}
        />
      );
    }
    return <MainContentPlaceholder />;
  };

  if (splashState !== 'hidden') {
    return <SplashScreen isFading={splashState === 'fading'} />;
  }

  if (authState === 'unauthenticated') {
    return <AuthScreen onAuthenticated={handleLogin} />;
  }

  const viewingStatus = statuses.find(s => s.contactId === viewingStatusContactId);

  return (
    <div className="w-full h-screen bg-[#F0F2F5] flex items-center justify-center">
      <div className="w-full h-full md:w-[95%] md:h-[95%] lg:w-[85%] lg:max-w-[1600px] md:max-h-[1440px] shadow-2xl flex overflow-hidden">
        <div className={`w-full md:w-full md:max-w-[30%] border-r border-gray-300 transition-transform duration-300 ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <Sidebar 
            chats={chats}
            activeChatId={activeChat?.id}
            onOpenSettings={openSettings}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSelectChat={handleSelectChat}
            onCreateChat={createChat}
            onCreateGroup={createGroup}
            statuses={statuses}
            onViewStatus={handleViewStatus}
            callHistory={callHookData.callHistory}
            onStartCall={handleStartCall}
            onSimulateIncomingCall={handleSimulateIncomingCall}
            userContacts={userContacts}
            onAddUserContact={addUserContact}
          />
        </div>
        <div className={`w-full flex-1 absolute inset-0 md:static transition-transform duration-300 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          {renderMainPanel()}
        </div>
      </div>
      {viewingStatus && (
        <StatusViewer 
          contactStatus={viewingStatus}
          onClose={() => setViewingStatusContactId(null)}
        />
      )}
      {callState === 'incoming' && activeCall && (
        <IncomingCall
            contact={activeCall.contact}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
        />
      )}
      {(callState === 'ringing' || callState === 'connected' || callState === 'ended') && activeCall && (
          <CallScreen
              contact={activeCall.contact}
              type={activeCall.type}
              status={callState}
              duration={callDuration}
              onEndCall={handleEndCall}
          />
      )}
    </div>
  );
}