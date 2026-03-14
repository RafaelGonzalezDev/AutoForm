'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Loader2, RotateCcw, CheckCircle, AlertCircle, Aperture, ShieldAlert } from 'lucide-react';
import { useScanner } from '@/context/ScannerContext';
import { mapOcrToFields } from '@/lib/fieldMapper';
import { useToast } from '@/context/ToastContext';

async function runTesseract(imageSource: string): Promise<string> {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('spa+eng', 1, {
        logger: () => { /* suppress logs */ },
    });
    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();
    return text;
}

type CameraState = 'live' | 'captured' | 'processing' | 'done' | 'error' | 'no-permission' | 'insecure-context';

interface ScannerCameraProps {
    onDone: () => void;
}

export default function ScannerCamera({ onDone }: ScannerCameraProps) {
    const { fields, setScannedData, setRawOcrText, setScanStatus } = useScanner();
    const { toast } = useToast();
    const webcamRef = useRef<Webcam>(null);

    const [cameraState, setCameraState] = useState<CameraState>('live');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if browser supports mediaDevices (requires Secure Context: HTTPS or Localhost)
        const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        if (!isSupported) {
            setCameraState('insecure-context');
        }
    }, []);

    const handleUserMedia = useCallback(() => {
        setHasPermission(true);
        setCameraState('live');
    }, []);

    const handleUserMediaError = useCallback((error: string | DOMException) => {
        console.error('Camera error:', error);
        setHasPermission(false);
        setCameraState('no-permission');
    }, []);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;
        setCapturedImage(imageSrc);
        setCameraState('captured');
    }, []);

    const processCapture = useCallback(async () => {
        if (!capturedImage) return;
        setCameraState('processing');
        setScanStatus('processing');

        try {
            const text = await runTesseract(capturedImage);
            setRawOcrText(text);

            let mapped;
            try {
                // Try AI mapping first
                const aiRes = await fetch('/api/ai-mapper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, fields }),
                });
                
                if (!aiRes.ok) throw new Error('AI API Error');
                mapped = await aiRes.json();
                console.log('AI Mapping Result:', mapped);
            } catch (aiErr) {
                console.warn('AI Mapping failed, falling back to heuristic:', aiErr);
                mapped = mapOcrToFields(text, fields);
            }

            setScannedData(mapped);

            setCameraState('done');
            setScanStatus('done');
            toast('Captura procesada con éxito. Revisa los campos extraídos.', 'success');
            setTimeout(onDone, 800);
        } catch (err) {
            console.error('OCR error:', err);
            setCameraState('error');
            setScanStatus('error');
            toast('Error al procesar la captura. Intenta de nuevo.', 'error');
        }
    }, [capturedImage, fields, setScannedData, setRawOcrText, setScanStatus, toast, onDone]);

    const reset = useCallback(() => {
        setCapturedImage(null);
        setCameraState('live');
        setScanStatus('idle');
    }, [setScanStatus]);

    const videoConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment', // use back camera on mobile
    };

    return (
        <div>
            {/* Live camera */}
            {(cameraState === 'live' || hasPermission === null) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000', minHeight: 300 }}>
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            screenshotQuality={0.9}
                            videoConstraints={videoConstraints}
                            onUserMedia={handleUserMedia}
                            onUserMediaError={handleUserMediaError}
                            style={{ width: '100%', display: 'block', borderRadius: 16 }}
                        />
                        
                        {/* Permission Overlay */}
                        {hasPermission === null && (
                            <div style={{ 
                                position: 'absolute', inset: 0, 
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(15,15,26,0.9)', gap: 16, padding: 20, textAlign: 'center'
                            }}>
                                <Camera size={40} style={{ color: 'var(--primary)' }} />
                                <div style={{ fontWeight: 600 }}>Solicitando cámara...</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Acepta el permiso del navegador para continuar
                                </div>
                            </div>
                        )}

                        {/* Overlay frame guide */}
                        {hasPermission === true && (
                            <div style={{
                                position: 'absolute', inset: 0, pointerEvents: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: '85%', height: '60%',
                                    border: '2px solid rgba(99,102,241,0.7)',
                                    borderRadius: 12,
                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                                }}>
                                    {/* Corner markers */}
                                    {[['top:-1px', 'left:-1px'], ['top:-1px', 'right:-1px'], ['bottom:-1px', 'left:-1px'], ['bottom:-1px', 'right:-1px']].map((pos, i) => (
                                        <div key={i} style={{
                                            position: 'absolute',
                                            width: 24, height: 24,
                                            borderColor: 'var(--primary-light)',
                                            borderStyle: 'solid',
                                            borderWidth: 0,
                                            ...(i === 0 ? { borderTopWidth: 4, borderLeftWidth: 4, top: -1, left: -1, borderRadius: '6px 0 0 0' } :
                                                i === 1 ? { borderTopWidth: 4, borderRightWidth: 4, top: -1, right: -1, borderRadius: '0 6px 0 0' } :
                                                    i === 2 ? { borderBottomWidth: 4, borderLeftWidth: 4, bottom: -1, left: -1, borderRadius: '0 0 0 6px' } :
                                                        { borderBottomWidth: 4, borderRightWidth: 4, bottom: -1, right: -1, borderRadius: '0 0 6px 0' }),
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Scan badge */}
                        {hasPermission === true && (
                            <div style={{
                                position: 'absolute', top: 12, left: 12,
                                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                                borderRadius: 99, padding: '5px 12px',
                                display: 'flex', alignItems: 'center', gap: 6,
                                fontSize: '0.75rem', color: 'white', fontWeight: 600,
                            }}>
                                <div className="animate-pulse-slow" style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                                CÁMARA ACTIVA
                            </div>
                        )}
                    </div>

                    {/* Capture button */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={capture}
                            disabled={!hasPermission}
                            style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: hasPermission ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--border)',
                                border: '4px solid rgba(255,255,255,0.1)',
                                cursor: hasPermission ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: hasPermission ? '0 8px 32px rgba(99,102,241,0.5)' : 'none',
                                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                opacity: hasPermission ? 1 : 0.5,
                            }}
                            onMouseDown={e => { if (hasPermission) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.9)'; }}
                            onMouseUp={e => { if (hasPermission) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                        >
                            <Aperture size={32} color="white" />
                        </button>
                    </div>
                </div>
            )}

            {/* No permission */}
            {hasPermission === false && (
                <div className="card animate-fade-in" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <Camera size={32} style={{ color: 'var(--danger)' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>Acceso Denegado</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 300, lineHeight: 1.5 }}>
                        Para usar esta función, debes permitir el acceso a la cámara en la configuración de tu navegador.
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button className="btn-primary" onClick={() => window.location.reload()}>
                            <RotateCcw size={16} /> Reintentar
                        </button>
                    </div>
                </div>
            )}

            {/* Insecure Context Error */}
            {cameraState === 'insecure-context' && (
                <div className="card animate-fade-in" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <ShieldAlert size={32} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>Conexión No Segura</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 320, lineHeight: 1.5 }}>
                        La cámara requiere una conexión segura (**HTTPS**) para funcionar en dispositivos móviles.
                    </div>
                    <div style={{ 
                        background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 8, fontSize: '0.8rem', 
                        color: 'var(--text-muted)', textAlign: 'left', width: '100%' 
                    }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Para solucionar:</div>
                        • Usa **HTTPS**. <br/>
                        • O prueba desde **http://localhost:3000** en tu PC. <br/>
                        • En móvil, usa **VS Code Port Forwarding**.
                    </div>
                    <button className="btn-ghost" onClick={() => window.location.reload()} style={{ marginTop: 8 }}>
                        <RotateCcw size={14} /> Reintentar
                    </button>
                </div>
            )}

            {/* Captured preview */}
            {cameraState === 'captured' && capturedImage && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={capturedImage} alt="Captura" style={{ width: '100%', borderRadius: 16, objectFit: 'contain', maxHeight: 380 }} />
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button className="btn-ghost" onClick={reset} style={{ gap: 6 }}>
                            <RotateCcw size={15} /> Recapturar
                        </button>
                        <button className="btn-primary" onClick={processCapture}>
                            <Camera size={15} /> Procesar Captura
                        </button>
                    </div>
                </div>
            )}

            {/* Processing */}
            {cameraState === 'processing' && (
                <div className="card animate-fade-in" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                    <Loader2 size={40} className="animate-spin-slow" style={{ color: 'var(--primary-light)' }} />
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>Reconociendo texto...</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aplicando OCR a la imagen capturada</div>
                </div>
            )}

            {/* Done */}
            {cameraState === 'done' && (
                <div className="card animate-fade-in" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                    <CheckCircle size={42} style={{ color: 'var(--success)' }} />
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>¡Captura procesada!</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Redirigiendo al formulario...</div>
                </div>
            )}

            {/* Error */}
            {cameraState === 'error' && (
                <div className="card animate-fade-in" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                    <AlertCircle size={42} style={{ color: 'var(--danger)' }} />
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>Error al procesar</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Asegúrate de que el texto sea legible.</div>
                    <button className="btn-ghost" onClick={reset}><RotateCcw size={14} /> Intentar de nuevo</button>
                </div>
            )}
        </div>
    );
}
