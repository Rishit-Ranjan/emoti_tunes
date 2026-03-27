import React, { useState, useEffect, useRef } from 'react';

const PlaylistDisplay = ({ playlist, emotion, onReset }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [player, setPlayer] = useState(null);
    const playerRef = useRef(null);

    const currentSong = playlist[currentIndex];

    // Load YouTube API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            initPlayer();
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    const initPlayer = () => {
        if (playerRef.current) return;
        
        playerRef.current = new window.YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: currentSong?.youtubeId || '',
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': (event) => {
                    setPlayer(event.target);
                    setDuration(event.target.getDuration());
                },
                'onStateChange': (event) => {
                    // 1 = playing, 2 = paused, 0 = ended
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        setIsPlaying(true);
                        setDuration(event.target.getDuration());
                    } else if (event.data === window.YT.PlayerState.PAUSED) {
                        setIsPlaying(false);
                    } else if (event.data === window.YT.PlayerState.ENDED) {
                        handleNext();
                    }
                }
            }
        });
    };

    // Update song when currentIndex changes
    useEffect(() => {
        if (player && currentSong?.youtubeId) {
            player.loadVideoById(currentSong.youtubeId);
            setIsPlaying(true);
        }
    }, [currentIndex, player]);

    // Update Progress
    useEffect(() => {
        let interval;
        if (isPlaying && player) {
            interval = setInterval(() => {
                const time = player.getCurrentTime();
                setCurrentTime(time);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, player]);

    const togglePlayPause = () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const handleNext = () => {
        if (currentIndex < playlist.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsPlaying(false);
        }
    };
    
    const handlePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        setCurrentTime(time);
        if (player) player.seekTo(time, true);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const getAlbumArt = (song, idx) => {
        return `https://picsum.photos/seed/${encodeURIComponent(song.title + idx)}/300/300`;
    };

    return (
    <div className="flex-1 w-full h-full bg-[#0a0a12] flex flex-col font-sans text-violet-200/50 overflow-hidden animate-in fade-in duration-700 relative">
        
        {/* Hidden YT Container */}
        <div id="youtube-player" className="hidden"></div>

        {/* Main Area */}
        <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
            <div className={`pt-32 pb-12 px-8 bg-gradient-to-b ${emotion.gradient} to-[#0a0a12]/0 flex items-end space-x-8 relative`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl pointer-events-none"></div>
                
                <div className="w-56 h-56 md:w-64 md:h-64 shadow-[0_30px_80px_rgba(0,0,0,0.8)] bg-[#1a1a2e] relative z-10 flex-shrink-0 group overflow-hidden rounded-3xl border border-white/10">
                    <img 
                        src={getAlbumArt(currentSong || {title: 'Playlist'}, 99)} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                </div>

                <div className="relative z-10">
                    <p className="uppercase text-xs font-black tracking-[0.4em] text-white/70 mb-3 drop-shadow-lg">Generated Vibe</p>
                    <h1 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">{emotion.name}</h1>
                    <div className="flex items-center space-x-3 text-sm font-black text-white/90">
                        <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center p-1"><img src="/logo.png" className="w-full h-full rounded-full" alt="" /></div>
                        <span className="hover:underline cursor-pointer uppercase tracking-widest">EmotiTunes</span>
                        <span className="opacity-50 tracking-widest">• {playlist.length} TRACKS</span>
                    </div>
                </div>
            </div>

            <div className="px-8 bg-gradient-to-b from-black/40 to-[#0a0a12] pt-8 min-h-screen">
                <div className="flex items-center space-x-10 mb-10">
                    <button 
                        onClick={togglePlayPause} 
                        className="w-16 h-16 rounded-2xl bg-violet-600 hover:bg-violet-500 hover:rotate-3 transition-all text-white flex items-center justify-center shadow-[0_15px_40px_rgba(139,92,246,0.5)] active:scale-90"
                    >
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>

                    <button className="text-violet-200/40 hover:text-cyan-400 transition-all hover:scale-110">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                </div>

                <div className="grid grid-cols-[30px_1fr_1fr] md:grid-cols-[30px_4fr_3fr_1fr] gap-6 px-6 py-4 border-b border-white/5 text-[10px] font-black tracking-[0.3em] text-violet-300/30 uppercase mb-6">
                    <div className="text-center font-normal">#</div>
                    <div>Title</div>
                    <div className="hidden md:block">Album</div>
                    <div className="text-right"><svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3"/></svg></div>
                </div>

                <div className="space-y-2 mb-20 px-2">
                    {playlist.map((song, index) => {
                        const isCurrentlyPlaying = index === currentIndex;
                        return (
                            <div 
                                key={index} 
                                onClick={() => setCurrentIndex(index)} 
                                className={`group grid grid-cols-[30px_1fr_1fr] md:grid-cols-[30px_4fr_3fr_1fr] gap-6 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer items-center border border-transparent hover:border-violet-500/10 ${isCurrentlyPlaying ? 'bg-violet-600/10 border-violet-500/20 shadow-xl' : ''}`}
                            >
                                <div className="text-center">
                                    {isCurrentlyPlaying && isPlaying ? (
                                        <div className="flex justify-center space-x-0.5 h-3">
                                            <div className="w-0.5 bg-cyan-400 animate-bounce delay-75"></div>
                                            <div className="w-0.5 bg-violet-400 animate-bounce delay-150"></div>
                                            <div className="w-0.5 bg-cyan-400 animate-bounce delay-0"></div>
                                        </div>
                                    ) : (
                                        <span className={`text-xs font-black ${isCurrentlyPlaying ? 'text-cyan-400' : 'text-violet-200/20 group-hover:hidden'}`}>{index + 1}</span>
                                    )}
                                    {!isCurrentlyPlaying && (
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-violet-400 hidden group-hover:block mx-auto"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                </div>
                                <div className="flex items-center min-w-0">
                                    <div className="w-12 h-12 bg-[#1a1a2e] flex-shrink-0 mr-5 rounded-xl shadow-lg overflow-hidden group-hover:rotate-3 transition-transform">
                                        <img src={getAlbumArt(song, index)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="truncate">
                                        <div className={`font-black text-lg truncate tracking-tight ${isCurrentlyPlaying ? 'text-cyan-400' : 'text-white'}`}>{song.title}</div>
                                        <div className="text-xs font-bold text-violet-300/40 group-hover:text-violet-200 truncate uppercase tracking-widest mt-0.5">{song.artist}</div>
                                    </div>
                                </div>
                                <div className="hidden md:block text-sm font-bold text-violet-300/30 group-hover:text-violet-200 truncate italic">
                                    {song.title} Instrumental
                                </div>
                                <div className="text-right text-xs font-black text-violet-300/20 group-hover:text-white tabular-nums">
                                    3:42
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        
        {/* Bottom Player Controller */}
        <div className="fixed bottom-3 left-3 right-3 h-24 bg-[#12121e]/80 backdrop-blur-3xl border border-white/5 rounded-3xl px-8 flex items-center justify-between z-50 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex-[0.3] flex items-center min-w-0">
                <div className="w-16 h-16 bg-[#1a1a2e] flex-shrink-0 mr-5 rounded-2xl shadow-xl overflow-hidden group relative">
                    <img src={getAlbumArt(currentSong || {}, currentIndex)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="truncate pr-6">
                    <div className="text-white text-base font-black hover:text-cyan-400 cursor-pointer truncate transition-colors uppercase tracking-tight">{currentSong?.title}</div>
                    <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mt-1 truncate">{currentSong?.artist}</div>
                </div>
                <button className="text-violet-200/20 hover:text-pink-500 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>
            </div>

            <div className="flex-[0.4] flex flex-col items-center">
                <div className="flex items-center space-x-10 mb-2">
                    <button onClick={handlePrev} className="text-violet-200/20 hover:text-white disabled:opacity-10 transition-all active:scale-75" disabled={currentIndex === 0}>
                        <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M3.3 1a.7.7 0 01.7.7v5.15l9.95-5.744a.7.7 0 011.05.606v12.575a.7.7 0 01-1.05.607L4 9.149V14.3a.7.7 0 01-1.4 0V1.7a.7.7 0 01.7-.7z"/></svg>
                    </button>
                    
                    <button 
                        onClick={togglePlayPause} 
                        className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl"
                    >
                        {isPlaying ? (
                            <svg fill="currentColor" viewBox="0 0 16 16" className="w-6 h-6"><path fillRule="evenodd" d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z"/></svg>
                        ) : (
                            <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5 ml-1"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/></svg>
                        )}
                    </button>

                    <button onClick={handleNext} className="text-violet-200/20 hover:text-white disabled:opacity-10 transition-all active:scale-75" disabled={currentIndex === playlist.length - 1}>
                        <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M12.7 1a.7.7 0 00-.7.7v5.15L2.05 1.107A.7.7 0 001 1.712v12.575a.7.7 0 001.05.607L12 9.149V14.3a.7.7 0 001.4 0V1.7a.7.7 0 00-.7-.7z"/></svg>
                    </button>
                </div>
                
                <div className="w-full flex items-center space-x-4 text-[10px] font-black tracking-widest text-violet-300/30 group">
                    <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max={duration || 210} 
                        value={currentTime || 0} 
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-violet-500 overflow-hidden" 
                        style={{ backgroundSize: `${(currentTime / (duration || 210)) * 100}% 100%`, backgroundImage: 'linear-gradient(#8b5cf6, #8b5cf6)', backgroundRepeat: 'no-repeat' }}
                    />
                    <span className="w-10 text-left tabular-nums">{formatTime(duration)}</span>
                </div>
            </div>

            <div className="flex-[0.3] flex justify-end items-center text-violet-200/20 space-x-6">
                <svg className="w-5 h-5 hover:text-cyan-400 cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M11 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm-6 3a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5zm3-2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5z"/></svg>
                <div className="flex items-center space-x-3 group w-36">
                    <svg className="w-5 h-5 group-hover:text-cyan-400" fill="currentColor" viewBox="0 0 16 16"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/></svg>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600 w-[70%] shadow-[0_0_10px_rgba(139,92,246,1)]"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default PlaylistDisplay;
