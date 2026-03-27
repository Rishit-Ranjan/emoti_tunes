import React from 'react';

const LibraryView = ({ playlists, onSelectPlaylist }) => {
    return (
        <div className="flex-1 overflow-y-auto bg-[#0a0a12] animate-in fade-in duration-700">
            <div className="pt-32 pb-12 px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
                    <div>
                        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none mb-4 drop-shadow-2xl">Your Library</h2>
                        <div className="flex items-center space-x-3 text-cyan-400 font-bold uppercase tracking-[0.2em] text-xs">
                           <span className="w-8 h-1 bg-cyan-600 rounded-full"></span>
                           <span>{playlists.length} Saved Vibe Collections</span>
                        </div>
                    </div>
                </div>

                {playlists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Your library is empty</h3>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2 leading-relaxed">Generated playlists will appear here for quick access</p>
                        </div>
                        <button className="bg-violet-600 hover:bg-violet-500 text-white font-black px-10 py-4 rounded-full uppercase tracking-[0.2em] text-xs transition-all shadow-[0_15px_40px_rgba(139,92,246,0.3)]">Create First Vibe</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {playlists.map((pl) => (
                            <div 
                                key={pl.id} 
                                onClick={() => onSelectPlaylist(pl)}
                                className="group bg-[#12121e] p-6 rounded-[2.5rem] hover:bg-[#1a1a2e] transition-all cursor-pointer shadow-xl border border-white/5 hover:border-violet-500/30 active:scale-95"
                            >
                                <div className="w-full aspect-square rounded-3xl mb-6 shadow-2xl relative overflow-hidden bg-[#0a0a12]">
                                    <img 
                                        src={`https://picsum.photos/seed/${pl.name}/400/400`} 
                                        alt={pl.name} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-br ${pl.emotion?.gradient || 'from-violet-500/10 to-[#0a0a12]'} opacity-40`}></div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-16 h-16 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    </div>

                                    {/* Mood Badge */}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-[8px] font-black text-white uppercase tracking-[0.2em]">
                                        {pl.emotion?.name || 'Vibe'}
                                    </div>
                                </div>
                                <h3 className="font-black text-white uppercase tracking-tight text-xl truncate leading-none mb-2">{pl.name}</h3>
                                <p className="text-[10px] font-black text-violet-300/30 uppercase tracking-[0.2em]">{pl.songs.length} Track Collection</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryView;
