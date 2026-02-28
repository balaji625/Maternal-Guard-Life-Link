import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    Users,
    AlertTriangle,
    LogOut,
    HeartPulse,
    TrendingUp,
    ShieldCheck,
    ChevronRight
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <aside style={{
            width: '320px',
            background: 'var(--surface)',
            borderRight: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 20px',
            position: 'sticky',
            top: 0,
            height: '100vh',
            boxShadow: '10px 0 30px rgba(0,0,0,0.02)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px', padding: '0 10px' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '16px', boxShadow: '0 8px 15px rgba(208,0,69,0.2)' }}>
                    <HeartPulse size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }} className="gradient-text">Life-Link</h2>
                    <p style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase' }}>Clinical AI Unit</p>
                </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <NavItem to="/" icon={<LayoutDashboard size={24} />} label="Dashboard" />
                <NavItem to="/predict" icon={<Activity size={24} />} label="Risk Analysis" />
                <NavItem to="/history" icon={<TrendingUp size={24} />} label="Condition History" />
                <NavItem to="/donors" icon={<Users size={24} />} label="Donor Network" />
                <NavItem to="/sos" icon={<AlertTriangle size={24} />} label="Emergency SOS" />
            </nav>

            <div style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '24px', marginBottom: '30px', border: '1px solid rgba(208,0,69,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <ShieldCheck size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)' }}>SECURE ACCESS</span>
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', opacity: 0.8 }}>Professional session active with Realtime DB encryption.</p>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '20px',
                    borderRadius: '20px',
                    color: 'var(--error)',
                    background: 'rgba(217, 4, 41, 0.05)',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: '0.3s'
                }}
            >
                <LogOut size={22} />
                <span>Logout Session</span>
            </button>
        </aside>
    );
};

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            padding: '20px',
            borderRadius: '20px',
            textDecoration: 'none',
            color: isActive ? 'white' : 'var(--text-muted)',
            background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, #FF4D6D 100%)' : 'transparent',
            fontWeight: '700',
            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
            boxShadow: isActive ? '0 12px 25px rgba(208, 0, 69, 0.25)' : 'none',
            fontSize: '1.05rem'
        })}
    >
        {({ isActive }) => (
            <>
                {icon}
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={18} />}
            </>
        )}
    </NavLink>
);

export default Sidebar;
