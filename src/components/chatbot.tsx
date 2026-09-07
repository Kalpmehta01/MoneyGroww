import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your financial assistant. I can help you with investment tips, explain financial concepts, or guide you through our calculators. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');

  const financialTips = [
    "Start investing early to benefit from compound interest",
    "Diversify your portfolio across different asset classes",
    "Keep an emergency fund equal to 6-12 months of expenses",
    "Review and rebalance your portfolio regularly",
    "Don't try to time the market - invest consistently",
    "Understand the fees and charges of your investments",
    "Set clear financial goals and invest accordingly",
    "Consider tax-saving investment options"
  ];

  const quickSuggestions = [
    "How does SIP work?",
    "What is compound interest?",
    "Best investment for beginners?",
    "How to calculate EMI?",
    "Tax saving investments",
    "Emergency fund planning"
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Great to see you're interested in managing your finances better. What would you like to learn about today? 💼";
    } else if (lowerMessage.includes('sip')) {
      return "SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly in mutual funds. It helps in rupee cost averaging and building discipline. Use our SIP calculator to see how your investments can grow! 📈";
    } else if (lowerMessage.includes('compound')) {
      return "Compound interest is the eighth wonder of the world! 🌟 It's when you earn returns not just on your principal amount, but also on the previously earned returns. The earlier you start, the more powerful it becomes.";
    } else if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
      return "For beginners, I recommend starting with SIPs in diversified equity mutual funds. Begin with a small amount you're comfortable with, and gradually increase. Our calculators can help you plan your investments! 🚀";
    } else if (lowerMessage.includes('emi')) {
      return "EMI (Equated Monthly Installment) is the fixed amount you pay every month for a loan. It includes both principal and interest. Use our EMI calculator to determine your monthly payment and total interest. 🏠";
    } else if (lowerMessage.includes('tax')) {
      return "Tax-saving investments under Section 80C include ELSS mutual funds, PPF, EPF, and tax-saving FDs. ELSS funds have the shortest lock-in period of 3 years and potential for higher returns. 💰";
    } else if (lowerMessage.includes('emergency')) {
      return "An emergency fund should cover 6-12 months of your expenses. Keep it in easily accessible instruments like savings accounts or liquid funds. This protects your long-term investments from unexpected expenses. 🛡️";
    } else if (lowerMessage.includes('mutual fund')) {
      return "Mutual funds pool money from many investors to buy a diversified portfolio of stocks, bonds, or other securities. They're professionally managed and offer instant diversification. Perfect for beginners! 📊";
    } else if (lowerMessage.includes('goal') || lowerMessage.includes('planning')) {
      return "Financial planning starts with setting clear goals! Whether it's buying a house, children's education, or retirement - having specific targets helps you invest better. What's your primary financial goal? 🎯";
    } else if (lowerMessage.includes('risk')) {
      return "Every investment carries some risk, but the key is understanding and managing it. Diversification, proper asset allocation, and long-term thinking help reduce risks significantly. 📉📈";
    } else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
      return "You're welcome! I'm here whenever you need financial guidance. Remember, small steps today lead to big results tomorrow! 😊";
    } else {
      const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];
      return `Here's a helpful tip: ${randomTip} 💡 Feel free to ask me specific questions about investments, calculators, or financial planning!`;
    }
  };

  // Typing animation effect
  const typeMessage = (text: string, callback: () => void) => {
    setIsTyping(true);
    setTypingText('');
    
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        callback();
      }
    }, 30);
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const scrollElement = document.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const inputElement = document.querySelector('#chat-input') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 200);
    }
  }, [isOpen]);

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Show typing indicator and then bot response
    setTimeout(() => {
      const responseText = getBotResponse(textToSend);
      
      typeMessage(responseText, () => {
        const botResponse: Message = {
          id: Date.now() + 1,
          text: responseText,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        setTypingText('');
      });
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg transition-all duration-300 hover:shadow-xl"
          size="icon"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </motion.div>
          </AnimatePresence>
        </Button>
        
        {/* Notification Badge */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xs text-white">1</span>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50"
          >
            <Card className="w-80 h-96 shadow-xl flex flex-col backdrop-blur-sm bg-background/95 border border-border/50">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: isTyping ? 360 : 0 }}
                      transition={{ duration: 1, repeat: isTyping ? Infinity : 0, ease: "linear" }}
                    >
                      <Bot className="h-5 w-5 text-blue-600" />
                    </motion.div>
                    <span className="text-lg">Financial Assistant</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 py-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`max-w-xs p-3 rounded-2xl shadow-sm ${
                              message.isBot
                                ? 'bg-muted/80 text-muted-foreground rounded-bl-sm'
                                : 'bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-br-sm'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.isBot && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />}
                              <p className="text-sm leading-relaxed">{message.text}</p>
                              {!message.isBot && <User className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />}
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-xs p-3 rounded-2xl rounded-bl-sm bg-muted/80 text-muted-foreground shadow-sm">
                          <div className="flex items-start space-x-2">
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                            <div className="text-sm leading-relaxed">
                              {typingText}
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="inline-block w-2 h-4 bg-current ml-1"
                              >
                                |
                              </motion.span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Quick Suggestions */}
                <AnimatePresence>
                  {messages.length === 1 && !isTyping && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-3 border-b border-border/50"
                    >
                      <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                      <div className="flex flex-wrap gap-1">
                        {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 px-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                              onClick={() => handleSendMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="p-4">
                  <div className="flex space-x-2">
                    <Input
                      id="chat-input"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me anything about finance..."
                      className="text-sm border-muted-foreground/20 focus:border-blue-400 transition-colors"
                      disabled={isTyping}
                    />
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={() => handleSendMessage()}
                        size="icon"
                        className="h-9 w-9 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-200"
                        disabled={isTyping || !inputMessage.trim()}
                      >
                        {isTyping ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}