import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase';
import emailjs from 'emailjs-com';
import { UserPlus, Mail, Lock, User, HeartPulse, ChevronRight } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const sendWelcomeEmail = (userData) => {
        const templateParams = {
            to_name: userData.name,
            to_email: userData.email,
            risk_level: "Welcome to Life-Link",
            confidence: "Account Verified Successfully",
            details: `Hello ${userData.name},\n\nWelcome to the Life-Link Clinical AI Platform. Your account has been successfully verified. You now have full access to our maternal health monitoring, risk prediction, and emergency donor network tools.\n\nBest Regards,\nClinical AI Unit`
        };

        emailjs.send(
            'service_qvr20bd',
            'template_pt4yib6',
            templateParams,
            'aSiKP7rbqoKlXXhUC'
        ).catch(err => console.error('Welcome Email Fail:', err));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            await updateProfile(userCredential.user, { displayName: formData.name });

            // STORE USER PROFILE IN REALTIME DB
            await set(ref(db, `users/${userCredential.user.uid}/profile`), {
                name: formData.name,
                email: formData.email,
                createdAt: Date.now(),
                role: 'user'
            });

            // TRIGGER WELCOME EMAIL
            sendWelcomeEmail({ name: formData.name, email: formData.email });

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ height: '100vh', background: 'var(--background)' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '50px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', padding: '15px', background: 'var(--accent)', borderRadius: '20px', marginBottom: '20px' }}>
                        <HeartPulse size={40} color="var(--primary)" />
                    </div>
                    <h1 className="gradient-text">Join Life-Link</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create your clinical AI account</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-with-icon" style={{ position: 'relative' }}>
                        <User size={20} className="icon-left" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input type="text" placeholder="Full Clinical Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ paddingLeft: '50px' }} />
                    </div>
                    <div className="input-with-icon" style={{ position: 'relative' }}>
                        <Mail size={20} className="icon-left" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input type="email" placeholder="Professional Email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ paddingLeft: '50px' }} />
                    </div>
                    <div className="input-with-icon" style={{ position: 'relative' }}>
                        <Lock size={20} className="icon-left" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input type="password" placeholder="Access Password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ paddingLeft: '50px' }} />
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading} style={{ height: '55px', marginTop: '10px' }}>
                        {loading ? 'Creating Account ( < 2s )...' : 'Create AI Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Login Session <ChevronRight size={14} /></Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
