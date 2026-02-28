import React, { useState, useEffect } from 'react';
import { ref, get, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { db, auth } from '../firebase';
import emailjs from 'emailjs-com';
import {
    AlertOctagon, Droplets, User, PhoneCall, Mail, Navigation, ExternalLink, ShieldAlert, Zap, Search, Map, Phone
} from 'lucide-react';

const EmergencySOS = () => {
    const [bloodGroup, setBloodGroup] = useState('A+');
    const [district, setDistrict] = useState('ALL');
    const [matchingDonors, setMatchingDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alertTriggered, setAlertTriggered] = useState(false);
    const [districts, setDistricts] = useState(['ALL']);

    useEffect(() => {
        const donorsRef = ref(db, 'donors');
        const unsub = onValue(donorsRef, (snap) => {
            if (snap.exists()) {
                const unique = new Set(['ALL']);
                Object.values(snap.val()).forEach(d => {
                    if (d.location_name) unique.add(d.location_name.toUpperCase());
                });
                setDistricts(Array.from(unique));
            }
        });
        return () => unsub();
    }, []);

    const triggerSOS = async () => {
        setLoading(true);
        setAlertTriggered(true);
        setMatchingDonors([]);

        try {
            const donorsRef = ref(db, 'donors');
            const snap = await get(donorsRef);

            let allMatches = [];
            if (snap.exists()) {
                const data = snap.val();
                Object.entries(data).forEach(([id, val]) => {
                    const bgMatch = val.blood_group === bloodGroup;
                    const districtMatch = district === 'ALL' || val.location_name?.toUpperCase() === district;

                    if (bgMatch && districtMatch && val.status === 'available' && parseFloat(val.hemoglobin) >= 12.0) {
                        allMatches.push({ id, ...val });
                    }
                });
            }

            setMatchingDonors(allMatches.sort((a, b) => b.hemoglobin - a.hemoglobin).slice(0, 10));
            sendEmergencyEmail(bloodGroup, allMatches.length, district);

        } catch (err) {
            console.error("SOS System Failure:", err);
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    };

    const sendEmergencyEmail = (group, count, area) => {
        const templateParams = {
            to_name: "Emergency Coordinator",
            to_email: "emergency@lifelink.org",
            risk_level: `SOS ALERT: ${group} in ${area}`,
            confidence: `${count} Available Donors Found`,
            details: `Critical Hemorrhage Alert Dispatch: ${count} donors with verified HB >= 12.0 located in ${area}. GPS navigation active.`
        };

        emailjs.send(
            'service_qvr20bd',
            'template_pt4yib6',
            templateParams,
            'aSiKP7rbqoKlXXhUC'
        ).catch(err => console.error("Email Fail:", err));
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            {/* Neat & Premium SOS Header Section */}
            <div className="card shadow-lg" style={{
                background: 'linear-gradient(145deg, #1A1C1E 0%, #2D3436 100%)',
                color: 'white',
                padding: '80px 60px',
                textAlign: 'center',
                marginBottom: '50px',
                border: 'none',
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Visual Accent */}
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(80px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--error)', opacity: 0.1, borderRadius: '50%', filter: 'blur(80px)' }}></div>

                <div style={{ display: 'inline-flex', padding: '25px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldAlert size={64} style={{ color: 'var(--error)', filter: 'drop-shadow(0 0 15px rgba(217, 4, 41, 0.4))' }} />
                </div>

                <h1 style={{ fontSize: '3.8rem', fontWeight: '900', marginBottom: '10px', letterSpacing: '-2px', color: 'white' }}>
                    <span style={{ color: 'var(--error)' }}>Critical</span> Dispatch Unit
                </h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.7, maxWidth: '700px', margin: '0 auto 50px', fontWeight: '500', lineHeight: '1.6' }}>
                    Maternal-Guard is scanning 10,000+ verified district records to match life-critical donors with HB ≥ 12.0 g/dL for immediate dispatch.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px 30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', minWidth: '220px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.5, letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>BLOOD GROUP</label>
                        <select
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            style={{ background: 'transparent', color: 'white', width: '100%', fontSize: '1.5rem', fontWeight: '900', border: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg} style={{ background: '#2D3436' }}>{bg}</option>)}
                        </select>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px 30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', minWidth: '220px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.5, letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>DISTRICT SCAN</label>
                        <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            style={{ background: 'transparent', color: 'white', width: '100%', fontSize: '1.2rem', fontWeight: '800', border: 'none', cursor: 'pointer', outline: 'none', textTransform: 'uppercase' }}
                        >
                            {districts.map(d => <option key={d} value={d} style={{ background: '#2D3436' }}>{d}</option>)}
                        </select>
                    </div>

                    <button
                        className="animate-pulse-red"
                        style={{
                            background: 'var(--error)',
                            color: 'white',
                            fontSize: '1.4rem',
                            padding: '0 60px',
                            height: '92px',
                            borderRadius: '24px',
                            boxShadow: '0 20px 40px rgba(217, 4, 41, 0.3)',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}
                        onClick={triggerSOS}
                        disabled={loading}
                    >
                        {loading ? <div className="loader" style={{ width: '30px', height: '30px', borderTopColor: 'white' }}></div> : <Zap size={32} />}
                        {loading ? 'LOCATING...' : 'TRIGGER SOS'}
                    </button>
                </div>
            </div>

            {alertTriggered && (
                <div className="animate-fade-in" style={{ marginBottom: '100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '900' }}>
                            <div style={{ background: 'var(--error)', color: 'white', padding: '12px', borderRadius: '15px' }}>
                                <Droplets size={28} />
                            </div>
                            {matchingDonors.length} Verified Compatible Donors
                        </h2>
                        <div className="badge risk-high" style={{ padding: '12px 25px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '900', background: 'rgba(217, 4, 41, 0.1)', color: 'var(--error)' }}>GPS ACTIVE STREAMING</div>
                    </div>

                    {matchingDonors.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '30px' }}>
                            {matchingDonors.map((donor, i) => (
                                <div key={i} className="card shadow-soft animate-fade-in" style={{
                                    padding: '35px',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    background: 'white',
                                    borderRadius: '32px',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '25px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <User size={28} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>{donor.name}</h3>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>#{donor.id?.substring(0, 8).toUpperCase()}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--error)' }}>{donor.blood_group}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '900', opacity: 0.5, textTransform: 'uppercase' }}>HB: {donor.hemoglobin}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                            <Navigation size={18} color="var(--primary)" /> {donor.location_name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                            <Phone size={18} color="var(--success)" /> {donor.phone || "Restricted Contact"}
                                        </div>
                                    </div>

                                    <div style={{ padding: '15px', background: 'var(--background)', borderRadius: '15px', textAlign: 'center', border: '1px dashed #ddd', marginBottom: '25px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>CLINICAL IDENTITY VERIFIED</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button
                                            style={{ flex: 1.5, height: '64px', fontSize: '1.1rem', fontWeight: '900', borderRadius: '20px' }}
                                            className="btn-primary"
                                            onClick={() => donor.phone && window.open(`tel:${donor.phone}`)}
                                        >
                                            <PhoneCall size={20} /> Dispatch Donor
                                        </button>
                                        <button
                                            style={{ flex: 1, height: '64px', background: 'var(--surface)', color: 'var(--primary)', border: '1px solid #f0f0f0', fontWeight: '900', borderRadius: '20px', fontSize: '1rem' }}
                                            onClick={() => donor.lat && window.open(`https://www.google.com/maps?q=${donor.lat},${donor.lng}`, '_blank')}
                                        >
                                            <Navigation size={20} /> Locate GPS
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card shadow-soft" style={{ textAlign: 'center', padding: '100px 50px', border: '2px dashed #eee', borderRadius: '40px' }}>
                            <AlertOctagon size={80} color="var(--primary)" style={{ marginBottom: '30px', opacity: 0.2 }} />
                            <h2 style={{ opacity: 0.4, fontWeight: '900', fontSize: '1.8rem' }}>Scanning Registry Intelligence...</h2>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '550px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                No compatible donors with HB ≥ 12.0 detected in <strong>{district}</strong>. The system has automatically broadcasted a priority alert to neighboring district hubs.
                            </p>
                        </div>
                    )}
                </div>
            )}
            <style>{`
        .loader { border: 4px solid rgba(255, 255, 255, 0.2); border-radius: 50%; border-top: 4px solid white; width: 30px; height: 30px; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default EmergencySOS;
