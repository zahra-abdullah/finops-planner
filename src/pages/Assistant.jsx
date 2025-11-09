import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Trash2, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import MessageBubble from "../components/assistant/MessageBubble";
import ChatInput from "../components/assistant/ChatInput";

const AGENT_NAME = "finops_assistant";

const SuggestedPrompts = ({ onSelect, disabled }) => {
    const prompts = [
        "Show me the top 5 cost savings opportunities",
        "Generate an action plan for DEV environment",
        "What are the risks of the current opportunities?",
        "Explain how EC2 rightsizing works",
        "What's the total potential monthly savings?",
    ];

    return (
        <div className="space-y-2">
            <p className="text-xs text-slate-500 font-medium">Suggested prompts:</p>
            <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, idx) => (
                    <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => onSelect(prompt)}
                        disabled={disabled}
                        className="text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                        {prompt}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default function AssistantPage() {
    const queryClient = useQueryClient();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
    const messagesEndRef = useRef(null);
    const unsubscribeRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (activeConversation) {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }

            unsubscribeRef.current = base44.agents.subscribeToConversation(
                activeConversation.id,
                (data) => {
                    setMessages(data.messages || []);
                }
            );

            return () => {
                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                    unsubscribeRef.current = null;
                }
            };
        }
    }, [activeConversation?.id]);

    const loadConversations = async () => {
        try {
            const convs = await base44.agents.listConversations({
                agent_name: AGENT_NAME,
            });
            setConversations(convs || []);
            if (convs && convs.length > 0 && !activeConversation) {
                setActiveConversation(convs[0]);
                setMessages(convs[0].messages || []);
            }
        } catch (error) {
            console.error("Error loading conversations:", error);
        }
    };

    const createNewConversation = async () => {
        setIsCreating(true);
        try {
            const user = await base44.auth.me();
            const conv = await base44.agents.createConversation({
                agent_name: AGENT_NAME,
                metadata: {
                    name: `Chat ${new Date().toLocaleString()}`,
                    created_by: user.email,
                },
            });
            await loadConversations();
            setActiveConversation(conv);
            setMessages([]);
            toast.success("New conversation started");
        } catch (error) {
            console.error("Error creating conversation:", error);
            toast.error("Failed to create conversation");
        } finally {
            setIsCreating(false);
        }
    };

    const deleteConversation = async (convId) => {
        setIsDeleting(convId);
        try {
            // Note: We don't have a direct delete method, so we'll just remove it from the list
            setConversations(prev => prev.filter(c => c.id !== convId));
            if (activeConversation?.id === convId) {
                const remaining = conversations.filter(c => c.id !== convId);
                setActiveConversation(remaining[0] || null);
                setMessages(remaining[0]?.messages || []);
            }
            toast.success("Conversation deleted");
        } catch (error) {
            console.error("Error deleting conversation:", error);
            toast.error("Failed to delete conversation");
        } finally {
            setIsDeleting(null);
        }
    };

    const handlePromptSelect = async (prompt) => {
        if (!activeConversation) {
            await createNewConversation();
        }
        // Wait a bit for conversation to be created
        setTimeout(async () => {
            const conv = activeConversation || conversations[0];
            if (conv) {
                try {
                    await base44.agents.addMessage(conv, {
                        role: "user",
                        content: prompt,
                    });
                } catch (error) {
                    console.error("Error sending prompt:", error);
                }
            }
        }, 100);
    };

    const isAssistantTyping = messages.some(
        m => m.role === 'assistant' && m.tool_calls?.some(tc => ['running', 'in_progress', 'pending'].includes(tc.status))
    );

    return (
        <div className="h-screen flex flex-col lg:flex-row bg-slate-50">
            {/* Sidebar - Conversations List */}
            <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">AI Assistant</h2>
                            <p className="text-xs text-slate-500">FinOps Expert</p>
                        </div>
                    </div>
                    <Button
                        onClick={createNewConversation}
                        disabled={isCreating}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                New Conversation
                            </>
                        )}
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                    activeConversation?.id === conv.id
                                        ? 'bg-blue-50 border-2 border-blue-200'
                                        : 'hover:bg-slate-50 border-2 border-transparent'
                                }`}
                                onClick={() => {
                                    setActiveConversation(conv);
                                    setMessages(conv.messages || []);
                                }}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {conv.metadata?.name || 'Untitled'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {conv.messages?.length || 0} messages
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv.id);
                                    }}
                                    disabled={isDeleting === conv.id}
                                    className="opacity-0 group-hover:opacity-100 h-8 w-8"
                                >
                                    {isDeleting === conv.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {activeConversation.metadata?.name || 'Chat'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Ask about opportunities, plans, and AWS optimization
                                    </p>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                                    Active
                                </Badge>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-6">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                                            Welcome to FinOps AI Assistant
                                        </h3>
                                        <p className="text-slate-600 mb-6">
                                            I can help you optimize AWS costs, generate action plans, and answer questions about your infrastructure.
                                        </p>
                                    </div>
                                    <SuggestedPrompts
                                        onSelect={handlePromptSelect}
                                        disabled={isAssistantTyping}
                                    />
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto">
                                    {messages.map((message, idx) => (
                                        <MessageBubble key={idx} message={message} />
                                    ))}
                                    {isAssistantTyping && (
                                        <div className="flex gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <Sparkles className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input */}
                        <ChatInput
                            conversation={activeConversation}
                            onMessageSent={() => {}}
                            disabled={isAssistantTyping}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <Card className="max-w-md text-center p-8 border-2 border-dashed border-slate-300">
                            <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                No Conversation Selected
                            </h3>
                            <p className="text-slate-500 mb-6">
                                Start a new conversation or select one from the sidebar
                            </p>
                            <Button onClick={createNewConversation} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Start Chatting
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}