
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { patientChat } from '@/ai/flows/patient-chat-flow';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'model' | 'system';
  text: string;
};

const INITIAL_MESSAGE: Message = { 
  role: 'model', 
  text: '¡Hola! Soy el asistente virtual de Oralab. Para ayudarte con tu preparación, ¿podrías indicarme tu nombre completo para revisar tu reserva?' 
};

export function PrepChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isLoading]);

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    setIsLoading(false);
  };

  const toggleChat = () => {
    if (isOpen) {
      // AL CERRAR: Reseteamos la conversación por completo por privacidad
      resetChat();
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const currentHistory = [...messages];
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await patientChat({
        history: currentHistory,
        message: userMsg
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Lo sentimos, hubo un problema al procesar tu solicitud. Por favor intenta de nuevo en unos momentos o escríbenos a WhatsApp (+56 9 3685 0468).' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-2xl border-primary/20 flex flex-col overflow-hidden rounded-[2rem] bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-primary text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Sparkles className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black italic">Asistente Oralab</CardTitle>
                      <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Soporte al Paciente</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={resetChat} className="text-white hover:bg-white/10 rounded-full h-8 w-8" title="Reiniciar chat">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                          msg.role === 'user' 
                            ? "bg-primary text-white rounded-tr-none" 
                            : "bg-white text-primary border border-primary/5 rounded-tl-none font-medium leading-relaxed"
                        )}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-primary/5 flex gap-1">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-4 bg-white border-t">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex w-full gap-2"
                >
                  <Input 
                    placeholder="Escribe tu consulta..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="rounded-full border-primary/10 h-10 focus:ring-primary"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full shrink-0 bg-primary hover:bg-secondary transition-colors">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={toggleChat}
        className={cn(
          "rounded-full h-14 w-14 shadow-2xl transition-all duration-300 hover:scale-110",
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-secondary shadow-primary/20"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>
    </div>
  );
}
