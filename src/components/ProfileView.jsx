import React, { useState } from 'react';

const ProfileView = ({ currentVibe: initialVibe = "Joy" }) => {
    const [viewVibe, setViewVibe] = useState(initialVibe);
    const [activeTab, setActiveTab] = useState('profile'); 
    const [showMoodToggle, setShowMoodToggle] = useState(false);
    
    const themeMap = {
        'Joy': 'from-yellow-600/20 to-[#0a0a12] text-yellow-400 border-yellow-500/30 ring-yellow-400',
        'Sadness': 'from-blue-600/20 to-[#0a0a12] text-blue-400 border-blue-500/30 ring-blue-400',
        'Anger': 'from-red-600/20 to-[#0a0a12] text-red-400 border-red-500/30 ring-red-400',
        'Peaceful': 'from-emerald-600/20 to-[#0a0a12] text-emerald-400 border-emerald-500/30 ring-emerald-400',
        'Melancholy': 'from-violet-600/20 to-[#0a0a12] text-violet-400 border-violet-500/30 ring-violet-400',
        'Excitement': 'from-orange-600/20 to-[#0a0a12] text-orange-400 border-orange-500/30 ring-orange-400'
    };

    const currentTheme = themeMap[viewVibe] || themeMap['Joy'];

    const radarStats = [
        { label: 'Energy', val: 85 },
        { label: 'Positivity', val: 92 },
        { label: 'Depth', val: 65 },
        { label: 'Calm', val: 40 },
        { label: 'Intensity', val: 75 }
    ];

    return (
        <div className={`flex-1 overflow-y-auto bg-gradient-to-b ${currentTheme.split(' ')[0]} to-[#0a0a12] animate-in fade-in duration-700`}>
            {/* Header */}
            <div className="pt-32 pb-12 px-8 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative group">
                    <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-700">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rishit%20Ranjan`} 
                            alt="" 
                            className="w-full h-full rounded-[20px] bg-[#1a1a2e]"
                        />
                    </div>
                </div>
                
                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                         <p className="uppercase text-xs font-black tracking-[0.3em] text-cyan-400">Genius Tier Member</p>
                         <div className="flex items-center justify-center md:justify-start space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Aura Analysis: Balanced</span>
                         </div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">Rishit Ranjan</h1>
                    
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Member Since</p>
                                <p className="text-sm font-bold text-violet-200">March 2024</p>
                            </div>
                            
                            {/* Mood Ring Indicator */}
                            <div className="flex items-center space-x-4 p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl group/ring">
                                <div className="relative w-8 h-8">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 via-cyan-400 to-emerald-400 animate-spin-slow opacity-80 group-hover/ring:opacity-100 transition-opacity"></div>
                                    <div className="absolute inset-1 rounded-full bg-gradient-to-bl from-pink-500 via-orange-400 to-yellow-300 animate-reverse-spin-slow opacity-80 group-hover/ring:opacity-100 transition-opacity"></div>
                                    <div className="absolute inset-2 rounded-full bg-[#0a0a12]"></div>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Current State</p>
                                    <p className={`text-xs font-black uppercase tracking-widest ${currentTheme.split(' ')[2]}`}>{viewVibe} Loop</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-16 w-px bg-white/5 hidden md:block"></div>

                        <div className="flex space-x-4">
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Playlists</p>
                                <p className="text-2xl font-black text-white">24</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Genius Score</p>
                                <p className="text-2xl font-black text-white text-cyan-400">98</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-3">
                    <button 
                        onClick={() => setShowMoodToggle(!showMoodToggle)}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all border border-white/10 backdrop-blur-xl"
                    >
                        Change Status
                    </button>
                    {showMoodToggle && (
                        <div className="flex gap-2 p-2 bg-black/40 backdrop-blur-3xl rounded-xl border border-white/5 animate-in slide-in-from-top-2">
                            {Object.keys(themeMap).map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => setViewVibe(m)}
                                    className={`w-6 h-6 rounded-full cursor-pointer hover:scale-125 transition-transform border-2 ${viewVibe === m ? 'border-white' : 'border-transparent'} ${
                                        m === 'Joy' ? 'bg-yellow-400' : 
                                        m === 'Sadness' ? 'bg-blue-400' : 
                                        m === 'Anger' ? 'bg-red-400' : 
                                        m === 'Peaceful' ? 'bg-emerald-400' : 
                                        m === 'Melancholy' ? 'bg-violet-400' : 'bg-orange-400'
                                    }`}
                                ></button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="px-8 mt-12 pb-24">
                <div className="flex space-x-12 border-b border-white/5 mb-10 overflow-x-auto scrollbar-hide">
                    {['profile', 'emotional'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                            {tab === 'profile' ? 'Artist Affinity' : 'Emotional Profile'}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>}
                        </button>
                    ))}
                </div>

                {activeTab === 'profile' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Frequent Artists</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="aspect-square rounded-3xl bg-[#12121e] border border-white/5 mb-4 overflow-hidden shadow-2xl transition-all group-hover:scale-105 group-hover:rotate-2 group-hover:border-violet-500/50">
                                        <img src={`https://picsum.photos/seed/artist${i}/300/300`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                                    </div>
                                    <p className="text-sm font-black text-white uppercase tracking-tight truncate">Artist {i}</p>
                                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mt-1">Vibe Match 9{i}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Radar Chart */}
                        <div className="bg-[#12121e]/50 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center">
                                <span className="w-8 h-8 bg-violet-600 rounded-lg mr-4 flex items-center justify-center text-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></span>
                                Energy Distribution
                            </h3>
                            <div className="flex justify-center relative py-4">
                                <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-2xl">
                                    {[0.2, 0.4, 0.6, 0.8, 1].map(r => (
                                        <circle key={r} cx="100" cy="100" r={80 * r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                    ))}
                                    {radarStats.map((s, i) => {
                                        const angle = (i * 2 * Math.PI) / radarStats.length - Math.PI / 2;
                                        return <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos(angle)} y2={100 + 80 * Math.sin(angle)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
                                    })}
                                    <polygon 
                                        points={radarStats.map((s, i) => {
                                            const angle = (i * 2 * Math.PI) / radarStats.length - Math.PI / 2;
                                            const r = 80 * (s.val / 100);
                                            return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                                        }).join(' ')}
                                        fill="rgba(139, 92, 246, 0.3)"
                                        stroke="#8b5cf6"
                                        strokeWidth="3"
                                        className="animate-pulse"
                                    />
                                </svg>
                                {radarStats.map((s, i) => {
                                    const angle = (i * 2 * Math.PI) / radarStats.length - Math.PI / 2;
                                    return (
                                        <div key={i} className="absolute text-[10px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap" style={{ 
                                            left: `${50 + 55 * Math.cos(angle)}%`, 
                                            top: `${50 + 55 * Math.sin(angle)}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}>{s.label}</div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent States */}
                        <div className="space-y-8">
                            <div className="bg-[#12121e]/50 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-6">Mood Trajectory</h4>
                                <div className="space-y-4">
                                    {[
                                        { mood: 'Dynamic', time: '2 mins ago', color: 'bg-yellow-500' },
                                        { mood: 'Focused', time: '15 mins ago', color: 'bg-cyan-500' },
                                        { mood: 'Melancholic', time: '1 hour ago', color: 'bg-indigo-500' },
                                        { mood: 'Energetic', time: '3 hours ago', color: 'bg-orange-500' }
                                    ].map((h, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-3 h-3 rounded-full ${h.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}></div>
                                                <span className="font-bold text-white uppercase text-xs tracking-widest">{h.mood}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{h.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-violet-600 to-indigo-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Sonic DNA</h4>
                                <p className="text-violet-100/60 text-sm font-bold leading-relaxed uppercase tracking-wide">Your acoustic fingerprint suggests a preference for high-valence electronica with heavy bass profiles.</p>
                                <button className="mt-6 bg-white text-violet-900 font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-transform">Download Report</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileView;
