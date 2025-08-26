'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askAi } from '@/ai/flows/ask-ai-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Bot, User, Paperclip, Mic, CornerDownLeft, File as FileIcon, X } from 'lucide-react';
import { MOCK_DATA } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  question: z.string().min(1, {
    message: 'Question cannot be empty.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type ConversationEntry = {
  role: 'user' | 'ai';
  content: string;
  fileName?: string;
};

// Extend the window object to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function AskAiPage() {
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          variant: 'destructive',
          title: 'Speech Recognition Error',
          description: event.error,
        });
        setIsRecording(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        form.setValue('question', transcript);
      };
    }
  }, [form, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        // Limit file size to 10MB
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File Too Large",
                description: "Please select a file smaller than 10MB.",
            });
            return;
        }
      setFile(selectedFile);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const userMessage: ConversationEntry = { 
      role: 'user', 
      content: values.question,
      fileName: file?.name
    };
    setConversation((prev) => [...prev, userMessage]);
    form.reset();

    try {
      let fileDataUri: string | undefined = undefined;
      if (file) {
        fileDataUri = await fileToDataUri(file);
        setFile(null); // Clear file after processing
      }

      const response = await askAi({
        question: values.question,
        dailyData: JSON.stringify(MOCK_DATA.dailyData.slice(0, 365)),
        monthlyData: JSON.stringify(MOCK_DATA.monthlyData),
        file: fileDataUri,
      });

      const aiMessage = { role: 'ai' as const, content: response };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage = {
        role: 'ai' as const,
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
         toast({
            variant: "destructive",
            title: "Browser Not Supported",
            description: "Speech recognition is not supported in your browser.",
        });
        return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader>
            <CardTitle>Ask AI</CardTitle>
            <CardDescription>
              Ask questions about your data. You can also upload a file or use your voice.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-8">
            <div className="space-y-6">
              {conversation.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 ${
                    entry.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {entry.role === 'ai' && (
                    <div className="bg-primary rounded-full p-2 text-primary-foreground">
                      <Bot className="h-6 w-6" />
                    </div>
                  )}
                  <div
                    className={`max-w-md rounded-lg p-3 ${
                      entry.role === 'user' ? 'bg-muted' : 'bg-card border'
                    }`}
                  >
                    {entry.fileName && (
                         <div className="mb-2 flex items-center gap-2 rounded-md border p-2 bg-background">
                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{entry.fileName}</span>
                        </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                  </div>
                  {entry.role === 'user' && (
                    <div className="bg-muted rounded-full p-2">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="bg-primary rounded-full p-2 text-primary-foreground">
                    <Bot className="h-6 w-6 animate-pulse" />
                  </div>
                  <div className="max-w-md rounded-lg p-3 bg-card border">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full"
              >
                <div className="relative">
                  {file && (
                     <div className="absolute bottom-14 left-2 flex items-center gap-2 rounded-md border p-2 bg-background shadow-sm">
                        <FileIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm">{file.name}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => setFile(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                            <Input
                                placeholder="e.g., What was the total revenue last month?"
                                className="pr-28"
                                {...field}
                                disabled={isLoading}
                             />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center gap-1">
                     <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                     />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        title="Attach file"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button
                        type="button"
                        variant={isRecording ? 'destructive' : 'ghost'}
                        size="icon"
                        onClick={toggleRecording}
                        disabled={isLoading}
                        title={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        <Mic className="h-5 w-5" />
                    </Button>
                     <Button type="submit" size="icon" disabled={isLoading} title="Send">
                        <CornerDownLeft className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
