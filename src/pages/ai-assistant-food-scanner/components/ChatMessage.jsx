import React from 'react';
import Icon from '../../../components/AppIcon';

// Access the API key from environment variable
const CHATBOT_API_KEY = import.meta.env.VITE_CHATBOT_API_KEY;

const ChatMessage = ({ message, isUser, timestamp, isTyping = false }) => {
  // You can use CHATBOT_API_KEY in your API calls
  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isTyping) {
    return (
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="Bot" size={16} color="white" />
        </div>
        <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-xs lg:max-w-md">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-success' : 'bg-primary'
      }`}>
        <Icon name={isUser ? 'User' : 'Bot'} size={16} color="white" />
      </div>
      
      <div className="flex flex-col max-w-xs lg:max-w-md">
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-md' 
            : 'bg-muted text-muted-foreground rounded-tl-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <span className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;