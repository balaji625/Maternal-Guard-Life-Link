import React from 'react';
import { LogOut, Bell, Search, HeartPulse, UserCircle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Header = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '50px',
            padding: '0 10px'
        }}>
            <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text)' }}>Welcome, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'Health Worker'}</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '700', marginTop: '6px' }}>Maternal AI Surveillance • Global Clinical Unit</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={20} style={{ position: 'absolute', left: '15px', opacity: 0.4 }} />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        style={{
                            borderRadius: '30px',
                            padding: '12px 20px 12px 45px',
                            width: '280px',
                            border: '2px solid rgba(0,0,0,0.05)',
                            background: 'white'
                        }}
                    />
                </div>

                <button className="glass-card" style={{ padding: '12px', borderRadius: '15px', color: 'var(--text-muted)', display: 'flex' }}>
                    <Bell size={20} />
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'white',
                    padding: '8px 15px',
                    borderRadius: '40px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <UserCircle size={22} />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{user?.email}</div>
                </div>

                <button
                    onClick={handleLogout}
                    className="glass-card"
                    style={{
                        padding: '12px',
                        borderRadius: '15px',
                        color: 'var(--error)',
                        display: 'flex',
                        background: 'rgba(208, 0, 0, 0.05)'
                    }}
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
