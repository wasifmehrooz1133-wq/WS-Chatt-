
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Message, Suggestion, Chat } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import GenerationModal, { ModalMode } from './GenerationModal';
import ContactInfoPanel from './ContactInfoPanel';
import { 
  MoreVerticalIcon, SmileIcon, SendIcon, PhoneIcon, VideoIcon, SearchIcon, XIcon, UserIcon, UsersIcon, GalleryHorizontalIcon, LinkIcon, FileTextIcon, BellOffIcon, ClockIcon, PaletteIcon, ChevronRightIcon, FlagIcon, BanIcon, Trash2Icon, DownloadIcon, HomeIcon, ListPlusIcon, LanguagesIcon, PaperclipIcon, CameraIcon, ImageIcon, MapPinIcon, HeadphonesIcon, BarChart3Icon, CalendarDaysIcon, ChevronLeftIcon, MicrophoneIcon 
} from './Icons';

interface ChatPanelProps {
  chat: Chat;
  isTyping: boolean;
  onSendMessage: (text: string, replyTo?: Message['replyTo']) => void;
  onSendVoiceMessage: (audioData: string, duration: number) => void;
  onClearChat: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onSuggestionClick: (messageId: string, suggestion: Suggestion) => void;
  onSendImageGeneration: (prompt: string) => void;
  onSendImageEdit: (prompt: string, imageBase64: string, mimeType: string) => void;
  onSendVideoGeneration: (prompt: string, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16') => void;
  onPlayAudio: (messageId: string) => void;
  onBack: () => void;
  onDeleteMessageForMe: (messageId: string) => void;
  onDeleteMessageForEveryone: (messageId: string) => void;
  onStartCall: (type: 'video' | 'voice') => void;
}

const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(1, '0')}:${String(secs).padStart(2, '0')}`;
};

const ReplyPreview: React.FC<{ message: Message; onCancel: () => void; }> = ({ message, onCancel }) => {
    const getPreviewContent = () => {
        if (message.imageUrl) return <><ImageIcon className="w-4 h-4 mr-2" /> Image</>;
        if (message.videoUrl) return <><VideoIcon className="w-4 h-4 mr-2" /> Video</>;
        if (message.audioData) return <><MicrophoneIcon className="w-4 h-4 mr-2" /> Voice Message</>;
        return message.text;
    }
    
    return (
        <div className="bg-gray-200 p-2 mx-2 rounded-lg flex items-start border-l-4 border-primary">
            <div className="flex-1 min-w-0">
                <p className="font-bold text-primary text-sm">{message.sender === 'user' ? 'You' : 'AI Assistant'}</p>
                <p className="text-sm text-gray-600 truncate flex items-center">{getPreviewContent()}</p>
            </div>
            <button onClick={onCancel} className="p-1 text-gray-500 hover:text-gray-800">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default function ChatPanel({ chat, isTyping, onSendMessage, onSendVoiceMessage, onClearChat, isMuted, onToggleMute, onSuggestionClick, onSendImageGeneration, onSendImageEdit, onSendVideoGeneration, onPlayAudio, onBack, onDeleteMessageForMe, onDeleteMessageForEveryone, onStartCall }: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [pinMenuOpen, setPinMenuOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCancel, setShowCancel] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const wasCancelledRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pinMenuRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    if (!replyingTo) { // Only auto-scroll if not in a reply action
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages, isTyping, replyingTo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
      if (pinMenuRef.current && !pinMenuRef.current.contains(target)) setPinMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleSend = () => {
    if (inputText.trim()) {
      const replyContext = replyingTo ? {
        id: replyingTo.id,
        sender: replyingTo.sender,
        text: replyingTo.text,
        imageUrl: replyingTo.imageUrl,
        videoUrl: replyingTo.videoUrl,
        audioData: !!replyingTo.audioData,
      } : undefined;

      onSendMessage(inputText, replyContext);
      setInputText('');
      setReplyingTo(null);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handlePinMenuClick = (mode: ModalMode) => {
    setPinMenuOpen(false);
    setModalMode(mode);
  };
  
  const handleRecordingMove = (e: MouseEvent | TouchEvent) => {
      if (!isRecording) return;
      const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const diff = startXRef.current - currentX;
      const cancelled = diff > 60; // 60px threshold to cancel
      setShowCancel(cancelled);
      wasCancelledRef.current = cancelled;
  };

  const handleStopRecording = () => {
      window.removeEventListener('mousemove', handleRecordingMove);
      window.removeEventListener('touchmove', handleRecordingMove);
      window.removeEventListener('mouseup', handleStopRecording);
      window.removeEventListener('touchend', handleStopRecording);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
      }
      
      if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
      }
      
      setIsRecording(false);
  };

  const handleStartRecording = async (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (isRecording) return;
      
      startXRef.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
      wasCancelledRef.current = false;
      setShowCancel(false);

      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              audioChunksRef.current.push(event.data);
          };

          mediaRecorder.onstop = () => {
              stream.getTracks().forEach(track => track.stop()); // Release microphone
              
              if (wasCancelledRef.current) {
                  wasCancelledRef.current = false;
                  return;
              }

              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = () => {
                  const base64Data = reader.result as string;
                  const audio = new Audio(base64Data);
                  audio.onloadedmetadata = () => {
                      if (audio.duration < 1) return; // Ignore very short recordings
                      onSendVoiceMessage(base64Data, Math.round(audio.duration));
                  };
              };
          };
          
          mediaRecorder.start();
          setIsRecording(true);
          setRecordingTime(0);
          recordingTimerRef.current = window.setInterval(() => {
              setRecordingTime(prev => prev + 1);
          }, 1000);

          window.addEventListener('mousemove', handleRecordingMove);
          window.addEventListener('touchmove', handleRecordingMove);
          window.addEventListener('mouseup', handleStopRecording);
          window.addEventListener('touchend', handleStopRecording);

      } catch (err) {
          console.error("Error starting recording:", err);
          alert("Could not start recording. Please ensure microphone permissions are granted.");
      }
  };

  const handleDeleteForEveryone = (message: Message) => {
    if (message.sender === 'user') {
        if (message.status === 'delivered' || message.status === 'read') {
            if (window.confirm("Delete for everyone?")) {
                onDeleteMessageForEveryone(message.id);
            }
        } else {
            onDeleteMessageForEveryone(message.id);
        }
    } else {
        if (window.confirm("Delete this message for everyone?")) {
            onDeleteMessageForEveryone(message.id);
        }
    }
  };

  const scrollToMessage = (messageId: string) => {
    const element = messageRefs.current[messageId];
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.classList.add('animate-pulse-quick');
    setTimeout(() => {
      element?.classList.remove('animate-pulse-quick');
    }, 1500);
  };


  const menuItems = [
    { label: chat.isGroup ? 'Group info' : 'View contact', icon: UserIcon, action: () => { setMenuOpen(false); setShowInfoPanel(true); } },
    { label: 'Search', icon: SearchIcon, action: () => { setShowSearch(true); setMenuOpen(false); } },
    { label: isMuted ? 'Unmute' : 'Mute', icon: BellOffIcon, action: () => { onToggleMute(); setMenuOpen(false); } },
    { label: 'Clear chat', icon: Trash2Icon, action: () => { onClearChat(); setMenuOpen(false); } },
  ];

  const pinMenuItems = [
    { label: 'Generate Image', icon: ImageIcon, color: 'bg-purple-500', mode: 'generate-image' },
    { label: 'Edit Image', icon: PaletteIcon, color: 'bg-blue-500', mode: 'edit-image' },
    { label: 'Generate Video', icon: VideoIcon, color: 'bg-red-500', mode: 'generate-video' },
    { label: 'Document', icon: FileTextIcon, color: 'bg-indigo-500', mode: null },
    { label: 'Contact', icon: UserIcon, color: 'bg-cyan-500', mode: null },
    { label: 'Poll', icon: BarChart3Icon, color: 'bg-teal-500', mode: null },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#EFEAE2] relative overflow-hidden">
      <div className="chat-background absolute inset-0"></div>
      
      <header className="bg-[#F0F2F5] px-4 py-[10px] flex justify-between items-center z-10 border-l border-gray-300 min-h-[60px]">
        {!showSearch ? (
          <>
            <div className="flex items-center">
              <button onClick={onBack} className="md:hidden mr-2 text-gray-500">
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <img src={chat.avatarUrl} alt={`${chat.name} Avatar`} className="w-10 h-10 rounded-full mr-4" />
              <div>
                <h2 className="font-semibold">{chat.name}</h2>
                <p className="text-xs text-gray-500">{isTyping ? 'typing...' : 'online'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <button onClick={() => onStartCall('video')}><VideoIcon className="w-6 h-6" /></button>
              <button onClick={() => onStartCall('voice')}><PhoneIcon className="w-6 h-6" /></button>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)}><MoreVerticalIcon className="w-6 h-6" /></button>
                {menuOpen && (
                  <div className="absolute top-8 right-0 w-56 bg-white rounded-md shadow-lg z-20 py-2">
                    {menuItems.map(item => (
                      <button key={item.label} onClick={item.action} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center">
            <input type="text" placeholder="Search..." className="w-full bg-white rounded-lg px-4 py-1 text-sm focus:outline-none" autoFocus />
            <button onClick={() => setShowSearch(false)} className="ml-2 p-2 text-gray-500"><XIcon className="w-5 h-5" /></button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        <div className="flex flex-col space-y-2">
          {chat.messages.map((msg) => (
// Fix: The ref callback was implicitly returning the assigned element, which violates the Ref type. Wrapped the assignment in braces to ensure the callback returns void.
            <div key={msg.id} ref={el => { messageRefs.current[msg.id] = el; }}>
              <MessageBubble 
                message={msg} 
                onSuggestionClick={(suggestion) => onSuggestionClick(msg.id, suggestion)} 
                onPlayAudio={() => onPlayAudio(msg.id)}
                onDeleteForMe={onDeleteMessageForMe}
                onDeleteForEveryone={handleDeleteForEveryone}
                onReply={setReplyingTo}
                onScrollToMessage={scrollToMessage}
              />
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="bg-[#F0F2F5] pt-2 z-10">
        {replyingTo && <ReplyPreview message={replyingTo} onCancel={() => setReplyingTo(null)} />}
        <div className="p-2 flex items-end space-x-2">
            {isRecording ? (
                <div className="flex-1 bg-white rounded-lg flex items-center p-2 justify-between">
                    <div className="flex items-center">
                        <MicrophoneIcon className="w-6 h-6 text-red-500 animate-pulse" />
                        <span className="ml-2 font-mono text-gray-700">{formatRecordingTime(recordingTime)}</span>
                    </div>
                    <div className={`text-gray-500 text-sm flex items-center transition-opacity duration-300 ${showCancel ? 'opacity-0' : 'opacity-100'}`}>
                        <ChevronLeftIcon className="w-5 h-5" />
                        <span>Slide to cancel</span>
                    </div>
                     <div className={`text-red-600 text-sm flex items-center absolute right-10 transition-opacity duration-300 ${showCancel ? 'opacity-100' : 'opacity-0'}`}>
                        <Trash2Icon className="w-5 h-5 mr-2" />
                        <span>Release to cancel</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="relative" ref={pinMenuRef}>
                      <button onClick={() => setPinMenuOpen(!pinMenuOpen)} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Attach file">
                        <PaperclipIcon className="w-6 h-6" />
                      </button>
                      {pinMenuOpen && (
                        <div className="absolute bottom-full mb-2 w-72 bg-white rounded-xl shadow-lg z-20 p-2">
                          <div className="grid grid-cols-3 gap-4 p-2">
                            {pinMenuItems.map(item => (
                              <button 
                                key={item.label} 
                                onClick={() => {
                                  if (item.mode) {
                                    handlePinMenuClick(item.mode as ModalMode)
                                  } else {
                                    alert('Feature coming soon!');
                                    setPinMenuOpen(false);
                                  }
                                }} 
                                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-primary"
                              >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${item.color}`}>
                                  <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs text-center">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 bg-white rounded-lg flex items-center">
                      <textarea
                        rows={1}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message"
                        className="flex-1 p-2 bg-transparent border-none focus:ring-0 resize-none max-h-40 no-scrollbar"
                      />
                    </div>
                    
                    {inputText.trim() ? (
                        <button onClick={handleSend} className="bg-primary text-white p-2 rounded-full hover:bg-primary-light" aria-label="Send message">
                            <SendIcon className="w-6 h-6" />
                        </button>
                    ) : (
                        <button onMouseDown={handleStartRecording} onTouchStart={handleStartRecording} className="bg-primary text-white p-2 rounded-full hover:bg-primary-light" aria-label="Record voice message">
                            <MicrophoneIcon className="w-6 h-6" />
                        </button>
                    )}
                </>
            )}
        </div>
      </footer>
       <style>{`
        @keyframes pulse-quick {
          0%, 100% { background-color: transparent; }
          50% { background-color: var(--primary-color-lightest); }
        }
        .animate-pulse-quick {
          animation: pulse-quick 1.5s ease-in-out;
        }
      `}</style>
      
      {modalMode && (
          <GenerationModal
              mode={modalMode}
              onClose={() => setModalMode(null)}
              onGenerateImage={onSendImageGeneration}
              onEditImage={onSendImageEdit}
              onGenerateVideo={onSendVideoGeneration}
          />
      )}
      
      {showInfoPanel && <ContactInfoPanel chat={chat} onClose={() => setShowInfoPanel(false)} />}
    </div>
  );
}
