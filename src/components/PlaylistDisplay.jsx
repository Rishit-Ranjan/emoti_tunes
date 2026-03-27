import React, { useState, useEffect, useRef } from 'react';
import { SpotifyIcon } from './icons/EmotionIcons';

const PlaylistDisplay = ({ playlist, emotion, onReset }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const audioRef = useRef(null);

    const currentSong = playlist[currentIndex];

    // Fetch Apple Music Preview
    useEffect(() => {
        if (!currentSong) return;
        
        let isMounted = true;
        setIsLoadingAudio(true);
        setAudioUrl(null);
        setIsPlaying(false);
        
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }

        const fetchSnippet = async () => {
            try {
                const query = encodeURIComponent(`${currentSong.title} ${currentSong.artist}`);
                const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`);
                const data = await res.json();
                if (isMounted && data.results && data.results.length > 0) {
                    setAudioUrl(data.results[0].previewUrl);
                }
            } catch (err) {
                console.error("Failed to fetch audio preview", err);
            } finally {
                if (isMounted) setIsLoadingAudio(false);
            }
        };
        fetchSnippet();
        
        return () => { isMounted = false; };
    }, [currentSong]);

    const togglePlayPause = () => {
        if (!audioUrl || !audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
        }
    };

    const handleNext = () => currentIndex < playlist.length - 1 && setCurrentIndex(currentIndex + 1);
    const handlePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
    const handleFirst = () => setCurrentIndex(0);
    const handleLast = () => setCurrentIndex(playlist.length - 1);

    return (
    <div className={`w-full max-w-3xl mx-auto rounded-[1.5rem] border border-slate-700 bg-slate-800/50 p-8 shadow-2xl shadow-slate-950/50 bg-gradient-to-b ${emotion.gradient}`}>
      <div className="flex items-center mb-6">
        <emotion.icon className={`w-12 h-12 mr-4 ${emotion.color}`}/>
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Your {emotion.name} Playlist</h2>
          <p className="text-slate-400">Here are some tracks to match your mood.</p>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {playlist.map((song, index) => {
            const isCurrentlyPlaying = index === currentIndex;
            return (
            <li 
                key={index} 
                onClick={() => setCurrentIndex(index)} 
                className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${isCurrentlyPlaying ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-slate-900/40 hover:bg-slate-900/70 border border-transparent'}`} 
                aria-current={isCurrentlyPlaying ? 'true' : 'false'}
            >
              <div className="flex items-center min-w-0">
                <span className={`flex-shrink-0 font-mono text-sm w-8 ${isCurrentlyPlaying ? 'text-blue-400' : 'text-slate-500'}`}>{index + 1}.</span>
                <div className="truncate">
                  <h3 className={`font-semibold truncate ${isCurrentlyPlaying ? 'text-blue-300' : 'text-slate-200'}`}>{song.title}</h3>
                  <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                </div>
              </div>
              
              {/* Animated playing indicator */}
              {isCurrentlyPlaying && isPlaying && (
                 <div className="flex items-end h-4 space-x-[2px] ml-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-1 bg-blue-400 rounded-t-sm animate-pulse" style={{ height: `${Math.max(30, Math.random() * 100)}%`, animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} />
                    ))}
                 </div>
              )}
            </li>
            );
        })}
      </ul>
      
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioUrl || ''} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden" 
      />

      {/* Music Player Controls */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 shadow-inner">
        
        {/* Track Info */}
        <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate-100 truncate">{currentSong?.title}</h3>
            <p className="text-lg text-slate-400 truncate">{currentSong?.artist}</p>
            <div className="mt-2 h-4 text-xs font-semibold text-blue-400 uppercase tracking-widest">
                {isLoadingAudio ? "Loading Preview..." : (audioUrl ? "Audio Preview Available" : "Preview Unavailable")}
            </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center space-x-6">
            <button onClick={handleFirst} disabled={currentIndex === 0} className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 6v12h2V6H7zm3 6l8 6V6l-8 6z"/></svg>
            </button>
            <button onClick={handlePrev} disabled={currentIndex === 0} className="text-slate-300 hover:text-white disabled:opacity-30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            
            <button 
                onClick={togglePlayPause} 
                disabled={!audioUrl}
                className={`w-16 h-16 flex items-center justify-center rounded-full text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg ${audioUrl ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
            >
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            
            <button onClick={handleNext} disabled={currentIndex === playlist.length - 1} className="text-slate-300 hover:text-white disabled:opacity-30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <button onClick={handleLast} disabled={currentIndex === playlist.length - 1} className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 18l8-6-8-6v12zm8-12v12h2V6h-2z"/></svg>
            </button>
        </div>
      </div>
      
      <button onClick={onReset} className="w-full mt-6 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
        </svg>
        <span>Change My Mood</span>
      </button>
    </div>
    );
};
export default PlaylistDisplay;
