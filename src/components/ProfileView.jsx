import React from 'react';

const ProfileView = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-indigo-900/40 to-[#0a0a12] animate-in fade-in duration-700">
            <div className="pt-32 pb-12 px-8 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Image with Ring */}
                <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 p-1 shadow-[0_20px_60px_rgba(139,92,246,0.3)]">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rishit%20Ranjan`} 
                        alt="Profile" 
                        className="w-full h-full rounded-[20px] bg-[#1a1a2e]"
                    />
                </div>
                
                <div className="text-center md:text-left">
                    <p className="uppercase text-xs font-black tracking-[0.3em] text-cyan-400 mb-2">Authenticated User</p>
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">Rishit Ranjan</h1>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-bold text-violet-200/60">
                        <span className="bg-violet-600/20 text-violet-400 px-3 py-1 rounded-full border border-violet-500/20">Pro Member</span>
                        <span>• 4 Public Playlists</span>
                        <span>• 127 Songs Liked</span>
                    </div>
                </div>
            </div>

            <div className="px-8 space-y-12 pb-24">
                {/* Stats Grid */}
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Mood Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1a1a2e]/50 p-8 rounded-3xl border border-white/5 hover:border-violet-500/30 transition-all">
                            <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Most Listened Mood</p>
                            <p className="text-3xl font-black text-white uppercase tracking-tight">Focus & Chill</p>
                        </div>
                        <div className="bg-[#1a1a2e]/50 p-8 rounded-3xl border border-white/5 hover:border-violet-500/30 transition-all">
                            <p className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">Listening Time</p>
                            <p className="text-3xl font-black text-white uppercase tracking-tight">42.5 Hours</p>
                        </div>
                        <div className="bg-[#1a1a2e]/50 p-8 rounded-3xl border border-white/5 hover:border-violet-500/30 transition-all">
                            <p className="text-xs font-black text-pink-400 uppercase tracking-widest mb-2">Mood Accuracy</p>
                            <p className="text-3xl font-black text-white uppercase tracking-tight">94% Positive</p>
                        </div>
                    </div>
                </div>

                {/* Top Artists */}
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Frequent Artists</h3>
                    <div className="flex space-x-8 overflow-x-auto pb-6 scrollbar-hide">
                        {[
                            { name: "The Weeknd", id: "artist1" },
                            { name: "Dua Lipa", id: "artist2" },
                            { name: "Post Malone", id: "artist3" },
                            { name: "Billie Eilish", id: "artist4" },
                            { name: "Drake", id: "artist5" }
                        ].map((artist) => (
                            <div key={artist.id} className="flex-shrink-0 group cursor-pointer text-center w-32">
                                <div className="w-32 h-32 rounded-2xl bg-[#1a1a2e] border border-white/5 mb-4 overflow-hidden shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3 group-hover:border-violet-500/50">
                                    <img 
                                        src={`https://picsum.photos/seed/${artist.id}/150/150`} 
                                        alt={artist.name} 
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                </div>
                                <p className="text-sm font-black text-white truncate uppercase tracking-tight">{artist.name}</p>
                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mt-1">Pop / R&B</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
