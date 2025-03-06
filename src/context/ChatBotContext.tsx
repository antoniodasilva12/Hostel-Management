import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

interface MessageReaction {
    id: string;
    reaction: '👍' | '👎' | '❤️' | '😊' | '🤔';
    user_id: string;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    actions?: {
        text: string;
        action: () => void;
    }[];
    reactions?: MessageReaction[];
    wasHelpful?: boolean;
}

interface QuickReply {
    text: string;
    action: () => void;
}

interface ChatBotContextType {
    messages: Message[];
    sendMessage: (text: string) => void;
    isOpen: boolean;
    toggleChat: () => void;
    handleAction: (action: () => void) => void;
    isTyping: boolean;
    searchMessages: (query: string) => Message[];
    exportChat: () => void;
    deleteMessage: (id: string) => Promise<void>;
    getSuggestedReplies: () => QuickReply[];
    addReaction: (messageId: string, reaction: MessageReaction['reaction']) => Promise<void>;
    markMessageHelpful: (messageId: string, helpful: boolean) => Promise<void>;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export function useChatBot() {
    const context = useContext(ChatBotContext);
    if (context === undefined) {
        throw new Error('useChatBot must be used within a ChatBotProvider');
    }
    return context;
}

export function ChatBotProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(() => crypto.randomUUID());

    // Load chat history when component mounts
    useEffect(() => {
        if (user) {
            loadChatHistory();
        }
    }, [user]);

    const loadChatHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .eq('user_id', user?.id)
                .order('timestamp', { ascending: true })
                .limit(50);

            if (error) throw error;

            if (data && data.length > 0) {
                const formattedMessages = data.map(msg => ({
                    id: msg.id,
                    text: msg.message,
                    sender: msg.sender,
                    timestamp: new Date(msg.timestamp),
                    actions: msg.actions
                }));
                setMessages(formattedMessages);
            } else {
                // Set welcome message if no history
                setMessages([{
                    id: '1',
                    text: `Hello${user?.name ? ' ' + user.name : ''}! How can I help you today?`,
                    sender: 'bot',
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const saveChatMessage = async (message: Message) => {
        try {
            const { error } = await supabase
                .from('chat_history')
                .insert([{
                    user_id: user?.id,
                    message: message.text,
                    sender: message.sender,
                    timestamp: message.timestamp,
                    actions: message.actions
                }]);

            if (error) throw error;
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    };

    const toggleChat = () => setIsOpen(prev => !prev);

    const handleAction = (action: () => void) => {
        action();
        toggleChat();
    };

    const addReaction = async (messageId: string, reaction: MessageReaction['reaction']) => {
        try {
            const { error } = await supabase
                .from('chat_reactions')
                .upsert({
                    message_id: messageId,
                    user_id: user?.id,
                    reaction
                });

            if (error) throw error;

            setMessages(prev => prev.map(msg => 
                msg.id === messageId
                    ? {
                        ...msg,
                        reactions: [
                            ...(msg.reactions || []).filter(r => r.user_id !== user?.id),
                            { id: crypto.randomUUID(), reaction, user_id: user?.id as string }
                        ]
                    }
                    : msg
            ));
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const markMessageHelpful = async (messageId: string, helpful: boolean) => {
        try {
            const { error } = await supabase
                .from('chat_analytics')
                .insert({
                    user_id: user?.id,
                    message_id: messageId,
                    was_helpful: helpful,
                    session_id: sessionId
                });

            if (error) throw error;

            setMessages(prev => prev.map(msg => 
                msg.id === messageId
                    ? { ...msg, wasHelpful: helpful }
                    : msg
            ));
        } catch (error) {
            console.error('Error marking message helpful:', error);
        }
    };

    const generateResponse = (userMessage: string): Message => {
        const lowerMessage = userMessage.toLowerCase();
        let queryType = 'other';

        if (lowerMessage.includes('maintenance')) queryType = 'maintenance';
        else if (lowerMessage.includes('bill')) queryType = 'billing';
        else if (lowerMessage.includes('room')) queryType = 'room';
        
        const role = user?.role;
        const basePath = role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
        
        // Maintenance related queries
        if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair')) {
            if (role === 'student') {
                return {
                    id: Date.now().toString(),
                    text: "I can help you submit a maintenance request. Would you like to do that now?",
                    sender: 'bot',
                    timestamp: new Date(),
                    actions: [
                        {
                            text: "Submit Maintenance Request",
                            action: () => navigate(`${basePath}/maintenance`)
                        }
                    ]
                };
            } else {
                return {
                    id: Date.now().toString(),
                    text: "You can view and manage all maintenance requests in the Maintenance section.",
                    sender: 'bot',
                    timestamp: new Date(),
                    actions: [
                        {
                            text: "View Maintenance Requests",
                            action: () => navigate(`${basePath}/maintenance`)
                        }
                    ]
                };
            }
        }
        
        // Billing related queries
        if (lowerMessage.includes('bill') || lowerMessage.includes('payment')) {
            if (role === 'student') {
                return {
                    id: Date.now().toString(),
                    text: "You can view your bills and make payments in the Billing section.",
                    sender: 'bot',
                    timestamp: new Date(),
                    actions: [
                        {
                            text: "Go to Billing",
                            action: () => navigate(`${basePath}/billing`)
                        }
                    ]
                };
            } else {
                return {
                    id: Date.now().toString(),
                    text: "You can manage student bills and view payment history in the Billing Management section.",
                    sender: 'bot',
                    timestamp: new Date(),
                    actions: [
                        {
                            text: "Manage Bills",
                            action: () => navigate(`${basePath}/billing`)
                        }
                    ]
                };
            }
        }
        
        // Room related queries
        if (lowerMessage.includes('room') || lowerMessage.includes('allocation')) {
            if (role === 'student') {
                return {
                    id: Date.now().toString(),
                    text: "You can view your room details and make room-related requests in the Room Management section.",
                    sender: 'bot',
                    timestamp: new Date(),
                    actions: [
                        {
                            text: "View Room Details",
                            action: () => navigate(`${basePath}/room`)
                        }
                    ]
                };
            } else {
                return {
                    id: Date.now().toString(),
                    text: "You can manage room allocations and view room status in the Room Allocation section.",
                    sender: 'bot',
                    timestamp: new Date(),
                    actions: [
                        {
                            text: "Manage Rooms",
                            action: () => navigate(`${basePath}/rooms`)
                        }
                    ]
                };
            }
        }

        // Help with navigation
        if (lowerMessage.includes('dashboard') || lowerMessage.includes('home')) {
            return {
                id: Date.now().toString(),
                text: "I can help you navigate to the dashboard.",
                sender: 'bot',
                timestamp: new Date(),
                actions: [
                    {
                        text: "Go to Dashboard",
                        action: () => navigate(basePath)
                    }
                ]
            };
        }

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return {
                id: Date.now().toString(),
                text: `Hello${user?.name ? ' ' + user.name : ''}! How can I assist you today? You can ask me about maintenance requests, billing, or room management.`,
                sender: 'bot',
                timestamp: new Date()
            };
        }

        return {
            id: Date.now().toString(),
            text: "I'm not sure about that. You can ask me about maintenance requests, billing, room management, or try navigating to the dashboard.",
            sender: 'bot',
            timestamp: new Date(),
            actions: [
                {
                    text: "Go to Dashboard",
                    action: () => navigate(basePath)
                }
            ]
        };
    };

    const generateAdminResponse = (message: string) => {
        if (message.toLowerCase().includes('student')) {
            return 'You can manage students in the Students section. Would you like to see student statistics?';
        }
        if (message.toLowerCase().includes('maintenance')) {
            return 'You can view and manage maintenance requests in the Maintenance section. Need to see pending requests?';
        }
        return 'How can I assist you with hostel management today?';
    };

    const sendMessage = async (text: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        await saveChatMessage(userMessage);

        setIsTyping(true);
        setTimeout(async () => {
            const response = user?.role === 'admin' 
                ? generateAdminResponse(text)
                : generateResponse(text);
            setMessages(prev => [...prev, response]);
            await saveChatMessage(response);
            setIsTyping(false);
        }, Math.random() * 1000 + 500); // Random delay between 500-1500ms
    };

    const searchMessages = (query: string): Message[] => {
        const searchTerm = query.toLowerCase();
        return messages.filter(message => 
            message.text.toLowerCase().includes(searchTerm)
        );
    };

    const exportChat = async () => {
        try {
            const chatHistory = messages.map(msg => ({
                sender: msg.sender,
                message: msg.text,
                timestamp: msg.timestamp.toLocaleString()
            }));

            const csvContent = [
                ['Sender', 'Message', 'Timestamp'],
                ...chatHistory.map(msg => [msg.sender, msg.message, msg.timestamp])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-history-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting chat:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            // Delete from database
            const { error } = await supabase
                .from('chat_history')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setMessages(prev => prev.filter(msg => msg.id !== id));
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const getSuggestedReplies = (): QuickReply[] => {
        const role = user?.role;
        const basePath = role === 'admin' ? '/admin-dashboard' : '/student-dashboard';

        const commonReplies = [
            {
                text: "Go to Dashboard",
                action: () => navigate(basePath)
            }
        ];

        if (role === 'student') {
            return [
                ...commonReplies,
                {
                    text: "Submit Maintenance Request",
                    action: () => navigate(`${basePath}/maintenance`)
                },
                {
                    text: "View Room Details",
                    action: () => navigate(`${basePath}/room`)
                },
                {
                    text: "Check Bills",
                    action: () => navigate(`${basePath}/billing`)
                }
            ];
        } else {
            return [
                ...commonReplies,
                {
                    text: "View Maintenance Requests",
                    action: () => navigate(`${basePath}/maintenance`)
                },
                {
                    text: "Manage Rooms",
                    action: () => navigate(`${basePath}/rooms`)
                },
                {
                    text: "Manage Bills",
                    action: () => navigate(`${basePath}/billing`)
                }
            ];
        }
    };

    return (
        <ChatBotContext.Provider value={{ 
            messages, 
            sendMessage, 
            isOpen, 
            toggleChat, 
            handleAction,
            isTyping,
            searchMessages,
            exportChat,
            deleteMessage,
            getSuggestedReplies,
            addReaction,
            markMessageHelpful
        }}>
            {children}
        </ChatBotContext.Provider>
    );
} 