import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, HeartPulse, ShieldAlert, Navigation, Activity, LayoutDashboard, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I am your Life-Link Clinical Assistant. I can help with risk analysis, donor search, or SOS protocols. How can I assist you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setMessages([...messages, { text: userMessage, sender: 'user' }]);
        setInput('');
        setIsTyping(true);

        const response = getBotResponse(userMessage);

        setTimeout(() => {
            setMessages(prev => [...prev, { ...response, sender: 'bot' }]);
            setIsTyping(false);
        }, 800);
    };

    const getBotResponse = (text) => {
        const input = text.toLowerCase();

        // Navigation Links Components
        const Links = {
            dashboard: <Link to="/" onClick={() => setIsOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Main Dashboard</Link>,
            predict: <Link to="/predict" onClick={() => setIsOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Risk Analysis</Link>,
            donors: <Link to="/donors" onClick={() => setIsOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Donor Network</Link>,
            sos: <Link to="/sos" onClick={() => setIsOpen(false)} style={{ color: 'var(--error)', fontWeight: 'bold', textDecoration: 'underline' }}>Emergency SOS</Link>,
            history: <Link to="/history" onClick={() => setIsOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Condition History</Link>
        };

        // Advanced Keyword Mapping
        if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
            return { text: "Hello! Ready to assist in maternal safety. You can ask about 'risk', 'SOS', 'blood group', or for 'advice'." };
        }

        if (input.includes('low risk')) {
            return { text: "Low risk means vitals are within normal clinical ranges. However, regular monitoring is advised. You can check trends in your ", link: Links.history };
        }

        if (input.includes('high risk') || input.includes('dangerous')) {
            return { text: "CRITICAL ALERT: If the system detects high risk, follow manual SOS protocols immediately. Please navigate to ", link: Links.sos };
        }

        if (input.includes('doctor') || input.includes('advice')) {
            return { text: "For clinical advice: Ensure the patient has Systolic BP < 140 and Blood Sugar < 7.0. If readings exceed this, consult the resident physician. Detailed analysis is available at ", link: Links.predict };
        }

        if (input.includes('blood') || input.includes('donor')) {
            return { text: "I can help search for compatible donors based on location. Please open the ", link: Links.donors };
        }

        if (input.includes('sos') || input.includes('emergency')) {
            return { text: "In an emergency, click the SOS button to auto-match the nearest donors. Go to ", link: Links.sos };
        }

        if (input.includes('predict') || input.includes('analysis')) {
            return { text: "Input patient vitals like Age, BS, and BP for instant AI risk scoring here: ", link: Links.predict };
        }

        if (input.includes('history') || input.includes('trends')) {
            return { text: "View past health records and trend lines in the ", link: Links.history };
        }

        if (input.includes('dashboard') || input.includes('stats')) {
            return { text: "Access global maternity statistics and registry surveillance on the ", link: Links.dashboard };
        }

        if (input.includes('who are you') || input.includes('what do you do')) {
            return { text: "I am a Clinical AI bot designed to assist health workers in monitoring maternal health and dispatching donors. Ask me about clinical vitals!" };
        }

        // Default "Smart" Fallback
        return { text: "I understand you are asking about maternal health. To get the best out of the system, I recommend checking the ", link: Links.dashboard };
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="animate-pulse-red"
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    width: '70px',
                    height: '70px',
                    borderRadius: '25px',
                    background: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 15px 35px rgba(208, 0, 69, 0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 2000,
                    transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
            </button>

            {/* Premium Chat Interface */}
            {isOpen && (
                <div className="card animate-slide-up" style={{
                    position: 'fixed',
                    bottom: '125px',
                    right: '40px',
                    width: '420px',
                    height: '620px',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    borderRadius: '35px',
                    overflow: 'hidden',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                    border: 'none'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, #FF4D6D 100%)',
                        padding: '30px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HeartPulse size={28} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>Clinical Assistant</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', opacity: 0.8, fontWeight: '700' }}>
                                <div style={{ width: '8px', height: '8px', background: '#00FF88', borderRadius: '50%' }}></div>
                                AI Neural Link Active
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '25px', overflowY: 'auto', background: '#FDFCFD', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                padding: '16px 20px',
                                borderRadius: m.sender === 'user' ? '22px 22px 4px 22px' : '22px 22px 22px 4px',
                                background: m.sender === 'user' ? 'var(--primary)' : 'white',
                                color: m.sender === 'user' ? 'white' : 'var(--text)',
                                boxShadow: m.sender === 'user' ? '0 8px 20px rgba(208, 0, 69, 0.2)' : '0 4px 15px rgba(0,0,0,0.03)',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                fontWeight: '500'
                            }}>
                                {m.text}
                                {m.link && <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>{m.link}</div>}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                <div className="typing-loader"><span></span><span></span><span></span></div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: '25px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            placeholder="Type health query..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ flex: 1, height: '54px', padding: '0 25px', borderRadius: '27px', border: '1px solid #eee', background: '#F8F9FA' }}
                        />
                        <button type="submit" style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 15px rgba(208, 0, 69, 0.2)', cursor: 'pointer' }}>
                            <Send size={20} />
                        </button>
                    </form>

                    <style>{`
                        .typing-loader { display: flex; gap: 4px; }
                        .typing-loader span { width: 6px; height: 6px; background: #ddd; borderRadius: 50%; animation: bounce 1s infinite; }
                        .typing-loader span:nth-child(2) { animation-delay: 0.2s; }
                        .typing-loader span:nth-child(3) { animation-delay: 0.4s; }
                        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                    `}</style>
                </div>
            )}
        </>
    );
};

export default Chatbot;
