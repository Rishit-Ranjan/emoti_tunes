import React, { useRef, useState, useEffect, useCallback } from 'react';

const CameraView = ({ onCapture, onClose, onError }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [countdown, setCountdown] = useState(null);

    const startCamera = useCallback(async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            onError("Could not access camera. Please check permissions.");
        }
    }, [onError]);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (isCapturing) return;
        setIsCapturing(true);
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    executeCapture();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const executeCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-[#0a0a12]/95 backdrop-blur-3xl" onClick={onClose}></div>
            
            <div className="relative w-full max-w-4xl aspect-video bg-[#12121e] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.3)] border border-violet-500/20 flex flex-col group">
                {/* Video Feed */}
                <div className="relative flex-1 bg-black">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover transition-all duration-700 ${isCapturing && !countdown ? 'brightness-150 scale-105' : ''}`}
                    />
                    
                    {/* UI Overlays */}
                    <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
                        <div className="flex justify-between items-start">
                            <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center space-x-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Emotion Feed</span>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-12 h-12 rounded-2xl bg-black/40 hover:bg-red-500/20 text-white backdrop-blur-xl transition-all border border-white/10 pointer-events-auto flex items-center justify-center group/btn"
                            >
                                <svg className="w-6 h-6 group-hover/btn:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>

                        {countdown && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-9xl md:text-[15rem] font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] animate-ping">{countdown}</span>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <div className="bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-violet-500/30 text-white flex items-center space-x-4">
                                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Position face in center</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="h-28 bg-[#12121e] border-t border-white/5 flex items-center justify-center px-10 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-cyan-500/5 pointer-events-none"></div>
                    
                    <button 
                        onClick={capturePhoto}
                        disabled={isCapturing}
                        className="w-20 h-20 rounded-full bg-white p-1 hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:scale-100 group/shutter"
                    >
                        <div className="w-full h-full rounded-full border-4 border-black group-hover/shutter:border-violet-600 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 bg-black rounded-full transition-all group-hover/shutter:scale-75"></div>
                        </div>
                    </button>

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>
        </div>
    );
};

export default CameraView;
