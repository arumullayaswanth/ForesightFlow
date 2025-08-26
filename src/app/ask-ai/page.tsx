'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { askAi } from '@/ai/flows/ask-ai-flow';
import { generateContent, GenerateContentOutput } from '@/ai/flows/generate-content-flow';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, User, Paperclip, Mic, CornerDownLeft, File as FileIcon, X, Download, Image as ImageIcon } from 'lucide-react';
import { MOCK_DATA } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt cannot be empty.' }),
});

type FormValues = z.infer<typeof formSchema>;

type ConversationEntry = {
  role: 'user' | 'ai';
  content: string;
  file?: {
    uri: string;
    name: string;
    type: 'image' | 'pdf' | 'docx';
  };
  userFileInfo?: {
    name: string;
  };
};

// Extend the window object to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function AskAiPage() {
  const [activeTab, setActiveTab] = useState('ask');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '' },
  });

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
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
        form.setValue('prompt', event.results[0][0].transcript);
      };
    }
  }, [form, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
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
      content: values.prompt,
      userFileInfo: file ? { name: file.name } : undefined,
    };
    setConversation((prev) => [...prev, userMessage]);
    form.reset();

    try {
      if (activeTab === 'ask') {
        await handleAsk(values.prompt);
      } else {
        await handleGenerate(values.prompt);
      }
    } catch (error) {
      console.error('Error with AI:', error);
      const errorMessage = {
        role: 'ai' as const,
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  const handleAsk = async (question: string) => {
    let fileDataUri: string | undefined = undefined;
    if (file) {
      fileDataUri = await fileToDataUri(file);
    }
    const response = await askAi({
      question: question,
      dailyData: JSON.stringify(MOCK_DATA.dailyData.slice(-365)),
      monthlyData: JSON.stringify(MOCK_DATA.monthlyData),
      file: fileDataUri,
    });
    const aiMessage = { role: 'ai' as const, content: response };
    setConversation((prev) => [...prev, aiMessage]);
  };

  const handleGenerate = async (request: string) => {
    const response: GenerateContentOutput = await generateContent({ request });
    const aiMessage: ConversationEntry = {
      role: 'ai',
      content: `I've generated the ${response.type} you requested.`,
      file: {
        uri: response.fileDataUri,
        name: response.fileName,
        type: response.type,
      },
    };
    setConversation((prev) => [...prev, aiMessage]);
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Card className="h-[80vh] flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>AI Assistant</CardTitle>
                <TabsList>
                    <TabsTrigger value="ask">Ask a Question</TabsTrigger>
                    <TabsTrigger value="generate">Generate Content</TabsTrigger>
                </TabsList>
            </CardHeader>
            <TabsContent value="ask" className="flex-1 overflow-hidden" asChild>
                <CardContent className="flex-1 overflow-y-auto pr-8 h-full">
                     <div className="space-y-6">
                        {conversation.map((entry, index) => (
                            <div key={index} className={`flex items-start gap-4 ${entry.role === 'user' ? 'justify-end' : ''}`}>
                                {entry.role === 'ai' && <div className="bg-primary rounded-full p-2 text-primary-foreground"><Bot className="h-6 w-6" /></div>}
                                <div className={`max-w-xl rounded-lg p-3 ${entry.role === 'user' ? 'bg-muted' : 'bg-card border'}`}>
                                    {entry.userFileInfo && <div className="mb-2 flex items-center gap-2 rounded-md border p-2 bg-background"><FileIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">{entry.userFileInfo.name}</span></div>}
                                    <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                                </div>
                                {entry.role === 'user' && <div className="bg-muted rounded-full p-2"><User className="h-6 w-6" /></div>}
                            </div>
                        ))}
                        {isLoading && <div className="flex items-start gap-4"><div className="bg-primary rounded-full p-2 text-primary-foreground"><Bot className="h-6 w-6 animate-pulse" /></div><div className="max-w-md rounded-lg p-3 bg-card border"><p className="text-sm">Thinking...</p></div></div>}
                    </div>
                </CardContent>
             </TabsContent>
            <TabsContent value="generate" className="flex-1 overflow-hidden" asChild>
                <CardContent className="flex-1 overflow-y-auto pr-8 h-full">
                    <div className="space-y-6">
                        {conversation.map((entry, index) => (
                            <div key={index} className={`flex items-start gap-4 ${entry.role === 'user' ? 'justify-end' : ''}`}>
                                {entry.role === 'ai' && <div className="bg-primary rounded-full p-2 text-primary-foreground"><Bot className="h-6 w-6" /></div>}
                                <div className={`max-w-xl rounded-lg p-3 ${entry.role === 'user' ? 'bg-muted' : 'bg-card border'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                                    {entry.file && (
                                        <div className="mt-2">
                                            {entry.file.type === 'image' ? (
                                                <div className='relative w-64 h-64'>
                                                    <Image src={entry.file.uri} alt="Generated image" layout="fill" objectFit="contain" />
                                                </div>
                                            ) : null}
                                            <a href={entry.file.uri} download={entry.file.name}>
                                                <Button variant="outline" className="mt-2">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download {entry.file.name}
                                                </Button>
                                            </a>
                                        </div>
                                    )}
                                </div>
                                {entry.role === 'user' && <div className="bg-muted rounded-full p-2"><User className="h-6 w-6" /></div>}
                            </div>
                        ))}
                         {isLoading && <div className="flex items-start gap-4"><div className="bg-primary rounded-full p-2 text-primary-foreground"><Bot className="h-6 w-6 animate-pulse" /></div><div className="max-w-md rounded-lg p-3 bg-card border"><p className="text-sm">Generating...</p></div></div>}
                    </div>
                </CardContent>
            </TabsContent>
            <CardFooter className="border-t pt-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                    <div className="relative">
                    {file && activeTab === 'ask' && (
                        <div className="absolute bottom-14 left-2 flex items-center gap-2 rounded-md border p-2 bg-background shadow-sm">
                            <FileIcon className="h-4 w-4 text-primary" /><span className="text-sm">{file.name}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button>
                        </div>
                    )}
                    <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder={activeTab === 'ask' ? 'e.g., What was the total revenue last month?' : 'e.g., Generate an image of a futuristic city'}
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
                        {activeTab === 'ask' &&
                            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} title="Attach file"><Paperclip className="h-5 w-5" /></Button>
                        }
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                        <Button type="button" variant={isRecording ? 'destructive' : 'ghost'} size="icon" onClick={toggleRecording} disabled={isLoading} title={isRecording ? 'Stop recording' : 'Start recording'}><Mic className="h-5 w-5" /></Button>
                        <Button type="submit" size="icon" disabled={isLoading} title="Send"><CornerDownLeft className="h-5 w-5" /></Button>
                    </div>
                    </div>
                </form>
                </Form>
            </CardFooter>
            </Card>
        </Tabs>
      </div>
    </main>
  );
}
