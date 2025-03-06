export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    reactions?: MessageReaction[];
    wasHelpful?: boolean;
    actions?: {
        text: string;
        action: () => void;
    }[];
}

export interface MessageReaction {
    id: string;
    reaction: '👍' | '👎' | '❤️' | '😊' | '🤔';
    user_id: string;
} 