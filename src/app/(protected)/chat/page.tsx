'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      '¡Hola! Soy tu asistente financiero de MyMoney. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre tus gastos, darte consejos de ahorro o ayudarte a planificar tu presupuesto.',
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulated response for now
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Gracias por tu mensaje. Esta funcionalidad de IA estará disponible próximamente para ayudarte con tus finanzas personales.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className='flex flex-col h-[calc(100vh-3.5rem)]'>
      {/* Header */}
      <div className='p-6 border-b border-border'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow'>
            <MessageCircle className='w-6 h-6 text-primary-foreground' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Chat Financiero</h1>
            <p className='text-muted-foreground'>
              Tu asistente personal de finanzas
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-auto p-6'>
        <div className='max-w-3xl mx-auto space-y-6'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  message.role === 'user' ? 'gradient-gold' : 'gradient-primary'
                )}
              >
                {message.role === 'user' ? (
                  <User className='w-5 h-5 text-secondary-foreground' />
                ) : (
                  <Bot className='w-5 h-5 text-primary-foreground' />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl p-4',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'glass-card rounded-tl-none'
                )}
              >
                <p className='text-sm leading-relaxed'>{message.content}</p>
                <span
                  className={cn(
                    'text-xs mt-2 block',
                    message.role === 'user'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
                  {message.timestamp.toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className='flex gap-3'>
              <div className='w-10 h-10 rounded-xl gradient-primary flex items-center justify-center'>
                <Bot className='w-5 h-5 text-primary-foreground' />
              </div>
              <div className='glass-card rounded-2xl rounded-tl-none p-4'>
                <div className='flex gap-1'>
                  <span
                    className='w-2 h-2 rounded-full bg-muted-foreground animate-bounce'
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className='w-2 h-2 rounded-full bg-muted-foreground animate-bounce'
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className='w-2 h-2 rounded-full bg-muted-foreground animate-bounce'
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className='p-6 border-t border-border bg-background'>
        <div className='max-w-3xl mx-auto flex gap-3'>
          <Input
            placeholder='Escribe tu mensaje...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className='flex-1'
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            variant='hero'
          >
            <Send className='w-5 h-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
