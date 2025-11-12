import { useState, useEffect, useCallback } from 'react';
import { ContactStatus, StatusUpdate, Chat } from '../types';

const STATUS_STORAGE_KEY = 'ws-chatt-status';

const createInitialStatuses = (chats: Chat[]): ContactStatus[] => {
    const aiContacts = chats.filter(c => c.id !== 'user-status');
    const now = Date.now();

    const mockStatuses: ContactStatus[] = [
        {
            contactId: 'user-status',
            contactName: 'My status',
            contactAvatarUrl: `https://picsum.photos/seed/ws-chatt-user/50/50`,
            updates: [], // User starts with no status
        },
        ...aiContacts.map((chat, index) => {
            const updates: StatusUpdate[] = [];
            if (chat.name === 'AI Assistant') {
                updates.push({
                    id: `${chat.id}-s1`,
                    type: 'text',
                    content: 'I can now help with real-time location based queries!',
                    backgroundColor: '#25D366',
                    timestamp: now - (index * 3600000), // Offset by an hour
                    duration: 5000,
                    viewed: false,
                });
            }
             if (chat.name === 'Creative Writer') {
                updates.push({
                    id: `${chat.id}-s1`,
                    type: 'text',
                    content: 'Just wrote a new short story about a robot who discovers music. Ask me to read it to you!',
                    backgroundColor: '#6A0DAD',
                    timestamp: now - (index * 3600000) - 1800000,
                    duration: 7000,
                    viewed: false,
                }, {
                    id: `${chat.id}-s2`,
                    type: 'image',
                    content: 'https://picsum.photos/seed/robot-music/1080/1920',
                    timestamp: now - (index * 3600000),
                    duration: 5000,
                    viewed: false,
                });
            }
            if (chat.name === 'Travel Guide') {
                updates.push({
                    id: `${chat.id}-s1`,
                    type: 'image',
                    content: 'https://picsum.photos/seed/paris-eiffel/1080/1920',
                    timestamp: now - (index * 3600000) - 60000,
                    duration: 5000,
                    viewed: false,
                });
            }
            return {
                contactId: chat.id,
                contactName: chat.name,
                contactAvatarUrl: chat.avatarUrl,
                updates,
            };
        }),
    ];

    return mockStatuses.filter(s => s.updates.length > 0);
};


export const useStatus = (chats: Chat[]) => {
    const [statuses, setStatuses] = useState<ContactStatus[]>([]);

    const loadInitialStatuses = useCallback(() => {
        try {
            const storedData = localStorage.getItem(STATUS_STORAGE_KEY);
            if (storedData) {
                const storedStatuses = JSON.parse(storedData) as ContactStatus[];
                // Basic data validation
                if (Array.isArray(storedStatuses)) {
                    setStatuses(storedStatuses);
                    return;
                }
            }
            // If nothing in storage or data is invalid, create initial mock data
            const initialStatuses = createInitialStatuses(chats);
            setStatuses(initialStatuses);
        } catch (error) {
            console.error("Failed to load statuses from localStorage", error);
            const initialStatuses = createInitialStatuses(chats);
            setStatuses(initialStatuses);
        }
    }, [chats]);
    
    useEffect(() => {
        if(chats.length > 0) {
            loadInitialStatuses();
        }
    }, [chats, loadInitialStatuses]);

    useEffect(() => {
        try {
            localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statuses));
        } catch (error) {
            console.error("Failed to save statuses to localStorage", error);
        }
    }, [statuses]);

    const markUpdatesAsViewed = (contactId: string) => {
        setStatuses(prevStatuses =>
            prevStatuses.map(status => {
                if (status.contactId === contactId) {
                    return {
                        ...status,
                        updates: status.updates.map(update => ({ ...update, viewed: true })),
                    };
                }
                return status;
            })
        );
    };

    return { statuses, markUpdatesAsViewed, loadInitialStatuses };
};
