
import { useState, useEffect, useCallback } from 'react';
import { Call, Chat } from '../types';

const CALL_STORAGE_KEY = 'ws-chatt-calls';

const createInitialCalls = (chats: Chat[]): Call[] => {
    const aiContacts = chats.filter(c => c.id !== 'user-status' && !c.isGroup);
    if (aiContacts.length < 2) return [];
    const now = Date.now();
    return [
        {
            id: `call-1-${now}`,
            contactId: aiContacts[0].id,
            contactName: aiContacts[0].name,
            contactAvatarUrl: aiContacts[0].avatarUrl,
            type: 'video',
            direction: 'outgoing',
            status: 'answered',
            timestamp: now - 3600000,
            duration: 125,
        },
        {
            id: `call-2-${now}`,
            contactId: aiContacts[1].id,
            contactName: aiContacts[1].name,
            contactAvatarUrl: aiContacts[1].avatarUrl,
            type: 'voice',
            direction: 'incoming',
            status: 'missed',
            timestamp: now - 86400000,
        }
    ];
};

export const useCalls = (chats: Chat[]) => {
    const [callHistory, setCallHistory] = useState<Call[]>([]);

    const loadInitialCalls = useCallback(() => {
        try {
            const storedData = localStorage.getItem(CALL_STORAGE_KEY);
            if (storedData) {
                const storedCalls = JSON.parse(storedData) as Call[];
                 if (Array.isArray(storedCalls)) {
                    setCallHistory(storedCalls);
                    return;
                }
            }
            const initialCalls = createInitialCalls(chats);
            setCallHistory(initialCalls);
        } catch (error) {
            console.error("Failed to load calls from localStorage", error);
            const initialCalls = createInitialCalls(chats);
            setCallHistory(initialCalls);
        }
    }, [chats]);
    
    useEffect(() => {
        if(chats.length > 0) {
            loadInitialCalls();
        }
    }, [chats, loadInitialCalls]);
    
    useEffect(() => {
        localStorage.setItem(CALL_STORAGE_KEY, JSON.stringify(callHistory));
    }, [callHistory]);
    
    const addCallToHistory = (call: Omit<Call, 'id'>) => {
        const newCall: Call = { ...call, id: `call-${Date.now()}`};
        setCallHistory(prev => [newCall, ...prev]);
    };

    return { callHistory, addCallToHistory, loadInitialCalls };
};
