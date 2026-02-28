import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import RiskPrediction from './pages/RiskPrediction';
import HealthHistory from './pages/HealthHistory';
import DonorNetwork from './pages/DonorNetwork';
import EmergencySOS from './pages/EmergencySOS';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Chatbot from './components/Chatbot';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)'
      }}>
        <div className="loader" style={{ width: '60px', height: '60px', borderTopColor: 'var(--primary)' }}></div>
        <div className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '900', marginTop: '25px' }}>Initializing Clinical AI Unit...</div>
        <style>{`
          .loader { border: 6px solid #f3f3f3; border-radius: 50%; border-top: 6px solid var(--primary); animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {user && <Sidebar />}
        <main style={{
          flex: 1,
          padding: user ? '40px' : '0',
          overflowY: 'auto',
          maxHeight: '100vh',
          background: user ? 'var(--background)' : 'white'
        }}>
          {user && <Header user={user} />}
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

              <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/predict" element={user ? <RiskPrediction /> : <Navigate to="/login" />} />
              <Route path="/history" element={user ? <HealthHistory /> : <Navigate to="/login" />} />
              <Route path="/donors" element={user ? <DonorNetwork /> : <Navigate to="/login" />} />
              <Route path="/sos" element={user ? <EmergencySOS /> : <Navigate to="/login" />} />
            </Routes>
          </div>
          {user && <Chatbot />}
        </main>
      </div>
    </Router>
  );
}

export default App;
