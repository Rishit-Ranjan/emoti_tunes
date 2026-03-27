import React, { useState, useCallback, useEffect } from 'react';
import { EMOTIONS } from './constants';
import { generatePlaylist, detectEmotionFromImage, detectEmotionFromAudio } from './services/Service';
import EmotionSelector from './components/EmotionSelector';
import PlaylistDisplay from './components/PlaylistDisplay';
import Loader from './components/Loader';
import CameraView from './components/CameraView';
import AudioView from './components/AudioView';
import ProfileView from './components/ProfileView';

const OfflineBanner = () => (<div className="fixed top-0 left-0 right-0 bg-slate-800 border-b border-yellow-500/30 text-center p-2 text-sm text-yellow-300 z-50 flex items-center justify-center shadow-lg" role="status">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.828-2.828a5 5 0 010-7.072m-2.828-2.828a1 1 0 010-1.414A1 1 0 0111.314 3a1 1 0 011.414 0l.001.001.001.001a1 1 0 010 1.414m-2.828 2.828a1 1 0 010 1.414m-2.829-1.414a5 5 0 000 7.072m-2.828 2.828a9 9 0 0012.728 0M1 1l22 22"/>
        </svg>
        You are currently offline. Some features are unavailable.
    </div>);

const App = () => {
    const [view, setView] = useState('home');
    const [history, setHistory] = useState(['home']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [currentEmotion, setCurrentEmotion] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setError(null);
        };
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Navigation Helper
    const navigateTo = (newView) => {
        if (newView === view) return;
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newView);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setView(newView);
        setIsSearchActive(false);
    };

    const goBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setView(history[newIndex]);
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setView(history[newIndex]);
        }
    };

    const handleEmotionSelect = useCallback(async (emotion) => {
        if (isOffline) {
            setError("You're offline. Please connect to the internet to generate a playlist.");
            return;
        }
        setCurrentEmotion(emotion);
        setLoadingMessage(`Generating ${emotion.name} vibe...`);
        setIsLoading(true);
        setError(null);
        setPlaylist([]);
        navigateTo('playlist');
        try {
            const newPlaylist = await generatePlaylist(emotion.name);
            setPlaylist(newPlaylist);
        }
        catch (err) {
            console.error("Playlist generation error:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
        finally {
            setIsLoading(false);
        }
    }, [isOffline, history, historyIndex, view]);

    const handleReset = useCallback(() => {
        setCurrentEmotion(null);
        setPlaylist([]);
        setError(null);
        setIsLoading(false);
        navigateTo('home');
    }, [history, historyIndex, view]);

    const handleCreatePlaylist = () => {
        if (playlist.length === 0) {
            alert("Generate a playlist first!");
            return;
        }
        const name = prompt("Enter playlist name:", `${currentEmotion?.name || 'My'} Vibe`);
        if (name) {
            const newPlaylist = {
                id: Date.now(),
                name,
                songs: [...playlist],
                emotion: currentEmotion
            };
            setUserPlaylists(prev => [newPlaylist, ...prev]);
            alert("Playlist created and added to Library!");
        }
    };

    const handleCapture = useCallback(async (imageData) => {
        setLoadingMessage('Analyzing mood...');
        setIsLoading(true);
        setError(null);
        try {
            const detectedName = await detectEmotionFromImage(imageData);
            const matched = EMOTIONS.find(e => e.name.toLowerCase() === detectedName.toLowerCase()) || EMOTIONS[0];
            await handleEmotionSelect(matched);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }, [handleEmotionSelect]);

    const handleAudioCapture = useCallback(async (data) => {
        setLoadingMessage('Analyzing voice...');
        setIsLoading(true);
        setError(null);
        try {
            const detectedName = await detectEmotionFromAudio(data.audioData, data.mimeType, data.aerFeatures);
            const matched = EMOTIONS.find(e => e.name.toLowerCase() === detectedName.toLowerCase()) || EMOTIONS[0];
            await handleEmotionSelect(matched);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }, [handleEmotionSelect]);

    const handleCameraError = useCallback((errorMessage) => {
        setError(errorMessage);
        goBack();
    }, [goBack]);

    const handleAudioError = useCallback((errorMessage) => {
        setError(errorMessage);
        goBack();
    }, [goBack]);

    const renderContent = () => {
        if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader message={loadingMessage}/></div>;
        if (error) return (
            <div className="h-full w-full flex items-center justify-center p-8">
                <div className="text-center bg-[#1a1a2e] border border-violet-500/30 rounded-3xl p-12 max-w-lg shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Oops!</h2>
                    <p className="text-violet-200/60 mb-8 font-medium leading-relaxed">{error}</p>
                    <button onClick={handleReset} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm">
                        Go Home
                    </button>
                </div>
            </div>
        );

        switch (view) {
            case 'profile': return <ProfileView onBack={goBack} />;
            case 'camera': return <div className="h-full w-full flex items-center justify-center"><CameraView onCapture={handleCapture} onClose={goBack} onError={handleCameraError}/></div>;
            case 'mic': return <div className="h-full w-full flex items-center justify-center"><AudioView onCapture={handleAudioCapture} onClose={goBack} onError={handleAudioError}/></div>;
            case 'playlist': return <PlaylistDisplay playlist={playlist} emotion={currentEmotion} onReset={handleReset}/>;
            case 'library': return (
                <div className="flex-1 p-8">
                    <h2 className="text-5xl font-black mb-12 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Library</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div onClick={() => navigateTo('home')} className="bg-[#1a1a2e]/50 p-6 rounded-3xl border border-white/5 hover:border-violet-500/30 transition-all group cursor-pointer">
                            <div className="aspect-square bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl mb-6 shadow-2xl flex items-center justify-center transform group-hover:rotate-3 transition-transform">
                                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Liked Songs</h3>
                            <p className="text-violet-300/50 text-sm font-bold mt-1">Playlist • 0 songs</p>
                        </div>
                        {userPlaylists.map(pl => (
                            <div key={pl.id} className="bg-[#1a1a2e]/50 p-6 rounded-3xl border border-white/5 hover:border-violet-500/30 transition-all group cursor-pointer">
                                <div className={`aspect-square bg-gradient-to-br ${pl.emotion.gradient} rounded-2xl mb-6 shadow-2xl flex items-center justify-center transform group-hover:rotate-3 transition-transform`}>
                                    <img src={`https://picsum.photos/seed/${pl.id}/300/300`} className="w-full h-full object-cover rounded-2xl opacity-60" alt="" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{pl.name}</h3>
                                <p className="text-violet-300/50 text-sm font-bold mt-1">{pl.songs.length} tracks</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
            default: return <EmotionSelector emotions={EMOTIONS} onSelect={handleEmotionSelect} onOpenCamera={() => navigateTo('camera')} onOpenMic={() => navigateTo('mic')} isOffline={isOffline}/>;
        }
    };

    return (
    <div className="h-screen w-screen bg-[#0a0a12] text-violet-100 flex flex-col font-sans overflow-hidden p-3 gap-3">
        {isOffline && <OfflineBanner />}
        
        <div className="flex-1 flex gap-3 min-h-0 w-full relative">
            {/* Sidebar */}
            <nav className="w-80 bg-[#12121e] rounded-3xl hidden md:flex flex-col shadow-2xl border border-white/5">
                <div className="p-8 space-y-10">
                    <div onClick={handleReset} className="flex items-center space-x-3 cursor-pointer group">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-xl shadow-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <img src="/logo.png" alt="" className="w-7 h-7 rounded-full" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter uppercase text-white">EmotiTunes</span>
                    </div>

                    <div className="space-y-6">
                        <div onClick={handleReset} className={`flex items-center space-x-5 cursor-pointer font-black uppercase tracking-widest text-sm transition-all ${view === 'home' ? 'text-cyan-400' : 'text-violet-200/40 hover:text-white'}`}>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 3.247a1 1 0 00-1 0L4 7.577V20h4.5v-6a1 1 0 011-1h5a1 1 0 011 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 013 0l7.5 4.33a2 2 0 011 1.732V21a1 1 0 01-1 1h-6.5a1 1 0 01-1-1v-6h-3v6a1 1 0 01-1 1H3a1 1 0 01-1-1V7.577a2 2 0 011-1.732l7.5-4.33z"/></svg>
                            <span>Home</span>
                        </div>
                        <div onClick={() => navigateTo('library')} className={`flex items-center space-x-5 cursor-pointer font-black uppercase tracking-widest text-sm transition-all ${view === 'library' ? 'text-cyan-400' : 'text-violet-200/40 hover:text-white'}`}>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5 2.134v-2c5.968.225 10.775 5.032 11 11h-2c-.221-4.869-4.131-8.779-9-9zM3 10V8A10.007 10.007 0 0 1 12 2.05V4a8.006 8.006 0 0 0-7.85 7.85H2v-1.85zM2 13v1.85A10.007 10.007 0 0 0 12 21.95v-1.95A8.006 8.006 0 0 1 4.15 12.15H2V13zm12.5 8.866v2c5.968-.225 10.775-5.032 11-11h-2c-.221 4.869-4.131-8.779-9 9zM12 14v4a2 2 0 0 0 2 2h3v-2h-3v-4h2.5L12 9 7.5 14H10z"/></svg>
                            <span>Library</span>
                        </div>
                    </div>
                </div>

                <div className="mx-8 border-t border-white/5"></div>

                <div className="p-8 flex-1">
                    <div onClick={handleCreatePlaylist} className="flex items-center space-x-5 cursor-pointer group text-violet-200/40 hover:text-white transition-all font-black uppercase tracking-widest text-sm">
                        <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center group-hover:bg-violet-600 transition-all text-violet-400 group-hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path d="M12 4v16m8-8H4"/></svg>
                        </div>
                        <span>Create Playlist</span>
                    </div>
                </div>
            </nav>

            <main className="flex-1 bg-[#0f0f1a] rounded-3xl relative overflow-hidden flex flex-col shadow-2xl border border-white/5">
                {/* Enhanced Top Nav */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-8 z-30 pointer-events-none">
                     <div className="flex items-center space-x-4 pointer-events-auto">
                         <div className="flex space-x-2">
                             <button onClick={goBack} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white backdrop-blur-xl transition-all border border-white/10 active:scale-90" title="Back">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                             </button>
                             <button onClick={goForward} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white backdrop-blur-xl transition-all border border-white/10 active:scale-90" title="Forward">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                             </button>
                         </div>
                     </div>

                     {/* Centered Large Search Bar */}
                     <div className="flex-1 flex justify-center px-4 pointer-events-auto">
                        <div className={`relative flex items-center transition-all duration-500 ${isSearchActive ? 'w-full max-w-xl' : 'w-12 h-12'}`}>
                            <button 
                                onClick={() => setIsSearchActive(!isSearchActive)}
                                className={`absolute left-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg z-10 ${isSearchActive ? 'bg-transparent text-violet-300' : 'bg-violet-600 text-white hover:scale-110 active:scale-90'}`}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10.533 1.27893C5.242 1.27893 1 5.49893 1 10.7489C1 15.9989 5.242 20.2189 10.533 20.2189C12.636 20.2189 14.57 19.5389 16.14 18.3989L21.293 23.5089C21.684 23.8989 22.316 23.8989 22.707 23.5089C23.098 23.1189 23.098 22.4889 22.707 22.0989L17.65 17.0789C19.117 15.4289 20.066 13.1989 20.066 10.7489C20.066 5.49893 15.824 1.27893 10.533 1.27893ZM10.533 3.27893C14.73 3.27893 18.066 6.57893 18.066 10.7489C18.066 14.9189 14.73 18.2189 10.533 18.2189C6.335 18.2189 3 14.9189 3 10.7489C3 6.57893 6.335 3.27893 10.533 3.27893Z"/></svg>
                            </button>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="What's your current vibe?" 
                                className={`bg-white/5 border border-white/10 rounded-2xl py-3 pl-14 pr-6 text-white text-lg w-full focus:ring-2 focus:ring-violet-500/50 backdrop-blur-2xl transition-all duration-500 shadow-2xl ${isSearchActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} 
                                autoFocus={isSearchActive}
                            />
                        </div>
                     </div>
                     
                     <div className="flex space-x-6 pointer-events-auto items-center">
                         <button onClick={() => navigateTo('profile')} className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all p-0.5 hover:rotate-6 ${view === 'profile' ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/10 bg-white/5'}`}>
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rishit%20Ranjan`} alt="" className="w-full h-full rounded-lg" />
                         </button>
                     </div>
                </div>

                {renderContent()}
            </main>
        </div>
    </div>
    );
};

export default App;
