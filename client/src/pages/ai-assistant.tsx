import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, MessageCircle, FileText, Shield, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function AiAssistant() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);

  const { data: interactions = [] } = useQuery({
    queryKey: ["/api/ai/interactions"],
    queryFn: async () => {
      const response = await fetch("/api/ai/interactions", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch AI interactions");
      return response.json();
    }
  });

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
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const context = {
      userId: user?.id,
      practiceId: user?.practiceId,
      timestamp: new Date().toISOString()
    };

    chatMutation.mutate({ message, context });
  };

  const predefinedQuestions = [
    "Show me today's schedule overview",
    "Which patients need insurance verification?",
    "Generate a follow-up message template",
    "What are the pending forms that need attention?",
    "Help me optimize appointment scheduling"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center" data-testid="ai-assistant-title">
                  <Brain className="w-8 h-8 mr-3 text-primary" />
                  AI Assistant
                </h1>
                <p className="text-muted-foreground">Your intelligent practice management companion</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chat with AI Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4" data-testid="chat-messages">
                      {chatHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Brain className="w-16 h-16 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Welcome to your AI Assistant
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            I can help you with scheduling, patient management, insurance verification, and more.
                          </p>
                          <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                            {predefinedQuestions.slice(0, 3).map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => setMessage(question)}
                                className="text-left justify-start"
                                data-testid={`suggested-question-${index}`}
                              >
                                {question}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        chatHistory.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            data-testid={`chat-message-${index}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-75 mt-1">
                                {format(msg.timestamp, 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask me anything about your practice..."
                        disabled={chatMutation.isPending}
                        data-testid="chat-input"
                      />
                      <Button
                        type="submit"
                        disabled={chatMutation.isPending || !message.trim()}
                        data-testid="send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & History */}
              <div className="space-y-6">
                {/* Quick AI Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick AI Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" data-testid="action-analyze-forms">
                      <FileText className="w-4 h-4 mr-2" />
                      Analyze Pending Forms
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="action-verify-insurance">
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Insurance
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="action-optimize-schedule">
                      <Calendar className="w-4 h-4 mr-2" />
                      Optimize Schedule
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="action-generate-reports">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Reports
                    </Button>
                  </CardContent>
                </Card>

                {/* Suggested Questions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggested Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {predefinedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => setMessage(question)}
                        className="w-full text-left justify-start h-auto p-2 text-sm"
                        data-testid={`predefined-question-${index}`}
                      >
                        {question}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Interactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent AI Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {interactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent interactions
                      </p>
                    ) : (
                      <div className="space-y-3" data-testid="recent-interactions">
                        {interactions.slice(0, 5).map((interaction: any) => (
                          <div key={interaction.id} className="border-l-2 border-primary pl-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {interaction.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(interaction.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-1 line-clamp-2">
                              {interaction.prompt}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
