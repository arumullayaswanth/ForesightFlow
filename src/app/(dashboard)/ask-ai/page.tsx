'use client';

import { useState } from 'react';
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
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User } from 'lucide-react';
import { MOCK_DATA } from '@/lib/mock-data';

const formSchema = z.object({
  question: z.string().min(10, {
    message: 'Question must be at least 10 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AskAiPage() {
  const [conversation, setConversation] = useState<
    { role: 'user' | 'ai'; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const userMessage = { role: 'user' as const, content: values.question };
    setConversation((prev) => [...prev, userMessage]);

    try {
      const response = await askAi({
        question: values.question,
        dailyData: JSON.stringify(MOCK_DATA.dailyData.slice(0, 365)), // Use last year's data for context
        monthlyData: JSON.stringify(MOCK_DATA.monthlyData),
      });

      const aiMessage = { role: 'ai' as const, content: response };
      setConversation((prev) => [...prev, aiMessage]);
      form.reset();
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
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Ask AI</CardTitle>
            <CardDescription>
              Ask questions about your data in plain English. The AI has access
              to the last year of daily data and all monthly data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
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
                    className={`rounded-lg p-3 ${
                      entry.role === 'user'
                        ? 'bg-muted'
                        : 'bg-card border'
                    }`}
                  >
                    <p className="text-sm">{entry.content}</p>
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
                    <div className="rounded-lg p-3 bg-card border">
                        <p className="text-sm">Thinking...</p>
                    </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
              >
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., What was the total revenue last month?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Asking...' : 'Ask Question'}
                </Button>
              </form>
            </Form>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
