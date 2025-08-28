import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export function AiChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);

  const chatMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string, context: any }) => {
      const response = await apiRequest("POST", "/api/ai/chat", { message, context });
      return response.json();
    },
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: data.response, timestamp: new Date() }
      ]);
      setMessage("");
    },
    onError: (error) => {
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: "I'm experiencing technical difficulties. Please try again later.", timestamp: new Date() }
      ]);
      setMessage("");
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;

    const context = {
      userId: user?.id,
      practiceId: user?.practiceId,
      timestamp: new Date().toISOString()
    };

    chatMutation.mutate({ message, context });
  };

  const suggestedMessages = [
    "Show me today's schedule overview",
    "Which patients need insurance verification?",
    "Help me with appointment scheduling"
  ];

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-lg font-semibold text-foreground">AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="ai-chat-messages">
          {chatHistory.length === 0 ? (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-foreground">
                Hello! I'm your AI assistant. I can help you with scheduling, patient management, 
                insurance verification, and practice analytics. How can I assist you today?
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary/10 text-primary ml-4'
                    : 'bg-muted text-foreground'
                }`}
                data-testid={`chat-message-${index}`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            ))
          )}
          {chatMutation.isPending && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Actions */}
        {chatHistory.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
            <div className="space-y-1">
              {suggestedMessages.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessage(suggestion)}
                  className="w-full text-left justify-start text-xs h-auto py-2"
                  data-testid={`suggested-message-${index}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask AI assistant..."
            disabled={chatMutation.isPending}
            className="flex-1 text-sm"
            data-testid="ai-chat-input"
          />
          <Button
            type="submit"
            disabled={chatMutation.isPending || !message.trim()}
            size="sm"
            className="px-3"
            data-testid="ai-chat-send"
          >
            {chatMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
