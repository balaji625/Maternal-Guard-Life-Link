import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { db } from '../firebase';
import {
    Users, Search, Droplets, MapPin, Plus, CheckCircle, Navigation, Filter, Map, Clock, Phone
} from 'lucide-react';

const DonorNetwork = () => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('ALL DISTRICTS');
    const [showModal, setShowModal] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const [newDonor, setNewDonor] = useState({
        name: '',
        email: '',
        phone: '',
        blood_group: 'A+',
        age: '',
        hemoglobin: '',
        location_name: '',
        lat: null,
        lng: null,
        status: 'available'
    });

    useEffect(() => {
        const donorsRef = ref(db, 'donors');
        const unsub = onValue(donorsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                setDonors(list.sort((a, b) => b.timestamp - a.timestamp));
            } else {
                setDonors([]);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const districts = useMemo(() => {
        const unique = new Set(['ALL DISTRICTS']);
        donors.forEach(d => {
            if (d.location_name) unique.add(d.location_name.toUpperCase());
        });
        return Array.from(unique);
    }, [donors]);

    const filteredDonors = useMemo(() => {
        return donors.filter(d => {
            const matchesSearch =
                d.blood_group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.phone?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDistrict =
                selectedDistrict === 'ALL DISTRICTS' ||
                d.location_name?.toUpperCase() === selectedDistrict;

            return matchesSearch && matchesDistrict;
        });
    }, [donors, searchTerm, selectedDistrict]);

    const getLiveLocation = () => {
        setLocationLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (p) => {
                    setNewDonor({ ...newDonor, lat: p.coords.latitude, lng: p.coords.longitude });
                    setLocationLoading(false);
                },
                (e) => {
                    alert("GPS SIGNAL LOST: " + e.message);
                    setLocationLoading(false);
                }
            );
        } else {
            alert("GPS NOT SUPPORTED");
            setLocationLoading(false);
        }
    };

    const handleAddDonor = async (e) => {
        e.preventDefault();
        try {
            if (!newDonor.lat) {
                alert("CRITICAL: PLEASE LOCK GPS SIGNAL FIRST");
                return;
            }
            const newDRef = push(ref(db, 'donors'));
            await set(newDRef, {
                ...newDonor,
                age: parseInt(newDonor.age),
                hemoglobin: parseFloat(newDonor.hemoglobin),
                timestamp: Date.now()
            });
            setShowModal(false);
            setNewDonor({ name: '', email: '', phone: '', blood_group: 'A+', age: '', hemoglobin: '', location_name: '', lat: null, lng: null, status: 'available' });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900' }}>Life-Link Registry</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Active Clinical Blood Supply Hub • {donors.length} District Enrolled</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 36px', borderRadius: '30px' }} onClick={() => setShowModal(true)}>
                    <Plus size={24} /> New Donor Enrollment
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div className="card shadow-soft" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 25px', borderRadius: '40px' }}>
                    <Search size={24} color="var(--primary)" opacity={0.5} />
                    <input
                        type="text"
                        placeholder="Search by Bio (e.g. A+, O-), Name or Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', height: '55px', fontSize: '1.2rem', fontWeight: '500' }}
                    />
                </div>

                <div className="card shadow-soft" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 25px', borderRadius: '40px' }}>
                    <Map size={24} color="var(--primary)" opacity={0.5} />
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        style={{ border: 'none', height: '55px', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', background: 'transparent' }}
                    >
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex-center" style={{ padding: '150px', flexDirection: 'column' }}>
                    <div className="loader" style={{ width: '50px', height: '50px', borderTopColor: 'var(--primary)' }}></div>
                    <p style={{ marginTop: '20px', opacity: 0.5 }}>Loading District Registry...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' }}>
                    {filteredDonors.map(donor => (
                        <div key={donor.id} className="card animate-fade-in shadow-soft" style={{
                            borderTop: `6px solid ${donor.hemoglobin > 12.5 ? 'var(--success)' : 'var(--warning)'}`,
                            padding: '35px',
                            borderRadius: '30px',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                                <div style={{ padding: '15px', background: 'var(--background)', borderRadius: '20px' }}>
                                    <Droplets size={32} color="var(--primary)" />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px' }}>{donor.blood_group}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.5, letterSpacing: '1px' }}>VERIFIED CLASS</div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.4rem', marginBottom: '5px', fontWeight: '900' }}>{donor.name}</h3>
                            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <MapPin size={18} color="var(--error)" /> {donor.location_name}
                            </p>
                            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
                                <Phone size={18} color="var(--success)" /> {donor.phone || "No contact info"}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div className="glass-card" style={{ padding: '15px', textAlign: 'center', background: 'var(--background)' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '900', opacity: 0.6 }}>HEMOGLOBIN</div>
                                    <div style={{ fontWeight: '900', fontSize: '1.2rem', color: donor.hemoglobin > 12.5 ? 'var(--success)' : 'var(--error)' }}>{donor.hemoglobin} <span style={{ fontSize: '0.7rem' }}>g/dL</span></div>
                                </div>
                                <div className="glass-card" style={{ padding: '15px', textAlign: 'center', background: 'var(--background)' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '900', opacity: 0.6 }}>AGE</div>
                                    <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>{donor.age} <span style={{ fontSize: '0.7rem' }}>yrs</span></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #f0f0f0', paddingTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '900', color: donor.status === 'available' ? 'var(--success)' : 'var(--text-muted)' }}>
                                    <CheckCircle size={18} /> READY
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => donor.phone && window.open(`tel:${donor.phone}`)}
                                        style={{ fontSize: '0.9rem', padding: '12px', borderRadius: '50%', background: 'var(--success)', color: 'white', border: 'none', boxShadow: '0 8px 15px rgba(0, 191, 166, 0.3)' }}
                                    >
                                        <Phone size={16} />
                                    </button>
                                    <button
                                        onClick={() => donor.lat && window.open(`https://www.google.com/maps?q=${donor.lat},${donor.lng}`, '_blank')}
                                        style={{ fontSize: '0.9rem', padding: '12px 25px', borderRadius: '40px', background: 'var(--primary)', color: 'white', fontWeight: '900', border: 'none', boxShadow: '0 8px 15px rgba(255, 77, 109, 0.3)' }}
                                    >
                                        <Navigation size={16} /> GPS Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="flex-center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000 }}>
                    <div className="card animate-fade-in" style={{ maxWidth: '550px', width: '95%', padding: '50px', borderRadius: '40px' }}>
                        <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '900' }}><Droplets size={32} color="var(--primary)" /> Enroll New Donor</h2>
                        <form onSubmit={handleAddDonor} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input type="text" placeholder="Legal Full Name" required value={newDonor.name} onChange={e => setNewDonor({ ...newDonor, name: e.target.value })} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <input type="email" placeholder="Contact Email" required value={newDonor.email} onChange={e => setNewDonor({ ...newDonor, email: e.target.value })} />
                                <input type="tel" placeholder="Contact Number" required value={newDonor.phone} onChange={e => setNewDonor({ ...newDonor, phone: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                                <select value={newDonor.blood_group} onChange={e => setNewDonor({ ...newDonor, blood_group: e.target.value })} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #ddd', fontWeight: '700' }}>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <input type="number" placeholder="Age" required value={newDonor.age} onChange={e => setNewDonor({ ...newDonor, age: e.target.value })} />
                            </div>
                            <input type="number" step="0.1" placeholder="Verified HB Level (g/dL)" required value={newDonor.hemoglobin} onChange={e => setNewDonor({ ...newDonor, hemoglobin: e.target.value })} />
                            <input type="text" placeholder="Current District / City" required value={newDonor.location_name} onChange={e => setNewDonor({ ...newDonor, location_name: e.target.value })} />

                            <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid var(--accent)' }}>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '0.9rem' }}>GPS Satellite Lock</div>
                                    <div style={{ opacity: 0.5, fontSize: '0.8rem' }}>{newDonor.lat ? `${newDonor.lat.toFixed(4)}, ${newDonor.lng.toFixed(4)}` : 'Awaiting GPS lock...'}</div>
                                </div>
                                <button type="button" onClick={getLiveLocation} disabled={locationLoading} className="btn-primary flex-center" style={{ padding: '12px 20px', fontSize: '0.85rem' }}>
                                    {locationLoading ? 'Locking...' : 'Lock Live GPS'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: '60px', background: 'var(--background)', fontWeight: '700', borderRadius: '15px' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 2, height: '60px', fontWeight: '900', borderRadius: '15px' }}>Verify & Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorNetwork;
