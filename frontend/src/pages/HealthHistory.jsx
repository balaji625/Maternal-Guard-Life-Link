import React, { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { db, auth } from '../firebase';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Clock, Heart, Droplets, TrendingUp, AlertTriangle } from 'lucide-react';

const HealthHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) return;
        const historyRef = ref(db, `predictions/${auth.currentUser.uid}`);

        // FETCH FROM REALTIME DB
        const unsubscribe = onValue(historyRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sorted = Object.entries(data).map(([id, val]) => ({
                    id,
                    ...val,
                    date: new Date(val.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    fullDate: new Date(val.timestamp).toLocaleString(),
                    bp: parseFloat(val.vitals?.SystolicBP) || 0,
                    bs: parseFloat(val.vitals?.BS) || 0,
                    sortTime: val.timestamp
                })).sort((a, b) => a.sortTime - b.sortTime);
                setHistory(sorted);
            } else {
                setHistory([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column' }}>
            <div className="loader" style={{ width: '50px', height: '50px', borderTopColor: 'var(--primary)' }}></div>
            <p style={{ marginTop: '20px' }}>Analyzing Trend History...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ padding: '0 20px' }}>
            <div style={{ marginBottom: '35px' }}>
                <h1 className="gradient-text">Condition History</h1>
                <p style={{ color: 'var(--text-muted)' }}>Real-time health trend tracking (from Realtime Database)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px', marginBottom: '40px' }}>
                <div className="card" style={{ border: '1px solid var(--secondary)' }}>
                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={22} color="var(--primary)" /> Vital Trends Surveillance
                    </h3>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 25px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="bp" stroke="var(--primary)" fillOpacity={1} fill="url(#colorBP)" name="Systolic BP" strokeWidth={3} />
                                <Area type="monotone" dataKey="bs" stroke="#ffb703" fillOpacity={0} name="Blood Sugar" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--background)' }}>
                    <h3>Health Overview</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '25px' }}>
                        {history.length > 0 ? (
                            <>
                                <TrendStat label="Current Risk Level" value={history[history.length - 1].risk_level.toUpperCase()} color={`risk-${history[history.length - 1].risk_level.split(' ')[0].toLowerCase()}`} />
                                <TrendStat label="Last Assessment" value={history[history.length - 1].fullDate} />
                                <div className="glass-card" style={{ padding: '20px' }}>
                                    <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        Based on <strong>{history.length} data points</strong>, your AI risk consistency is verified at <strong>{history[history.length - 1].confidence}% confidence.</strong>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <AlertTriangle size={40} color="var(--primary)" style={{ opacity: 0.3 }} />
                                <p style={{ fontSize: '0.9rem', opacity: 0.5, marginTop: '10px' }}>Run a prediction to start tracking history.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '25px' }}>Timeline Logs</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {history.slice().reverse().map(item => (
                        <div key={item.id} className="glass-card flex-center" style={{
                            justifyContent: 'space-between',
                            padding: '20px',
                            borderLeft: `6px solid ${item.risk_level.includes('high') ? 'var(--error)' : item.risk_level.includes('mid') ? 'var(--warning)' : 'var(--success)'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <Clock color="var(--text-muted)" size={18} />
                                <div>
                                    <div style={{ fontWeight: '800' }}>{item.risk_level.toUpperCase()}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{item.fullDate}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '40px' }}>
                                <SmallStat icon={<Heart size={14} />} val={item.vitals?.SystolicBP} unit="BP" />
                                <SmallStat icon={<Droplets size={14} />} val={item.vitals?.BS} unit="BS" />
                                <div style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    {item.confidence}% Conf.
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TrendStat = ({ label, value, color }) => (
    <div style={{ padding: '15px', borderRadius: '15px', background: 'var(--surface)' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.5, marginBottom: '5px' }}>{label}</p>
        <div className={color} style={{ fontSize: '1.1rem', fontWeight: '900' }}>{value}</div>
    </div>
);

const SmallStat = ({ icon, val, unit }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ opacity: 0.4 }}>{icon}</div>
        <div style={{ fontSize: '0.9rem' }}><strong>{val}</strong> <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{unit}</span></div>
    </div>
);

export default HealthHistory;
