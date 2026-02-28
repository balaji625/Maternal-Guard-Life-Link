import React, { useState, useRef } from 'react';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { db, auth } from '../firebase';
import { predictRisk } from '../services/api';
import emailjs from 'emailjs-com';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
    Activity,
    Info,
    AlertCircle,
    BarChart2,
    Download,
    FileText,
    CheckCircle,
    Send
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const RiskPrediction = () => {
    const [formData, setFormData] = useState({
        Age: '',
        ageUnit: 'years',
        SystolicBP: '',
        DiastolicBP: '',
        BS: '',
        BodyTemp: '',
        HeartRate: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [emailSent, setEmailSent] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const reportRef = useRef();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError(null);
        setEmailSent(false);

        try {
            let finalAge = parseFloat(formData.Age);
            if (formData.ageUnit === 'months') {
                finalAge = finalAge / 12;
            }

            const predictionData = {
                ...formData,
                Age: finalAge
            };

            const data = await predictRisk(predictionData);
            setResult(data);

            // STORE IN REALTIME DATABASE (Path: predictions/userId/predictionId)
            if (auth.currentUser) {
                const predictionsRef = ref(db, `predictions/${auth.currentUser.uid}`);
                const newPredictionRef = push(predictionsRef);
                await set(newPredictionRef, {
                    vitals: { ...formData, calculatedAge: finalAge },
                    risk_level: data.risk_level,
                    confidence: data.confidence,
                    timestamp: Date.now(),
                    userEmail: auth.currentUser.email
                });

                // Also store/update user profile meta
                await set(ref(db, `users/${auth.currentUser.uid}/profile`), {
                    name: auth.currentUser.displayName,
                    email: auth.currentUser.email,
                    lastPrediction: data.risk_level,
                    lastUpdated: Date.now()
                });
            }

            // AUTO EMAIL FOR ALL RISKS - FAST TRIGGER
            sendRiskEmail(data);

        } catch (err) {
            console.error(err);
            setError("AI Prediction error. Please verify backend.");
        } finally {
            setLoading(false);
        }
    };

    const sendRiskEmail = (predictionData) => {
        const templateParams = {
            to_name: auth.currentUser?.displayName || "Health Worker",
            to_email: auth.currentUser?.email,
            risk_level: predictionData.risk_level,
            confidence: `${predictionData.confidence}%`,
            details: `Automated Health Report: Risk is ${predictionData.risk_level}. Top indicator: ${predictionData.top_feature}. Please download the full report for details.`
        };

        emailjs.send(
            'service_qvr20bd',
            'template_pt4yib6',
            templateParams,
            'aSiKP7rbqoKlXXhUC'
        ).then(() => {
            setEmailSent(true);
        }).catch(err => console.error('Email Fail:', err));
    };

    const downloadPDF = async () => {
        setIsPrinting(true);
        const element = reportRef.current;

        // Wait for state update and re-render
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(element, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight
                });

                const imgData = canvas.toDataURL('image/png', 1.0);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
                pdf.save(`Clinical_Report_${new Date().getTime()}.pdf`);
            } catch (err) {
                console.error("PDF Export Error:", err);
            } finally {
                setIsPrinting(false);
            }
        }, 100);
    };

    const importanceData = result ? Object.entries(result.feature_importance).map(([name, value]) => ({
        name,
        value: parseFloat((value * 100).toFixed(2))
    })).sort((a, b) => b.value - a.value) : [];

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
            <div className="card" style={{ border: '1px solid var(--secondary)', height: 'fit-content' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                    <Activity color="var(--primary)" size={32} />
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }}>Clinical Assessment</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', alignItems: 'end' }}>
                        <InputGroup label="Age (0-150)" name="Age" min="0" max="150" value={formData.Age} onChange={handleChange} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <select name="ageUnit" value={formData.ageUnit} onChange={handleChange} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                                <option value="years">Years</option>
                                <option value="months">Months</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid-2">
                        <InputGroup label="Sys BP" name="SystolicBP" value={formData.SystolicBP} onChange={handleChange} />
                        <InputGroup label="Dia BP" name="DiastolicBP" value={formData.DiastolicBP} onChange={handleChange} />
                    </div>
                    <InputGroup label="BS (Sugar)" name="BS" value={formData.BS} onChange={handleChange} />
                    <div className="grid-2">
                        <InputGroup label="Temp" name="BodyTemp" value={formData.BodyTemp} onChange={handleChange} />
                        <InputGroup label="Pulse" name="HeartRate" value={formData.HeartRate} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ height: '55px', marginTop: '10px' }}>
                        {loading ? 'AI Processing ( < 2s )...' : 'Run AI Analysis'}
                    </button>
                </form>
            </div>

            <div className={`card ${isPrinting ? 'print-mode' : ''}`} ref={reportRef} style={{
                border: isPrinting ? 'none' : '2px solid var(--secondary)',
                minHeight: '550px',
                backgroundColor: '#ffffff',
                color: '#000000',
                opacity: 1
            }}>
                {!result && !loading && (
                    <div className="flex-center" style={{ height: '100%', flexDirection: 'column', opacity: 0.5 }}>
                        <FileText size={80} style={{ marginBottom: '20px' }} />
                        <h3>Medical AI Laboratory</h3>
                        <p>Ready to analyze patient markers.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex-center" style={{ height: '100%', flexDirection: 'column' }}>
                        <div className="loader" style={{ width: '50px', height: '50px', borderTopColor: 'var(--primary)' }}></div>
                        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Analyzing Vitals Dynamicly...</p>
                    </div>
                )}

                {result && (
                    <div className={isPrinting ? "" : "animate-fade-in"} style={{ padding: isPrinting ? '30px' : '0', background: '#FFF', opacity: 1 }}>
                        {isPrinting && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '5px solid #D00045', paddingBottom: '20px', opacity: 1 }}>
                                <div>
                                    <h1 style={{ color: '#D00045', margin: 0, fontSize: '3rem', fontWeight: '900' }}>MATERNAL-GUARD</h1>
                                    <p style={{ fontWeight: '900', color: '#000000', fontSize: '1.1rem', marginTop: '5px' }}>Clinical AI Assessment Unit • Registry #AI-{new Date().getTime().toString().slice(-6)}</p>
                                </div>
                                <Activity size={60} color="#D00045" />
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: isPrinting ? 'none' : '2px solid var(--primary)', paddingBottom: isPrinting ? '0' : '15px', marginBottom: '30px', opacity: 1 }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#000000' }}>Clinical Analysis Report</h2>
                            {!isPrinting && (
                                <button onClick={downloadPDF} className="btn-primary" style={{ padding: '12px 25px', borderRadius: '30px', fontSize: '1rem' }}>
                                    <Download size={18} /> Export High-Contrast PDF
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            <ReportBox label="Risk Level" value={result.risk_level} color={`risk-${result.risk_level.split(' ')[0].toLowerCase()}`} isPrinting={isPrinting} />
                            <ReportBox label="AI Confidence" value={`${result.confidence}%`} isPrinting={isPrinting} />
                            <ReportBox label="Email Alert" value={emailSent ? "Verified" : "Syncing"} color={emailSent ? "risk-low" : "risk-high"} isPrinting={isPrinting} />
                        </div>

                        {isPrinting && (
                            <div style={{ marginBottom: '40px', background: '#F0F2F5', padding: '30px', borderRadius: '25px', border: '2px solid #000000', opacity: 1 }}>
                                <h4 style={{ marginBottom: '20px', fontWeight: '950', color: '#000000', fontSize: '1.2rem', textTransform: 'uppercase' }}>Patient Vitals Snapshot</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                                    <div><label style={{ color: '#333333', fontSize: '0.8rem', fontWeight: '900' }}>BP (SYS/DIA)</label><div style={{ fontWeight: '950', fontSize: '1.3rem', color: '#000000' }}>{formData.SystolicBP}/{formData.DiastolicBP}</div></div>
                                    <div><label style={{ color: '#333333', fontSize: '0.8rem', fontWeight: '900' }}>BLOOD SUGAR</label><div style={{ fontWeight: '950', fontSize: '1.3rem', color: '#000000' }}>{formData.BS} mmol/L</div></div>
                                    <div><label style={{ color: '#333333', fontSize: '0.8rem', fontWeight: '900' }}>TEMP / PULSE</label><div style={{ fontWeight: '950', fontSize: '1.3rem', color: '#000000' }}>{formData.BodyTemp}°F / {formData.HeartRate} bpm</div></div>
                                </div>
                            </div>
                        )}

                        <div style={{ height: '350px', marginBottom: '40px', background: '#FFFFFF', padding: isPrinting ? '20px' : '0', borderRadius: '20px', border: isPrinting ? '2px solid #000' : 'none', opacity: 1 }}>
                            <h4 style={{ marginBottom: '20px', fontWeight: '950', color: '#000000', fontSize: '1.2rem', textTransform: 'uppercase' }}>Feature Variance Distribution</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={importanceData} layout="vertical">
                                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 13, fontWeight: 900, fill: '#000000' }} axisLine={false} />
                                    <XAxis type="number" hide />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={35}>
                                        {importanceData.map((e, i) => <Cell key={i} fill={i === 0 ? '#BF0000' : '#333333'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{
                            padding: '35px',
                            background: isPrinting ? '#FFEBEF' : 'var(--primary-light)',
                            borderLeft: '12px solid #D00045',
                            borderRadius: '20px',
                            border: isPrinting ? '2px solid #000' : 'none',
                            opacity: 1
                        }}>
                            <h4 style={{ marginBottom: '15px', color: '#D00045', fontWeight: '950', fontSize: '1.3rem' }}>Clinical Summary</h4>
                            <p style={{ fontSize: '1.1rem', color: '#000000', lineHeight: '1.7', fontWeight: '700' }}>
                                AI surveillance identifies the patient as <strong style={{ color: '#BF0000', fontSize: '1.2rem' }}>{result.risk_level.toUpperCase()}</strong>.
                                High variance detected in <strong>{result.top_feature}</strong>. Automated clinical alerts have been dispatched to the registered mobile hub.
                            </p>
                        </div>

                        {isPrinting && (
                            <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.9rem', color: '#000000', fontWeight: '900', borderTop: '2px solid #000', paddingTop: '25px', opacity: 1 }}>
                                OFFICIAL LIFE-LINK CLINICAL REPORT • CONFIDENTIAL • {new Date().toLocaleString()}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ReportBox = ({ label, value, color, isPrinting }) => (
    <div style={{
        padding: '25px',
        background: isPrinting ? '#FFFFFF' : 'var(--background)',
        borderRadius: '25px',
        textAlign: 'center',
        border: isPrinting ? '3px solid #000000' : '1px solid transparent',
        boxShadow: isPrinting ? 'none' : 'var(--shadow-sm)',
        opacity: 1
    }}>
        <p style={{ fontSize: '0.9rem', fontWeight: '950', color: '#000000', marginBottom: '10px', textTransform: 'uppercase', opacity: 1 }}>{label}</p>
        <div style={{ fontWeight: '1000', fontSize: '1.8rem', color: isPrinting ? '#BF0000' : 'inherit', opacity: 1 }}>{value}</div>
    </div>
);

const InputGroup = ({ label, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: '800' }}>{label}</label>
        <input type="number" step="any" required {...props} style={{ padding: '12px', borderRadius: '10px' }} />
    </div>
);

export default RiskPrediction;
