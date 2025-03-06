import React from 'react';
import { useChatBot } from '../../context/ChatBotContext';
import { HiPaperAirplane } from 'react-icons/hi';

const ChatBot: React.FC = () => {
    const { messages, sendMessage, isTyping } = useChatBot();
    const [input, setInput] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Chat Assistant</h1>
                
                <div className="bg-white rounded-lg shadow-lg">
                    {/* Chat Messages */}
                    <div className="h-[600px] overflow-y-auto p-6 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                                } mb-4`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                        message.sender === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-gray-200 rounded-lg p-3">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <span>Send</span>
                                <HiPaperAirplane className="w-4 h-4 transform rotate-90" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatBot; 