<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react';
=======
import { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Loader2, Sparkles, MessageSquareText, X, ChevronRight, Shield } from 'lucide-react';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
<<<<<<< HEAD
 id: number;
 text: string;
 isBot: boolean;
 timestamp: Date;
}

interface ChatSectionProps {
 onNavigateToCalculators: () => void;
}

export function ChatSection({ onNavigateToCalculators }: ChatSectionProps) {
 const [messages, setMessages] = useState<Message[]>([
 {
 id: 1,
 text: "Hello! I'm MoneyGroww's AI Financial Assistant. I'm here to help you with investment planning, financial calculations, and money management advice. What would you like to know about today?",
 isBot: true,
 timestamp: new Date()
 }
 ]);
 const [inputMessage, setInputMessage] = useState('');
 const [isTyping, setIsTyping] = useState(false);
 const [typingText, setTypingText] = useState('');



 const quickSuggestions = [
"How does compound interest work?",
"Best investment options for beginners",
"How to build an emergency fund?",
"Tax saving investment strategies",
"When should I start investing?",
"How to diversify my portfolio?",
"What is the 50-30-20 rule?",
"How to calculate retirement corpus?"
 ];

 const getBotResponse = (userMessage: string): string => {
 const lowerMessage = userMessage.toLowerCase();

 if (/\b(hello|hi|hey)\b/.test(lowerMessage)) {
 return "Hello! Great to see you're taking charge of your financial future! I can help you with investment strategies, financial planning, calculator usage, and much more. What specific topic would you like to explore?";
 } else if (lowerMessage.includes('sip')) {
 return "SIP (Systematic Investment Plan) is a fantastic way to build wealth!\n\nKey benefits:\n• Rupee cost averaging reduces market volatility impact\n• Disciplined investing builds long-term wealth\n• Start with as little as ₹500 per month\n• Power of compounding works in your favor\n\nWould you like me to guide you to our SIP calculator to see potential returns?";
 } else if (lowerMessage.includes('compound')) {
 return "Compound interest is truly the eighth wonder of the world!\n\nHere's how it works:\n• You earn returns on your initial investment\n• You also earn returns on previous returns\n• Time is your biggest ally - start early!\n• Even small amounts can grow significantly\n\nExample: ₹5,000 monthly SIP at 12% for 20 years = ₹49.9 lakhs (you invest only ₹12 lakhs)!";
 } else if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
 return "Perfect time to start your investment journey!\n\nBeginner-friendly steps:\n1. Build emergency fund (6-12 months expenses)\n2. Start SIP in diversified equity mutual funds\n3. Begin with amount you're comfortable with\n4. Increase SIP by 10-15% annually\n5. Stay invested for long term (5+ years)\n\nRecommended allocation:\n• 70% Equity funds (growth)\n• 20% Debt funds (stability)\n• 10% Gold/REIT (diversification)";
 } else if (lowerMessage.includes('emi')) {
 return "EMI planning is crucial for healthy finances!\n\nKey points:\n• EMI should not exceed 40% of monthly income\n• Choose appropriate tenure (longer = lower EMI, higher interest)\n• Compare interest rates from different lenders\n• Consider prepayment options\n\nOur EMI calculator can help you:\n• Calculate monthly payments\n• Compare different loan options\n• Plan prepayment strategies\n\nWould you like to try our EMI calculator?";
 } else if (lowerMessage.includes('tax')) {
 return "Smart tax planning can boost your wealth!\n\nSection 80C options (₹1.5L limit):\n• ELSS Mutual Funds (3-year lock, growth potential)\n• PPF (15-year lock, tax-free returns)\n• EPF (retirement planning)\n• Tax-saving FDs (5-year lock)\n\nELSS is often preferred because:\n• Shortest lock-in period\n• Market-linked returns\n• Professional management\n• Beat inflation over time";
 } else if (lowerMessage.includes('emergency')) {
 return "Emergency fund is your financial safety net!\n\nIdeal emergency fund:\n• 6-12 months of monthly expenses\n• Keep in liquid instruments\n• Easily accessible without penalties\n\nWhere to park emergency fund:\n• Savings account (instant access)\n• Liquid mutual funds (1-day access)\n• Short-term FDs (higher returns)\n\nDon't invest emergency fund in:\n• Equity markets (volatile)\n• Long-term FDs (penalty on early withdrawal)\n• Real estate (illiquid)";
 } else if (lowerMessage.includes('goal') || lowerMessage.includes('planning')) {
 return "Goal-based investing is the key to success!\n\nStep-by-step planning:\n1. List your goals (house, education, retirement)\n2. Estimate required amount\n3. Set timeline for each goal\n4. Calculate monthly investment needed\n5. Choose appropriate investment instruments\n\nGoal timeline strategy:\n• Short-term (1-3 years): Debt funds, FDs\n• Medium-term (3-7 years): Balanced funds\n• Long-term (7+ years): Equity funds\n\nWhat's your primary financial goal? I can help you plan for it!";
 } else if (lowerMessage.includes('mutual fund')) {
 return "Mutual funds are excellent wealth-building tools!\n\nTypes of mutual funds:\n• Equity funds (growth potential, higher risk)\n• Debt funds (stability, lower risk)\n• Hybrid funds (balanced approach)\n• Index funds (market returns, low cost)\n\nAdvantages:\n• Professional management\n• Diversification\n• Low minimum investment\n• Liquidity\n• Transparency\n\nFor beginners, start with:\n• Large-cap funds (stability)\n• Diversified equity funds\n• SIP mode for rupee cost averaging";
 } else if (lowerMessage.includes('risk')) {
 return "Understanding and managing risk is crucial!\n\nTypes of investment risks:\n• Market risk (price fluctuations)\n• Inflation risk (reduced purchasing power)\n• Credit risk (default by borrower)\n• Liquidity risk (unable to sell quickly)\n\nRisk management strategies:\n• Diversify across asset classes\n• Don't put all eggs in one basket\n• Invest for appropriate time horizon\n• Regular portfolio review and rebalancing\n• Never invest money you need in next 5 years in equity";
 } else if (lowerMessage.includes('50-30-20') || lowerMessage.includes('rule')) {
 return "The 50-30-20 rule is a simple budgeting framework!\n\nHere's the breakdown:\n• 50% for NEEDS (rent, groceries, utilities, EMIs)\n• 30% for WANTS (entertainment, dining out, shopping)\n• 20% for SAVINGS & INVESTMENTS\n\nThe 20% savings should be further divided:\n• Emergency fund building\n• Goal-based investments\n• Retirement planning\n• Insurance premiums\n\nThis rule ensures balanced financial life while building wealth systematically!";
 } else if (lowerMessage.includes('retirement')) {
 return "Retirement planning should start early!\n\nRetirement corpus calculation:\n• Current monthly expenses × 12 × 25-30\n• Account for inflation (6-8% annually)\n• Consider healthcare costs\n\nExample: ₹50,000 monthly expenses today\n• In 30 years: ₹3.24 lakhs monthly (at 6% inflation)\n• Required corpus: ₹9.7 crores\n• Monthly SIP needed: ₹25,000 (at 12% returns)\n\nStart early to benefit from compounding! Our calculators can help you plan better.";
 } else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
 return "You're absolutely welcome! I'm here to support your financial journey. Remember:\n\n• Start early, stay consistent\n• Every small step counts\n• Focus on long-term wealth building\n• Review and adjust regularly\n\nFeel free to ask anything about investments, financial planning, or use our calculators. Your financial success is my priority!";
 } else if (lowerMessage.includes('calculator')) {
 return "Our calculators are powerful tools for financial planning!\n\nAvailable calculators:\n• SIP Calculator - Plan systematic investments\n• Mutual Fund Calculator - Lumpsum returns\n• EMI Calculator - Loan planning\n\nEach calculator provides:\n• Accurate projections\n• Visual charts for better understanding\n• Different scenarios comparison\n\nWould you like me to guide you to a specific calculator?";
 } else if (/\b(little|small)\b.*\b(amount|anount)\b/.test(lowerMessage) && lowerMessage.includes('high return')) {
 return "Aiming for high returns with a small amount requires a strategic approach!\n\nWhile higher returns naturally come with higher risk, you can maximize your small investments through:\n1. Small Cap Mutual Funds: Historically offer higher growth potential over 7+ years.\n2. Micro-SIPs: Start with just ₹100 or ₹500/month consistently.\n3. Direct Equity (Fractional Shares/Penny Stocks): High risk, requires deep research.\n\nRecommended Resources:\n• Check out our SIP Calculator to see the power of compounding on small amounts over time.\n• Read 'The Psychology of Money' for mindset strategies on small compounding.\n\n*Note: Never fall for 'get-rich-quick' schemes promising guaranteed high returns.*";
 } else {
 // Removed 'capital' to avoid false positives with cities/countries
 const financeKeywords = ['invest', 'return', 'sip', 'mutual fund', 'emi', 'loan', 'tax', 'save', 'money', 'finance', 'retirement', 'compound', 'stock', 'market', 'goal', 'budget', 'emergency', 'portfolio', 'asset', 'wealth', 'bank', 'interest', 'share', 'dividend', 'nifty', 'sensex', 'trading', 'crypto', 'amount', 'rupee'];

 const isFinanceRelated = financeKeywords.some(keyword => new RegExp(`\\b${keyword}`).test(lowerMessage));

 if (!isFinanceRelated &&!/\b(help|calculator)\b/.test(lowerMessage)) {
 return "I am MoneyGroww's specialized AI Financial Assistant. I am programmed strictly to assist with personal finance, investments, calculators, and money management. Please ask me a finance-related question!";
 }

 const responses = [
"That's an interesting question! Let me help you with that. Financial planning involves understanding your goals, risk appetite, and time horizon. What specific aspect would you like to explore?",
"Great question! In personal finance, the key principles are: start early, invest regularly, diversify wisely, and stay patient. Which area would you like to dive deeper into?",
"I'd love to help you with that! Financial success comes from consistent planning and smart decisions. Could you be more specific about what you'd like to learn?",
"Excellent! Every financial journey is unique. The best approach depends on your goals, timeline, and risk tolerance. What's your primary financial concern right now?"
 ];
 return responses[Math.floor(Math.random() * responses.length)];
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
 }, 20);
 };

 // Auto scroll to bottom
 useEffect(() => {
 setTimeout(() => {
 const scrollElement = document.querySelector('#chat-scroll-area [data-radix-scroll-area-viewport]');
 if (scrollElement) {
 scrollElement.scrollTop = scrollElement.scrollHeight;
 }
 }, 100);
 }, [messages, isTyping]);

 // Calls our serverless AI backend (netlify/functions/chat.js -> Groq API).
 // Falls back to the local rule-based responder if the call fails (offline,
 // running under plain `vite dev` without `netlify dev`, rate-limited, etc.)
 // so the assistant always answers something rather than erroring out.
 const getAIResponse = async (
 textToSend: string,
 history: Message[]
 ): Promise<string> => {
 try {
 const conversationPayload = [
...history.map((m) => ({ role: m.isBot? 'assistant' : 'user', content: m.text })),
 { role: 'user', content: textToSend },
 ];

 const response = await fetch('/.netlify/functions/chat', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ messages: conversationPayload }),
 });

 if (!response.ok) throw new Error(`chat function returned ${response.status}`);

 const data = await response.json();
 if (typeof data.reply === 'string' && data.reply.trim()) {
 return data.reply;
 }
 throw new Error('Empty reply from chat function');
 } catch (err) {
 console.warn('Falling back to rule-based response:', err);
 return getBotResponse(textToSend);
 }
 };

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

 const historyForRequest = messages;
 setMessages(prev => [...prev, userMessage]);
 setInputMessage('');
 setIsTyping(true);

 getAIResponse(textToSend, historyForRequest).then((responseText) => {
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
 });
 };

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' &&!e.shiftKey) {
 e.preventDefault();
 handleSendMessage();
 }
 };

 return (
 <section className="px-5 py-20 sm:px-8 md:py-24 bg-canvas">
 <div className="max-w-6xl mx-auto">
 {/* Header */}
 <div className="mb-12">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <div className="flex flex-col items-center justify-center space-y-4 mb-4">
 <div className="bg-accent-soft p-4 rounded-full">
 <Sparkles className="h-10 w-10 text-accent" />
 </div>
 <h2 className="t-h2 text-ink">AI Financial Assistant</h2>
 </div>
 <p className="t-body max-w-2xl mx-auto">
 Get personalized financial advice, investment guidance, and answers to all your money-related questions
 </p>
 </motion.div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
 {/* Chat Interface */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="flex flex-col"
 >
 <Card className="h-[600px] flex flex-col">
 <CardHeader className="border-b border-border/50">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <motion.div
 animate={{ rotate: isTyping? 360 : 0 }}
 transition={{ duration: 1, repeat: isTyping? Infinity : 0, ease: "linear" }}
 className="bg-accent-soft p-2 rounded-full"
 >
 <Bot className="h-6 w-6 text-accent" />
 </motion.div>
 <div>
 <CardTitle>MoneyGroww Assistant</CardTitle>
 <CardDescription className="flex items-center space-x-2">
 <span className="inline-block h-2 w-2 bg-pos rounded-full animate-pulse"></span>
 <span>Online & Ready to Help</span>
 </CardDescription>
 </div>
 </div>
 <Badge variant="secondary" className="bg-accent-soft text-pos dark:bg-accent-soft dark:text-pos">
 AI Powered
 </Badge>
 </div>
 </CardHeader>

 <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden relative">
 {/* Messages */}
 <ScrollArea className="flex-1 px-6 pt-6 pb-2" id="chat-scroll-area">
 <div className="space-y-6 pb-4">
 <AnimatePresence>
 {messages.map((message) => (
 <motion.div
 key={message.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 className={`flex ${message.isBot? 'justify-start' : 'justify-end'}`}
 >
 <div className={`flex items-start space-x-3 max-w-[80%] ${message.isBot? '' : 'flex-row-reverse space-x-reverse'}`}>
 <div className={`p-2 rounded-full flex-shrink-0 ${message.isBot
? 'bg-accent-soft'
 : 'bg-accent'
 }`}>
 {message.isBot? (
 <Bot className="h-4 w-4 text-accent" />
 ) : (
 <User className="h-4 w-4 text-white" />
 )}
 </div>
 <motion.div
 whileHover={{ scale: 1.01 }}
 className={`p-4 rounded-lg shadow-sm ${message.isBot
? 'bg-muted/80 text-ink-3 rounded-bl-md'
 : 'bg-accent text-white rounded-br-md'
 }`}
 >
 <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
 <p className="text-xs opacity-70 mt-2">
 {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </p>
 </motion.div>
 </div>
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
 <div className="flex items-start space-x-3 max-w-[80%]">
 <div className="bg-accent-soft p-2 rounded-full flex-shrink-0">
 <Bot className="h-4 w-4 text-accent" />
 </div>
 <div className="p-4 rounded-lg rounded-bl-md bg-muted/80 text-ink-3 shadow-sm">
 <div className="text-sm leading-relaxed whitespace-pre-line">
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

 {/* Input Area */}
 <div className="border-t border-border/50 p-4 bg-white/50 dark:bg-surface-2 backdrop-blur-sm z-10 shrink-0">
 <div className="flex space-x-3">
 <Input
 value={inputMessage}
 onChange={(e) => setInputMessage(e.target.value)}
 onKeyDown={handleKeyPress}
 placeholder="Ask me anything about finance, investments, or use our calculators..."
 className="flex-1 border-muted-foreground/20 focus:border-accent transition-colors"
 disabled={isTyping}
 />
 <motion.div whileTap={{ scale: 0.95 }}>
 <Button
 onClick={() => handleSendMessage()}
 className="bg-accent hover:bg-accent-hover transition-colors duration-200"
 disabled={isTyping ||!inputMessage.trim()}
 >
 {isTyping? (
 <Loader2 className="h-5 w-5 animate-spin" />
 ) : (
 <>
 <Send className="h-5 w-5 mr-2" />
 Send
 </>
 )}
 </Button>
 </motion.div>
 </div>
 <p className="text-xs text-ink-3 mt-2 text-center">
 Press Enter to send • Shift + Enter for new line
 </p>
 </div>
 </CardContent>
 </Card>
 </motion.div>

 {/* Suggested Questions Sidebar */}
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="space-y-6"
 >
 <Card>
 <CardHeader>
 <CardTitle>Suggested Questions</CardTitle>
 <CardDescription>Click to ask common questions</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {quickSuggestions.slice(0, 6).map((suggestion, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 >
 <Button
 variant="outline"
 size="sm"
 className="w-full text-left justify-start h-auto py-2 px-3 hover:bg-accent-soft dark:hover:bg-surface-2"
 onClick={() => handleSendMessage(suggestion)}
 >
 <span className="text-xs line-clamp-2">{suggestion}</span>
 </Button>
 </motion.div>
 ))}
 </div>
 </CardContent>
 </Card>
 </motion.div>
 </div>
 </div>
 </section>
 );
}
=======
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatSectionProps {
  onNavigateToCalculators: () => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function ChatSection({ onNavigateToCalculators, isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }: ChatSectionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm MoneyGroww's AI Financial Assistant. I'm here to help you with investment planning, financial calculations, and money management advice. What would you like to know about today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');

  const quickSuggestions = [
    "How does compound interest work?",
    "Best investment options for beginners",
    "How to build an emergency fund?",
    "Tax saving investment strategies",
    "When should I start investing?",
    "How to diversify my portfolio?",
    "What is the 50-30-20 rule?",
    "How to calculate retirement corpus?"
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (/\b(hello|hi|hey)\b/.test(lowerMessage)) {
      return "Hello! Great to see you're taking charge of your financial future! I can help you with investment strategies, financial planning, calculator usage, and much more. What specific topic would you like to explore? 💼✨";
    } else if (lowerMessage.includes('sip')) {
      return "SIP (Systematic Investment Plan) is a fantastic way to build wealth! 📈\n\nKey benefits:\n• Rupee cost averaging reduces market volatility impact\n• Disciplined investing builds long-term wealth\n• Start with as little as ₹500 per month\n• Power of compounding works in your favor\n\nWould you like me to guide you to our SIP calculator to see potential returns?";
    } else if (lowerMessage.includes('compound')) {
      return "Compound interest is truly the eighth wonder of the world! 🌟\n\nHere's how it works:\n• You earn returns on your initial investment\n• You also earn returns on previous returns\n• Time is your biggest ally - start early!\n• Even small amounts can grow significantly\n\nExample: ₹5,000 monthly SIP at 12% for 20 years = ₹49.9 lakhs (you invest only ₹12 lakhs)! 🚀";
    } else if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
      return "Perfect time to start your investment journey! 🚀\n\nBeginner-friendly steps:\n1. Build emergency fund (6-12 months expenses)\n2. Start SIP in diversified equity mutual funds\n3. Begin with amount you're comfortable with\n4. Increase SIP by 10-15% annually\n5. Stay invested for long term (5+ years)\n\nRecommended allocation:\n• 70% Equity funds (growth)\n• 20% Debt funds (stability)\n• 10% Gold/REIT (diversification)";
    } else if (lowerMessage.includes('emi')) {
      return "EMI planning is crucial for healthy finances! 🏠\n\nKey points:\n• EMI should not exceed 40% of monthly income\n• Choose appropriate tenure (longer = lower EMI, higher interest)\n• Compare interest rates from different lenders\n• Consider prepayment options\n\nOur EMI calculator can help you:\n• Calculate monthly payments\n• Compare different loan options\n• Plan prepayment strategies\n\nWould you like to try our EMI calculator?";
    } else if (lowerMessage.includes('tax')) {
      return "Smart tax planning can boost your wealth! 💰\n\nSection 80C options (₹1.5L limit):\n• ELSS Mutual Funds (3-year lock, growth potential)\n• PPF (15-year lock, tax-free returns)\n• EPF (retirement planning)\n• Tax-saving FDs (5-year lock)\n\nELSS is often preferred because:\n• Shortest lock-in period\n• Market-linked returns\n• Professional management\n• Beat inflation over time";
    } else if (lowerMessage.includes('emergency')) {
      return "Emergency fund is your financial safety net! 🛡️\n\nIdeal emergency fund:\n• 6-12 months of monthly expenses\n• Keep in liquid instruments\n• Easily accessible without penalties\n\nWhere to park emergency fund:\n• Savings account (instant access)\n• Liquid mutual funds (1-day access)\n• Short-term FDs (higher returns)\n\nDon't invest emergency fund in:\n• Equity markets (volatile)\n• Long-term FDs (penalty on early withdrawal)\n• Real estate (illiquid)";
    } else if (lowerMessage.includes('goal') || lowerMessage.includes('planning')) {
      return "Goal-based investing is the key to success! 🎯\n\nStep-by-step planning:\n1. List your goals (house, education, retirement)\n2. Estimate required amount\n3. Set timeline for each goal\n4. Calculate monthly investment needed\n5. Choose appropriate investment instruments\n\nGoal timeline strategy:\n• Short-term (1-3 years): Debt funds, FDs\n• Medium-term (3-7 years): Balanced funds\n• Long-term (7+ years): Equity funds\n\nWhat's your primary financial goal? I can help you plan for it!";
    } else if (lowerMessage.includes('mutual fund')) {
      return "Mutual funds are excellent wealth-building tools! 📊\n\nTypes of mutual funds:\n• Equity funds (growth potential, higher risk)\n• Debt funds (stability, lower risk)\n• Hybrid funds (balanced approach)\n• Index funds (market returns, low cost)\n\nAdvantages:\n• Professional management\n• Diversification\n• Low minimum investment\n• Liquidity\n• Transparency\n\nFor beginners, start with:\n• Large-cap funds (stability)\n• Diversified equity funds\n• SIP mode for rupee cost averaging";
    } else if (lowerMessage.includes('risk')) {
      return "Understanding and managing risk is crucial! 📉📈\n\nTypes of investment risks:\n• Market risk (price fluctuations)\n• Inflation risk (reduced purchasing power)\n• Credit risk (default by borrower)\n• Liquidity risk (unable to sell quickly)\n\nRisk management strategies:\n• Diversify across asset classes\n• Don't put all eggs in one basket\n• Invest for appropriate time horizon\n• Regular portfolio review and rebalancing\n• Never invest money you need in next 5 years in equity";
    } else if (lowerMessage.includes('50-30-20') || lowerMessage.includes('rule')) {
      return "The 50-30-20 rule is a simple budgeting framework! 💡\n\nHere's the breakdown:\n• 50% for NEEDS (rent, groceries, utilities, EMIs)\n• 30% for WANTS (entertainment, dining out, shopping)\n• 20% for SAVINGS & INVESTMENTS\n\nThe 20% savings should be further divided:\n• Emergency fund building\n• Goal-based investments\n• Retirement planning\n• Insurance premiums\n\nThis rule ensures balanced financial life while building wealth systematically!";
    } else if (lowerMessage.includes('retirement')) {
      return "Retirement planning should start early! 🌅\n\nRetirement corpus calculation:\n• Current monthly expenses × 12 × 25-30\n• Account for inflation (6-8% annually)\n• Consider healthcare costs\n\nExample: ₹50,000 monthly expenses today\n• In 30 years: ₹3.24 lakhs monthly (at 6% inflation)\n• Required corpus: ₹9.7 crores\n• Monthly SIP needed: ₹25,000 (at 12% returns)\n\nStart early to benefit from compounding! Our calculators can help you plan better.";
    } else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
      return "You're absolutely welcome! 😊 I'm here to support your financial journey. Remember:\n\n• Start early, stay consistent\n• Every small step counts\n• Focus on long-term wealth building\n• Review and adjust regularly\n\nFeel free to ask anything about investments, financial planning, or use our calculators. Your financial success is my priority! 🌟";
    } else if (lowerMessage.includes('calculator')) {
      return "Our calculators are powerful tools for financial planning! 🧮\n\nAvailable calculators:\n• SIP Calculator - Plan systematic investments\n• Mutual Fund Calculator - Lumpsum returns\n• EMI Calculator - Loan planning\n\nEach calculator provides:\n• Accurate projections\n• Visual charts for better understanding\n• Different scenarios comparison\n\nWould you like me to guide you to a specific calculator?";
    } else if (/\b(little|small)\b.*\b(amount|anount)\b/.test(lowerMessage) && lowerMessage.includes('high return')) {
      return "Aiming for high returns with a small amount requires a strategic approach! 📈\n\nWhile higher returns naturally come with higher risk, you can maximize your small investments through:\n1. Small Cap Mutual Funds: Historically offer higher growth potential over 7+ years.\n2. Micro-SIPs: Start with just ₹100 or ₹500/month consistently.\n3. Direct Equity (Fractional Shares/Penny Stocks): High risk, requires deep research.\n\nRecommended Resources:\n• Check out our SIP Calculator to see the power of compounding on small amounts over time.\n• Read 'The Psychology of Money' for mindset strategies on small compounding.\n\n*Note: Never fall for 'get-rich-quick' schemes promising guaranteed high returns.*";
    } else {
      // Removed 'capital' to avoid false positives with cities/countries
      const financeKeywords = ['invest', 'return', 'sip', 'mutual fund', 'emi', 'loan', 'tax', 'save', 'money', 'finance', 'retirement', 'compound', 'stock', 'market', 'goal', 'budget', 'emergency', 'portfolio', 'asset', 'wealth', 'bank', 'interest', 'share', 'dividend', 'nifty', 'sensex', 'trading', 'crypto', 'amount', 'rupee'];

      const isFinanceRelated = financeKeywords.some(keyword => new RegExp(`\\b${keyword}`).test(lowerMessage));

      if (!isFinanceRelated && !/\b(help|calculator)\b/.test(lowerMessage)) {
        return "I am MoneyGroww's specialized AI Financial Assistant. I am programmed strictly to assist with personal finance, investments, calculators, and money management. Please ask me a finance-related question! 💼⚖️";
      }

      const responses = [
        "That's an interesting question! Let me help you with that. Financial planning involves understanding your goals, risk appetite, and time horizon. What specific aspect would you like to explore? 🤔",
        "Great question! In personal finance, the key principles are: start early, invest regularly, diversify wisely, and stay patient. Which area would you like to dive deeper into? 💭",
        "I'd love to help you with that! Financial success comes from consistent planning and smart decisions. Could you be more specific about what you'd like to learn? 🎯",
        "Excellent! Every financial journey is unique. The best approach depends on your goals, timeline, and risk tolerance. What's your primary financial concern right now? 💡"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  // Typing animation effect
  const typeMessage = (text: string, callback: () => void) => {
    setIsTyping(true);
    setTypingText('');

    let index = 0;
    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1));
        index++;
      } else {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setIsTyping(false);
        callback();
      }
    }, 20);
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') || scrollRef.current;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }, 100);
  }, [messages, isTyping, isOpen]);

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
    <section id="chat" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-50px font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">AI Financial Assistant</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Get instant answers to your financial queries, investment planning, and calculator help from our expert AI.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Chat Interface */}
          <div className="flex flex-col h-[700px] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* Chat Header */}
            <div className="bg-white dark:bg-slate-900 px-6 py-4 shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shadow-sm z-10">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/40 dark:to-green-900/40 p-3 rounded-2xl relative shadow-inner">
                  <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">MoneyGroww Expert Bot</h3>
                  <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-500 font-medium">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Ready to assist you</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6 bg-slate-50/30 dark:bg-slate-950/20" id="chat-scroll-area">
              <div ref={scrollRef} className="space-y-6 pb-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={"flex w-full " + (message.isBot ? 'justify-start' : 'justify-end')}
                    >
                      <div className={"flex items-end max-w-[85%] sm:max-w-[75%] gap-3 " + (message.isBot ? 'flex-row' : 'flex-row-reverse')}>
                        {message.isBot && (
                          <div className="flex-shrink-0 mb-1">
                            <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-1.5">
                          <div className={"p-4 shadow-sm text-sm " + (message.isBot
                              ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl rounded-bl-sm'
                              : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-sm'
                            )}
                          >
                            <p className="leading-relaxed whitespace-pre-line">{message.text}</p>
                          </div>
                          <span className={"text-[10px] font-medium opacity-60 " + (message.isBot ? 'text-left' : 'text-right')}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex justify-start w-full"
                  >
                    <div className="flex items-end max-w-[85%] gap-3">
                      <div className="flex-shrink-0 mb-1">
                        <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex gap-1">
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3 relative max-w-2xl mx-auto">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500/20 h-14 px-6 text-[15px] shadow-inner"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isTyping || !inputMessage.trim()}
                  className="rounded-xl h-14 w-14 shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  {isTyping ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                </Button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">Powered by MoneyGroww Intelligence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
