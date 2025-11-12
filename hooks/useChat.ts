

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Message, Suggestion, Chat, Member, UserContact } from '../types';
import { generateAiResponse, generateImage, editImage, generateVideo, generateSpeech } from '../services/aiService';
import { playAudio } from '../utils/audioPlayer';

const STORAGE_KEY = 'ws-chatt-storage';
const USER_CONTACTS_STORAGE_KEY = 'ws-chatt-user-contacts';
const USER_ID = 'current-user';

const createInitialChat = (): Chat => ({
  id: 'ai-assistant-chat',
  name: 'AI Assistant',
  avatarUrl: `https://picsum.photos/seed/ws-chatt-ai/50/50`,
  systemInstruction: 'You are a helpful and friendly AI assistant. Your name is WS Chatt AI.',
  messages: [{
    id: 'welcome-message',
    text: 'Hello! I am your AI Assistant. You can chat, generate images, edit photos, or create videos. How can I help?',
    timestamp: Date.now(),
    sender: 'ai',
  }],
});

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [userContacts, setUserContacts] = useState<UserContact[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  const loadInitialChats = useCallback(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const { chats: storedChats, activeChatId: storedActiveChatId } = JSON.parse(storedData);
        if (storedChats && storedChats.length > 0) {
          setChats(storedChats);
          setActiveChatId(storedActiveChatId || storedChats[0].id);
        } else {
             const initialChat = createInitialChat();
             setChats([initialChat]);
             setActiveChatId(initialChat.id);
        }
      } else {
         const initialChat = createInitialChat();
         setChats([initialChat]);
         setActiveChatId(initialChat.id);
      }
      
      const storedContacts = localStorage.getItem(USER_CONTACTS_STORAGE_KEY);
      if (storedContacts) {
        setUserContacts(JSON.parse(storedContacts));
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      const initialChat = createInitialChat();
      setChats([initialChat]);
      setActiveChatId(initialChat.id);
      setUserContacts([]);
    }
  }, []);

  useEffect(() => {
    loadInitialChats();
  }, [loadInitialChats]);

  useEffect(() => {
    try {
      const dataToStore = { chats, activeChatId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      localStorage.setItem(USER_CONTACTS_STORAGE_KEY, JSON.stringify(userContacts));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [chats, activeChatId, userContacts]);

  const setMessagesForChat = (chatId: string, messages: Message[] | ((prevMessages: Message[]) => Message[])) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, messages: typeof messages === 'function' ? messages(chat.messages) : messages }
          : chat
      )
    );
  };

  const addMessage = (chatId: string, message: Message) => {
    setMessagesForChat(chatId, prev => [...prev, message]);
  };

  const updateMessage = (chatId: string, messageId: string, updates: Partial<Message>) => {
    setMessagesForChat(chatId, prev => prev.map(msg => msg.id === messageId ? { ...msg, ...updates } : msg));
  };
  
  const sendMessage = useCallback(async (text: string, replyTo?: Message['replyTo']) => {
    if (!text.trim() || !activeChat) return;

    const userMessage: Message = { 
      id: `user-${Date.now()}`, 
      senderId: USER_ID,
      text, 
      timestamp: Date.now(), 
      sender: 'user', 
      status: 'sending',
      ...(replyTo && { replyTo })
    };
    addMessage(activeChat.id, userMessage);
    const userMessageId = userMessage.id;

    setIsTyping(true);

    await new Promise(res => setTimeout(res, 500));
    updateMessage(activeChat.id, userMessageId, { status: 'sent' });
    
    await new Promise(res => setTimeout(res, 1000));
    updateMessage(activeChat.id, userMessageId, { status: 'delivered' });

    try {
      let prompt = text;
      if (replyTo && replyTo.text) {
          prompt = `The user is replying to a message that said: "${replyTo.text}". Their reply is: "${text}". Please respond accordingly.`;
      }
      
      let responder: { name: string; id: string; systemInstruction: string };

      if (activeChat.isGroup && activeChat.members) {
        const aiMembers = activeChat.members.filter(m => !m.isUser);
        if (aiMembers.length > 0) {
            let nextResponderIndex = (activeChat.lastResponderIndex ?? -1) + 1;
            if (nextResponderIndex >= aiMembers.length) {
                nextResponderIndex = 0;
            }
            responder = aiMembers[nextResponderIndex];
            
            setChats(prev => prev.map(chat => chat.id === activeChat.id ? {...chat, lastResponderIndex: nextResponderIndex} : chat));

        } else { // Group with no AI members, should not happen but as a fallback
             responder = { name: 'AI Assistant', id: 'ai-assistant', systemInstruction: activeChat.systemInstruction };
        }
      } else {
        responder = { name: activeChat.name, id: activeChat.id, systemInstruction: activeChat.systemInstruction };
      }

      const { text: aiText, groundingSources } = await generateAiResponse(prompt, responder.systemInstruction);

      setChats(prev => prev.map(chat => {
          if (chat.id !== activeChat.id) return chat;
          const updatedMessages = chat.messages.map(msg => 
            (msg.sender === 'user' && msg.status !== 'read') ? { ...msg, status: 'read' as const } : msg
          );
          return {
            ...chat,
            messages: [
              ...updatedMessages,
              { id: `ai-${Date.now()}`, text: aiText, timestamp: Date.now(), sender: 'ai', senderId: responder.id, senderName: responder.name, groundingSources }
            ]
          };
      }));

    } catch (error) {
      addMessage(activeChat.id, { id: `err-${Date.now()}`, text: "I'm sorry, something went wrong.", timestamp: Date.now(), sender: 'ai' });
    } finally {
      setIsTyping(false);
    }
  }, [activeChat]);

  const sendImageGenerationRequest = useCallback(async (prompt: string) => {
    if (!activeChat) return;
    const placeholderId = `loading-${Date.now()}`;
    addMessage(activeChat.id, { id: placeholderId, sender: 'ai', isLoading: true, loadingText: `Generating image: "${prompt}"`, timestamp: Date.now() });
    try {
      const imageUrl = await generateImage(prompt);
      updateMessage(activeChat.id, placeholderId, { isLoading: false, imageUrl, text: `Generated image for: "${prompt}"` });
    } catch (error) {
      updateMessage(activeChat.id, placeholderId, { isLoading: false, text: "Sorry, I couldn't generate the image." });
    }
  }, [activeChat]);

  const sendImageEditRequest = useCallback(async (prompt: string, imageBase64: string, mimeType: string) => {
    if (!activeChat) return;
    const placeholderId = `loading-${Date.now()}`;
    addMessage(activeChat.id, { id: placeholderId, sender: 'ai', isLoading: true, loadingText: `Editing image with prompt: "${prompt}"`, timestamp: Date.now() });
    try {
      const imageUrl = await editImage(prompt, imageBase64, mimeType);
      updateMessage(activeChat.id, placeholderId, { isLoading: false, imageUrl, text: `Edited image with prompt: "${prompt}"` });
    } catch (error) {
      updateMessage(activeChat.id, placeholderId, { isLoading: false, text: "Sorry, I couldn't edit the image." });
    }
  }, [activeChat]);

  const sendVideoGenerationRequest = useCallback(async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16') => {
    if (!activeChat) return;
    const placeholderId = `loading-${Date.now()}`;
    addMessage(activeChat.id, { id: placeholderId, sender: 'ai', isLoading: true, loadingText: 'Generating video... this may take a few minutes.', timestamp: Date.now() });
    try {
      const videoUrl = await generateVideo(prompt, imageBase64, mimeType, aspectRatio);
      updateMessage(activeChat.id, placeholderId, { isLoading: false, videoUrl, text: `Video generated for prompt: "${prompt}"` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't generate the video.";
      updateMessage(activeChat.id, placeholderId, { isLoading: false, text: errorMessage });
    }
  }, [activeChat]);

  const sendVoiceMessage = useCallback(async (audioData: string, duration: number) => {
    if (!activeChat) return;
    addMessage(activeChat.id, {
      id: `user-vm-${Date.now()}`, timestamp: Date.now(), sender: 'user', audioData, duration, status: 'sent',
    });
  }, [activeChat]);

  const playMessageAudio = useCallback(async (messageId: string) => {
    if (!activeChat) return;
    const message = activeChat.messages.find(m => m.id === messageId);
    if (!message || !message.text) return;

    updateMessage(activeChat.id, messageId, { isPlayingAudio: true });

    try {
      let audioData = message.audioData;
      if (!audioData) {
        audioData = await generateSpeech(message.text);
        updateMessage(activeChat.id, messageId, { audioData });
      }
      if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      await playAudio(audioData, audioContextRef.current);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      updateMessage(activeChat.id, messageId, { isPlayingAudio: false });
    }
  }, [activeChat]);

  const clearChat = useCallback(() => {
    if (!activeChat) return;
    setMessagesForChat(activeChat.id, []);
  }, [activeChat]);
  
  const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);
  
  const handleSuggestionClick = useCallback((messageId: string, suggestion: Suggestion) => {
    if (!activeChat) return;
    updateMessage(activeChat.id, messageId, { suggestions: undefined });
    if (suggestion.type === 'message') sendMessage(suggestion.payload);
    else if (suggestion.type === 'action' && suggestion.payload === 'ACTION_CLEAR_CHAT') clearChat();
  }, [sendMessage, clearChat, activeChat]);

  const deleteMessageForMe = useCallback((messageId: string) => {
    if (!activeChat) return;
    updateMessage(activeChat.id, messageId, { isDeleting: true });
    setTimeout(() => {
        setMessagesForChat(activeChat.id, prev => prev.filter(msg => msg.id !== messageId));
    }, 300);
  }, [activeChat]);

  const deleteMessageForEveryone = useCallback((messageId: string) => {
    if (!activeChat) return;
    updateMessage(activeChat.id, messageId, {
        text: undefined, imageUrl: undefined, videoUrl: undefined, audioData: undefined,
        suggestions: undefined, groundingSources: undefined, deletedForEveryone: true,
    });
  }, [activeChat]);
  
  const createChat = useCallback((contact: Omit<Chat, 'id' | 'messages'>) => {
    const existingChat = chats.find(c => c.name === contact.name);
    if(existingChat) {
        setActiveChatId(existingChat.id);
        return;
    }
    const newChat: Chat = {
        ...contact,
        id: `${contact.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        messages: [],
    };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
  }, [chats]);

  const createGroup = useCallback((members: Omit<Member, 'isUser'>[], groupName: string) => {
    const userMember: Member = {
        id: USER_ID,
        name: 'You',
        avatarUrl: `https://picsum.photos/seed/ws-chatt-user/50/50`,
        systemInstruction: '',
        isUser: true,
    };

    const newGroup: Chat = {
        id: `group-${Date.now()}`,
        name: groupName,
        avatarUrl: `https://picsum.photos/seed/${groupName.replace(/\s+/g, '-')}/50/50`,
        systemInstruction: 'You are in a group chat. Respond as your persona.',
        messages: [],
        isGroup: true,
        members: [userMember, ...members],
        lastResponderIndex: -1,
    };
    setChats(prev => [...prev, newGroup]);
    setActiveChatId(newGroup.id);
  }, []);
  
  const selectChat = useCallback((chatId: string | null) => {
      setActiveChatId(chatId);
  }, []);

  const addUserContact = useCallback((name: string) => {
    const newContact: UserContact = {
      id: `user-contact-${Date.now()}`,
      name: name,
    };
    setUserContacts(prev => [...prev, newContact]);
  }, []);

  return { 
      chats, activeChat, selectChat, createChat, createGroup, loadInitialChats,
      userContacts, addUserContact,
      isTyping, sendMessage, clearChat, isMuted, toggleMute, 
      handleSuggestionClick, sendImageGenerationRequest, sendImageEditRequest, 
      sendVideoGenerationRequest, playMessageAudio, sendVoiceMessage, 
      deleteMessageForMe, deleteMessageForEveryone 
  };
};