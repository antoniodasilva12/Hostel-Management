import React, { useRef, useEffect } from 'react';
import { useChatBot } from '../../context/ChatBotContext';
import { HiPaperAirplane, HiOutlineChatAlt2 } from 'react-icons/hi';

const AdminChat = () => {
    const { messages, sendMessage, isTyping } = useChatBot();
    const [inputMessage, setInputMessage] = React.useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
        }
    };

    return (
        <div className="h-full bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg h-[calc(100vh-140px)] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center">
                        <HiOutlineChatAlt2 className="h-6 w-6 text-indigo-600 mr-3" />
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">Admin Chat Assistant</h1>
                            <p className="text-sm text-gray-500">Get help with hostel management tasks</p>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-4 ${
                                    message.sender === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                <p className="text-sm">{message.text}</p>
                                <span className={`text-xs mt-1 block ${
                                    message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                                }`}>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-4">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Type your message here..."
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                        >
                            <HiPaperAirplane className="h-5 w-5 rotate-90" />
                            <span className="ml-2">Send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminChat; 