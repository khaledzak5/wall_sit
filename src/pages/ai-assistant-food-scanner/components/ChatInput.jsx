import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message?.trim() && !disabled) {
      onSendMessage(message?.trim());
      setMessage('');
      if (textareaRef?.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e?.target?.value);
    // Auto-resize textarea
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef?.current?.scrollHeight, 120)}px`;
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const quickPrompts = [
    "Create a workout plan for beginners",
    "What should I eat post-workout?",
    "How to improve my form?",
    "Suggest healthy meal prep ideas"
  ];

  const handleQuickPrompt = (prompt) => {
    if (!disabled) {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      {/* Quick Prompts */}
      <div className="mb-3 flex flex-wrap gap-2">
        {quickPrompts?.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleQuickPrompt(prompt)}
            disabled={disabled}
            className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about fitness, nutrition, or workouts..."
            disabled={disabled}
            className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-[120px]"
            rows={1}
          />
          
          {/* Voice Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 ${
              isRecording ? 'text-error animate-pulse' : 'text-muted-foreground'
            }`}
          >
            <Icon name={isRecording ? 'MicOff' : 'Mic'} size={16} />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!message?.trim() || disabled}
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          <Icon name="Send" size={18} />
        </Button>
      </form>
      {/* Recording Indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center space-x-2 text-error text-sm">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
          <span>Recording... Tap to stop</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;