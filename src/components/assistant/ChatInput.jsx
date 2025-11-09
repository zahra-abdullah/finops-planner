import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ChatInput({ conversation, onMessageSent, disabled }) {
    const [input, setInput] = useState("");
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    return { name: file.name, url: file_url };
                })
            );
            setAttachedFiles(prev => [...prev, ...uploadedFiles]);
            toast.success(`${files.length} file(s) uploaded`);
        } catch (error) {
            console.error("Error uploading files:", error);
            toast.error("Failed to upload files");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() && attachedFiles.length === 0) return;
        if (disabled) return;

        const messageContent = input.trim();
        const fileUrls = attachedFiles.map(f => f.url);

        setInput("");
        setAttachedFiles([]);

        try {
            await base44.agents.addMessage(conversation, {
                role: "user",
                content: messageContent,
                ...(fileUrls.length > 0 && { file_urls: fileUrls })
            });
            onMessageSent?.();
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border-t border-slate-200 p-4">
            {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm"
                        >
                            <Paperclip className="w-3 h-3 text-blue-600" />
                            <span className="text-blue-800 font-medium truncate max-w-[200px]">
                                {file.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-2 items-end">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.csv,.json"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="flex-shrink-0"
                >
                    <Paperclip className="w-4 h-4" />
                </Button>
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about opportunities, generate plans, or get AWS insights..."
                    disabled={disabled}
                    className="resize-none min-h-[44px] max-h-[200px]"
                    rows={1}
                />
                <Button
                    type="submit"
                    disabled={disabled || (!input.trim() && attachedFiles.length === 0)}
                    className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                Press Enter to send, Shift+Enter for new line
            </p>
        </form>
    );
}