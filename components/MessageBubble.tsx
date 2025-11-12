

import React, { useState, useRef, useEffect } from 'react';
import { Message, Suggestion, GroundingSource } from '../types';
import { LinkIcon, SpeakerIcon, SpinnerIcon, PlayIcon, PauseIcon, ClockIcon, CheckIcon, CheckCheckIcon, Trash2Icon, BanIcon, CornerDownLeftIcon, ImageIcon, VideoIcon, MicrophoneIcon } from './Icons';

interface MessageBubbleProps {
  message: Message;
  onSuggestionClick?: (suggestion: Suggestion) => void;
  onPlayAudio: () => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (message: Message) => void;
  onReply: (message: Message) => void;
  onScrollToMessage: (messageId: string) => void;
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatAudioTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const AudioPlayer: React.FC<{ audioData: string; duration?: number }> = ({ audioData, duration }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [actualDuration, setActualDuration] = useState(duration || 0);
    
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };
        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration && audio.duration !== Infinity) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const onLoadedMetadata = () => {
           if (audio.duration && audio.duration !== Infinity) {
             setActualDuration(audio.duration);
           }
        }

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, []);

    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const timeline = e.currentTarget;
        const rect = timeline.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * actualDuration;
    };

    return (
        <div className="flex items-center space-x-2 p-2 w-64 md:w-80">
            <audio ref={audioRef} src={audioData} preload="metadata"></audio>
            <button onClick={togglePlay} className="flex-shrink-0 text-gray-600">
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <div className="flex-1 flex flex-col justify-center">
                <div onClick={handleScrub} className="w-full h-1 bg-gray-300 rounded-full cursor-pointer relative">
                    <div className="h-1 bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
                    <div className="absolute h-3 w-3 bg-primary-dark rounded-full -top-1" style={{ left: `calc(${progress}% - 6px)` }}></div>
                </div>
                 <span className="text-xs text-gray-500 font-mono self-end mt-1">
                    {formatAudioTime(currentTime)} / {formatAudioTime(actualDuration)}
                </span>
            </div>
        </div>
    );
};


const GroundingSources: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => (
    <div className="mt-2 pt-2 border-t border-gray-200">
        <h4 className="text-xs font-bold text-gray-500 mb-1">Sources:</h4>
        <ul className="space-y-1">
            {sources.map((source, index) => (
                <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                        <LinkIcon className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{source.title}</span>
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

const MessageStatus: React.FC<{ status?: Message['status'] }> = ({ status }) => {
  if (!status) return null;

  const iconSize = "w-4 h-4";
  const transition = "transition-colors duration-500 ease-in-out";

  switch (status) {
    case 'sending':
      return <ClockIcon className={`${iconSize} text-gray-400`} />;
    case 'sent':
      return <CheckIcon className={`${iconSize} text-gray-400`} />;
    case 'delivered':
      return <CheckCheckIcon className={`${iconSize} text-gray-400`} />;
    case 'read':
      return <CheckCheckIcon className={`${iconSize} text-blue-500 ${transition}`} />;
    default:
      return null;
  }
};

const QuotedReply: React.FC<{ replyTo: NonNullable<Message['replyTo']>, onScrollToMessage: () => void }> = ({ replyTo, onScrollToMessage }) => {
    const getPreviewContent = () => {
        if (replyTo.imageUrl) return <><ImageIcon className="w-4 h-4 mr-2" /> Image</>;
        if (replyTo.videoUrl) return <><VideoIcon className="w-4 h-4 mr-2" /> Video</>;
        if (replyTo.audioData) return <><MicrophoneIcon className="w-4 h-4 mr-2" /> Voice Message</>;
        return replyTo.text;
    }

    return (
        <div onClick={onScrollToMessage} className="bg-black bg-opacity-5 rounded-md p-2 mb-1 border-l-2 border-primary cursor-pointer">
            <p className="font-bold text-primary text-sm">{replyTo.sender === 'user' ? 'You' : 'AI Assistant'}</p>
            <p className="text-sm text-gray-600 truncate flex items-center">{getPreviewContent()}</p>
        </div>
    );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSuggestionClick, onPlayAudio, onDeleteForMe, onDeleteForEveryone, onReply, onScrollToMessage }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isUser = message.sender === 'user';
  const showSenderName = !isUser && message.senderName;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (message.isLoading || message.deletedForEveryone) return;
    setMenuOpen(true);
  };

  const handleDeleteForMe = () => {
    onDeleteForMe(message.id);
    setMenuOpen(false);
  };

  const handleDeleteForEveryone = () => {
    onDeleteForEveryone(message);
    setMenuOpen(false);
  };

  const handleReply = () => {
    onReply(message);
    setMenuOpen(false);
  };

  const renderContent = () => {
    if (message.deletedForEveryone) {
      const text = message.sender === 'user' ? "You deleted this message" : "This message was deleted";
      return (
        <div className="flex items-center italic text-sm text-gray-500 py-1">
          <BanIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <p>{text}</p>
        </div>
      );
    }
    if (message.isLoading) {
      return (
        <div className="flex items-center space-x-2 p-2">
            <SpinnerIcon className="w-5 h-5 text-gray-500" />
            <p className="text-sm text-gray-600">{message.loadingText || 'Loading...'}</p>
        </div>
      );
    }
    if (isUser && message.audioData) {
        return <AudioPlayer audioData={message.audioData} duration={message.duration} />;
    }
    if (message.imageUrl) {
      return <img src={message.imageUrl} alt={message.text || 'Generated Image'} className="rounded-lg max-w-xs md:max-w-md" />;
    }
    if (message.videoUrl) {
      return <video src={message.videoUrl} controls className="rounded-lg max-w-xs md:max-w-md" />;
    }
    return <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.text}</p>;
  };

  const showFooter = !message.isLoading;

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${message.isDeleting ? 'animate-fade-out' : ''}`}>
      {showSenderName && (
          <p className="text-xs text-primary font-semibold mb-1 ml-2">{message.senderName}</p>
      )}
      <div 
        className={`relative max-w-xs md:max-w-md lg:max-w-2xl rounded-lg shadow-sm ${isUser ? 'bg-[#DCF8C6]' : 'bg-white'}`}
        onContextMenu={handleContextMenu}
      >
        {isMenuOpen && (
          <div ref={menuRef} className={`absolute top-0 ${isUser ? 'right-full mr-2' : 'left-full ml-2'} w-48 bg-white rounded-md shadow-lg z-10 py-1`}>
            <button onClick={handleReply} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
              <CornerDownLeftIcon className="w-4 h-4 mr-3" />
              <span>Reply</span>
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button onClick={handleDeleteForMe} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
              <Trash2Icon className="w-4 h-4 mr-3" />
              <span>Delete for me</span>
            </button>
            <button onClick={handleDeleteForEveryone} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
              <Trash2Icon className="w-4 h-4 mr-3" />
              <span>Delete for everyone</span>
            </button>
          </div>
        )}

        <div className={`px-3 py-2 ${isUser && message.audioData ? 'p-0' : ''}`}>
          {message.replyTo && <QuotedReply replyTo={message.replyTo} onScrollToMessage={() => onScrollToMessage(message.replyTo!.id)} />}
          {renderContent()}
          {showFooter && (
            <div className="flex justify-end items-center mt-1 space-x-1 pl-3">
              {!isUser && message.text && !message.deletedForEveryone &&(
                <button onClick={onPlayAudio} className="text-gray-400 hover:text-gray-600 mr-auto" aria-label="Play audio">
                   {message.isPlayingAudio ? <SpinnerIcon className="w-4 h-4" /> : <SpeakerIcon className="w-4 h-4" />}
                </button>
              )}
              <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
              {isUser && !message.deletedForEveryone && <MessageStatus status={message.status} />}
            </div>
          )}
        </div>

        {message.groundingSources && !message.deletedForEveryone && message.groundingSources.length > 0 && (
            <div className="px-3 pb-2">
                <GroundingSources sources={message.groundingSources} />
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
