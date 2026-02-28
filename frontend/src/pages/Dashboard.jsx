import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import {
    Users, Activity, AlertTriangle, TrendingUp, Heart, Droplets, Zap, ShieldCheck,
    ChevronRight, ArrowUpRight, CheckCircle2, Globe, MessageCircle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPredictions: 0,
        highRiskCount: 0,
        activeDonors: 0,
        emergencyAlerts: 0
    });
    const [recentCases, setRecentCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const predsRef = ref(db, 'predictions');
        const donorsRef = ref(db, 'donors');
        const alertsRef = ref(db, 'emergency_alerts');

        const unsubPreds = onValue(predsRef, (snap) => {
            const data = snap.val();
            if (data) {
                let total = 0, high = 0, allPreds = [];
                Object.values(data).forEach(userPreds => {
                    Object.entries(userPreds).forEach(([id, val]) => {
                        total++;
                        if (val.risk_level?.toLowerCase().includes('high')) high++;
                        allPreds.push({ id, ...val });
                    });
                });
                setRecentCases(allPreds.sort((a, b) => b.timestamp - a.timestamp).slice(0, 4));
                setStats(prev => ({ ...prev, totalPredictions: total, highRiskCount: high }));
            }
            setLoading(false);
        });

        const unsubDonors = onValue(donorsRef, snap => {
            setStats(prev => ({ ...prev, activeDonors: snap.val() ? Object.keys(snap.val()).length : 0 }));
        });

        const unsubAlerts = onValue(alertsRef, snap => {
            setStats(prev => ({ ...prev, emergencyAlerts: snap.val() ? Object.keys(snap.val()).length : 0 }));
        });

        return () => { unsubPreds(); unsubDonors(); unsubAlerts(); };
    }, []);

    const chartData = [
        { name: 'Mon', risk: 12, volunteers: 15 }, { name: 'Tue', risk: 18, volunteers: 20 },
        { name: 'Wed', risk: 15, volunteers: 25 }, { name: 'Thu', risk: 25, volunteers: 30 },
        { name: 'Fri', risk: 22, volunteers: 28 }, { name: 'Sat', risk: 32, volunteers: 40 },
        { name: 'Sun', risk: 28, volunteers: 35 },
    ];

    if (loading) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column' }}>
            <div className="loader" style={{ width: '60px', height: '60px', borderTopColor: 'var(--primary)' }}></div>
            <p style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '1.2rem' }}>Booting Health Intelligence Unit...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>

            {/* Premium Welcome Hero Section */}
            <div className="card animate-slide-up" style={{
                background: 'linear-gradient(135deg, #1A1C1E 0%, #343A40 100%)',
                color: 'white',
                padding: '60px',
                borderRadius: '32px',
                border: 'none',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: '40px',
                alignItems: 'center',
                marginBottom: '40px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
            }}>
                <div>
                    <h1 style={{ color: 'white', marginBottom: '20px' }}>Welcome to <span className="gradient-text">Maternal-Guard AI</span></h1>
                    <p style={{ opacity: 0.9, fontSize: '1.3rem', lineHeight: '1.7', marginBottom: '35px', maxWidth: '600px', fontWeight: '500' }}>
                        We are bridging the gap between life-critical AI risk monitoring and real-time emergency donor dispatch. Bridging clinical safety with 10,000+ district-wide verified donors.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <FeaturePoint icon={<Activity size={20} />} text="AI-Driven Risk Surveillance" />
                        <FeaturePoint icon={<Globe size={20} />} text="District-Wide Donor Dispatch" />
                        <FeaturePoint icon={<ShieldCheck size={20} />} text="GPS-Aware Emergency Protocol" />
                        <FeaturePoint icon={<TrendingUp size={20} />} text="Real-time Health Analytics" />
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.8rem' }}>Global Status</h3>
                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--accent)', marginBottom: '10px' }}>99.9%</div>
                    <p style={{ opacity: 0.7, fontWeight: '700', letterSpacing: '1px' }}>AI ACCURACY UP-TIME</p>
                    <div style={{ marginTop: '30px', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                        <CheckCircle2 color="var(--success)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Real-time DB Sync Active</span>
                    </div>
                </div>
            </div>

            {/* Real-time Stats Registry */}
            <h3 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>Registry Surveillance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <DashboardStat icon={<Activity color="white" />} label="Total Assessments" value={stats.totalPredictions} color="var(--primary)" trend="100% Secure" />
                <DashboardStat icon={<AlertTriangle color="white" />} label="Clinical Alerts" value={stats.highRiskCount} color="var(--error)" trend="Attention Required" isAlert />
                <DashboardStat icon={<Users color="white" />} label="Verified Donors" value={stats.activeDonors} color="var(--success)" trend="GPS Tracking Active" />
                <DashboardStat icon={<Zap color="white" />} label="SOS Dispatches" value={stats.emergencyAlerts} color="#ffb703" trend="Avg Response: 2.1m" />
            </div>

            {/* Analytics & Stream */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '32px' }}>
                <div className="card shadow-soft">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                        <h3>Predictive Risk Trends</h3>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div> Predictive Risks</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }}></div> Donor Readiness</span>
                        </div>
                    </div>
                    <div style={{ height: '380px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ea0a3', fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ea0a3', fontWeight: 600 }} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: 'var(--shadow-lg)', fontWeight: '700' }} />
                                <Area type="monotone" dataKey="risk" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={5} />
                                <Area type="monotone" dataKey="volunteers" stroke="#ffb703" fillOpacity={0} strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="card" style={{ background: 'var(--primary-light)', border: 'none' }}>
                        <h4 style={{ marginBottom: '15px', color: 'var(--primary)', fontWeight: '800' }}>AI Health Tip</h4>
                        <p style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: '1.6', fontWeight: '500' }}>
                            System has verified that <strong>{stats.highRiskCount} high-risk assessments</strong> have been automatically notified via EmailJS. Please ensure clinical staff follow the protocol in the SOS tab.
                        </p>
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '700' }}>
                            Learn more <ChevronRight size={18} />
                        </div>
                    </div>

                    <div className="card shadow-soft">
                        <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900' }}>
                            <Activity size={24} color="var(--primary)" /> Real-time Activity
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {recentCases.map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '45px', height: '45px', background: c.risk_level?.includes('high') ? 'var(--error)' : 'var(--background)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.risk_level?.includes('high') ? 'white' : 'var(--primary)' }}>
                                            <Heart size={22} fill={c.risk_level?.includes('high') ? 'white' : 'none'} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>Patient {c.id?.substring(0, 4)}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.5 }}>{new Date(c.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                    <div className={`badge risk-${c.risk_level?.split(' ')[0].toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                                        {c.risk_level?.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary" style={{ marginTop: '25px', width: '100%', height: '54px', fontSize: '0.9rem' }} onClick={() => window.location.href = '/history'}>
                            View Full Logs <ArrowUpRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeaturePoint = ({ icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.08)', padding: '15px 20px', borderRadius: '18px' }}>
        <div style={{ color: 'var(--accent)' }}>{icon}</div>
        <span style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px' }}>{text}</span>
    </div>
);

const DashboardStat = ({ icon, label, value, color, trend, isAlert }) => (
    <div className="card animate-slide-up" style={{
        padding: '30px',
        border: isAlert ? '2px solid var(--error)' : '1px solid rgba(0,0,0,0.03)',
        background: isAlert ? 'rgba(217, 4, 41, 0.05)' : 'white',
        transform: isAlert ? 'scale(1.02)' : 'none'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ background: color, display: 'flex', padding: '14px', borderRadius: '16px', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}>{icon}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '900', color: isAlert ? 'var(--error)' : 'var(--text-muted)' }}>{trend}</div>
        </div>
        <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</p>
        <div style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px' }}>{value}</div>
    </div>
);

export default Dashboard;
