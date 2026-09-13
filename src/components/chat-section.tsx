import { useState, useEffect } from 'react';
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
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
 return "SIP (Systematic Investment Plan) is a fantastic way to build wealth!\n\nKey benefits:\nâ€¢ Rupee cost averaging reduces market volatility impact\nâ€¢ Disciplined investing builds long-term wealth\nâ€¢ Start with as little as â‚¹500 per month\nâ€¢ Power of compounding works in your favor\n\nWould you like me to guide you to our SIP calculator to see potential returns?";
 } else if (lowerMessage.includes('compound')) {
 return "Compound interest is truly the eighth wonder of the world!\n\nHere's how it works:\nâ€¢ You earn returns on your initial investment\nâ€¢ You also earn returns on previous returns\nâ€¢ Time is your biggest ally - start early!\nâ€¢ Even small amounts can grow significantly\n\nExample: â‚¹5,000 monthly SIP at 12% for 20 years = â‚¹49.9 lakhs (you invest only â‚¹12 lakhs)!";
 } else if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
 return "Perfect time to start your investment journey!\n\nBeginner-friendly steps:\n1. Build emergency fund (6-12 months expenses)\n2. Start SIP in diversified equity mutual funds\n3. Begin with amount you're comfortable with\n4. Increase SIP by 10-15% annually\n5. Stay invested for long term (5+ years)\n\nRecommended allocation:\nâ€¢ 70% Equity funds (growth)\nâ€¢ 20% Debt funds (stability)\nâ€¢ 10% Gold/REIT (diversification)";
 } else if (lowerMessage.includes('emi')) {
 return "EMI planning is crucial for healthy finances!\n\nKey points:\nâ€¢ EMI should not exceed 40% of monthly income\nâ€¢ Choose appropriate tenure (longer = lower EMI, higher interest)\nâ€¢ Compare interest rates from different lenders\nâ€¢ Consider prepayment options\n\nOur EMI calculator can help you:\nâ€¢ Calculate monthly payments\nâ€¢ Compare different loan options\nâ€¢ Plan prepayment strategies\n\nWould you like to try our EMI calculator?";
 } else if (lowerMessage.includes('tax')) {
 return "Smart tax planning can boost your wealth!\n\nSection 80C options (â‚¹1.5L limit):\nâ€¢ ELSS Mutual Funds (3-year lock, growth potential)\nâ€¢ PPF (15-year lock, tax-free returns)\nâ€¢ EPF (retirement planning)\nâ€¢ Tax-saving FDs (5-year lock)\n\nELSS is often preferred because:\nâ€¢ Shortest lock-in period\nâ€¢ Market-linked returns\nâ€¢ Professional management\nâ€¢ Beat inflation over time";
 } else if (lowerMessage.includes('emergency')) {
 return "Emergency fund is your financial safety net!\n\nIdeal emergency fund:\nâ€¢ 6-12 months of monthly expenses\nâ€¢ Keep in liquid instruments\nâ€¢ Easily accessible without penalties\n\nWhere to park emergency fund:\nâ€¢ Savings account (instant access)\nâ€¢ Liquid mutual funds (1-day access)\nâ€¢ Short-term FDs (higher returns)\n\nDon't invest emergency fund in:\nâ€¢ Equity markets (volatile)\nâ€¢ Long-term FDs (penalty on early withdrawal)\nâ€¢ Real estate (illiquid)";
 } else if (lowerMessage.includes('goal') || lowerMessage.includes('planning')) {
 return "Goal-based investing is the key to success!\n\nStep-by-step planning:\n1. List your goals (house, education, retirement)\n2. Estimate required amount\n3. Set timeline for each goal\n4. Calculate monthly investment needed\n5. Choose appropriate investment instruments\n\nGoal timeline strategy:\nâ€¢ Short-term (1-3 years): Debt funds, FDs\nâ€¢ Medium-term (3-7 years): Balanced funds\nâ€¢ Long-term (7+ years): Equity funds\n\nWhat's your primary financial goal? I can help you plan for it!";
 } else if (lowerMessage.includes('mutual fund')) {
 return "Mutual funds are excellent wealth-building tools!\n\nTypes of mutual funds:\nâ€¢ Equity funds (growth potential, higher risk)\nâ€¢ Debt funds (stability, lower risk)\nâ€¢ Hybrid funds (balanced approach)\nâ€¢ Index funds (market returns, low cost)\n\nAdvantages:\nâ€¢ Professional management\nâ€¢ Diversification\nâ€¢ Low minimum investment\nâ€¢ Liquidity\nâ€¢ Transparency\n\nFor beginners, start with:\nâ€¢ Large-cap funds (stability)\nâ€¢ Diversified equity funds\nâ€¢ SIP mode for rupee cost averaging";
 } else if (lowerMessage.includes('risk')) {
 return "Understanding and managing risk is crucial!\n\nTypes of investment risks:\nâ€¢ Market risk (price fluctuations)\nâ€¢ Inflation risk (reduced purchasing power)\nâ€¢ Credit risk (default by borrower)\nâ€¢ Liquidity risk (unable to sell quickly)\n\nRisk management strategies:\nâ€¢ Diversify across asset classes\nâ€¢ Don't put all eggs in one basket\nâ€¢ Invest for appropriate time horizon\nâ€¢ Regular portfolio review and rebalancing\nâ€¢ Never invest money you need in next 5 years in equity";
 } else if (lowerMessage.includes('50-30-20') || lowerMessage.includes('rule')) {
 return "The 50-30-20 rule is a simple budgeting framework!\n\nHere's the breakdown:\nâ€¢ 50% for NEEDS (rent, groceries, utilities, EMIs)\nâ€¢ 30% for WANTS (entertainment, dining out, shopping)\nâ€¢ 20% for SAVINGS & INVESTMENTS\n\nThe 20% savings should be further divided:\nâ€¢ Emergency fund building\nâ€¢ Goal-based investments\nâ€¢ Retirement planning\nâ€¢ Insurance premiums\n\nThis rule ensures balanced financial life while building wealth systematically!";
 } else if (lowerMessage.includes('retirement')) {
 return "Retirement planning should start early!\n\nRetirement corpus calculation:\nâ€¢ Current monthly expenses Ã— 12 Ã— 25-30\nâ€¢ Account for inflation (6-8% annually)\nâ€¢ Consider healthcare costs\n\nExample: â‚¹50,000 monthly expenses today\nâ€¢ In 30 years: â‚¹3.24 lakhs monthly (at 6% inflation)\nâ€¢ Required corpus: â‚¹9.7 crores\nâ€¢ Monthly SIP needed: â‚¹25,000 (at 12% returns)\n\nStart early to benefit from compounding! Our calculators can help you plan better.";
 } else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
 return "You're absolutely welcome! I'm here to support your financial journey. Remember:\n\nâ€¢ Start early, stay consistent\nâ€¢ Every small step counts\nâ€¢ Focus on long-term wealth building\nâ€¢ Review and adjust regularly\n\nFeel free to ask anything about investments, financial planning, or use our calculators. Your financial success is my priority!";
 } else if (lowerMessage.includes('calculator')) {
 return "Our calculators are powerful tools for financial planning!\n\nAvailable calculators:\nâ€¢ SIP Calculator - Plan systematic investments\nâ€¢ Mutual Fund Calculator - Lumpsum returns\nâ€¢ EMI Calculator - Loan planning\n\nEach calculator provides:\nâ€¢ Accurate projections\nâ€¢ Visual charts for better understanding\nâ€¢ Different scenarios comparison\n\nWould you like me to guide you to a specific calculator?";
 } else if (/\b(little|small)\b.*\b(amount|anount)\b/.test(lowerMessage) && lowerMessage.includes('high return')) {
 return "Aiming for high returns with a small amount requires a strategic approach!\n\nWhile higher returns naturally come with higher risk, you can maximize your small investments through:\n1. Small Cap Mutual Funds: Historically offer higher growth potential over 7+ years.\n2. Micro-SIPs: Start with just â‚¹100 or â‚¹500/month consistently.\n3. Direct Equity (Fractional Shares/Penny Stocks): High risk, requires deep research.\n\nRecommended Resources:\nâ€¢ Check out our SIP Calculator to see the power of compounding on small amounts over time.\nâ€¢ Read 'The Psychology of Money' for mindset strategies on small compounding.\n\n*Note: Never fall for 'get-rich-quick' schemes promising guaranteed high returns.*";
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
 Press Enter to send â€¢ Shift + Enter for new line
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
