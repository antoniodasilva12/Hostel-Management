import React, { useRef, useEffect, useState } from 'react';
import { HiChat, HiX, HiPaperAirplane, HiMinusCircle, HiThumbUp, HiThumbDown } from 'react-icons/hi';
import { useChatBot } from '../context/ChatBotContext';

const TypingIndicator = () => (
    <div className="flex space-x-2 p-3 bg-gray-100 rounded-lg">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
);

const ChatBot: React.FC = () => {
    const { messages, sendMessage, isOpen, toggleChat, isTyping } = useChatBot();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-gray-700">
                <div className="flex items-center space-x-2">
                    <HiChat className="w-5 h-5 text-white" />
                    <h3 className="text-white font-semibold">Chat Assistant</h3>
                </div>
            </div>

            <div className="h-48 overflow-y-auto p-3 bg-gray-900">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-2 ${
                                message.sender === 'user' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-gray-700 text-gray-100'
                            }`}
                        >
                            <p className="text-sm">{message.text}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <TypingIndicator />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 bg-gray-700">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiPaperAirplane className="w-4 h-4 transform rotate-90" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBot; 