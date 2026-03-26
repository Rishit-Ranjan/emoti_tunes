// service.js - Updated with better debugging and format detection

const API_BASE_URL = import.meta.env.VITE_FOUNDRY_ENDPOINT || '/api/foundry';
const FOUNDRY_MODEL = 'phi-3.5-mini-instruct-generic-cpu:1';

const PHI_CONFIG = {
    temperature: 0.7,
    maxTokens: 600,
    retryAttempts: 1, // Reduced for debugging
    retryDelay: 1000,
    timeout: 30000,
    enableCaching: true
};

// Response cache
class ResponseCache {
    constructor(maxSize = 50, ttl = 3600000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
}

const playlistCache = new ResponseCache();
const emotionCache = new ResponseCache();

// Check online status
const checkOnlineStatus = async () => {
    if (!navigator.onLine) {
        throw new Error("You are currently offline. An internet connection is required.");
    }
};

// Try multiple request formats
const tryRequestFormats = async (prompt, options = {}) => {
    const formats = [
        // Format 1: OpenAI chat format with system message
        {
            name: "OpenAI Chat with System",
            body: {
                model: FOUNDRY_MODEL,
                messages: [
                    { role: "system", content: "You are a music recommendation assistant. Respond with valid JSON only." },
                    { role: "user", content: prompt }
                ],
                temperature: options.temperature || PHI_CONFIG.temperature,
                max_tokens: options.max_tokens || PHI_CONFIG.maxTokens
            }
        },
        // Format 2: OpenAI chat format without system
        {
            name: "OpenAI Chat without System",
            body: {
                model: FOUNDRY_MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: options.temperature || PHI_CONFIG.temperature,
                max_tokens: options.max_tokens || PHI_CONFIG.maxTokens
            }
        },
        // Format 3: Simple prompt
        {
            name: "Simple Prompt",
            body: {
                prompt: prompt,
                max_tokens: options.max_tokens || PHI_CONFIG.maxTokens,
                temperature: options.temperature || PHI_CONFIG.temperature
            }
        },
        // Format 4: Input field
        {
            name: "Input Field",
            body: {
                input: prompt,
                max_tokens: options.max_tokens || PHI_CONFIG.maxTokens,
                temperature: options.temperature || PHI_CONFIG.temperature
            }
        },
        // Format 5: Text field
        {
            name: "Text Field",
            body: {
                text: prompt,
                max_tokens: options.max_tokens || PHI_CONFIG.maxTokens,
                temperature: options.temperature || PHI_CONFIG.temperature
            }
        },
        // Format 6: No model field
        {
            name: "No Model Field",
            body: {
                messages: [{ role: "user", content: prompt }],
                max_tokens: options.max_tokens || PHI_CONFIG.maxTokens,
                temperature: options.temperature || PHI_CONFIG.temperature
            }
        },
        // Format 7: Completions format
        {
            name: "Completions Format",
            body: {
                model: FOUNDRY_MODEL,
                prompt: prompt,
                max_tokens: options.max_tokens || PHI_CONFIG.maxTokens,
                temperature: options.temperature || PHI_CONFIG.temperature
            }
        }
    ];

    for (const format of formats) {
        try {
            console.log(`📝 Trying format: ${format.name}`);
            // Completions format usually requires a different endpoint than Chat
            const endpoint = format.name === "Completions Format" ? `${API_BASE_URL}/v1/completions` : `${API_BASE_URL}/v1/chat/completions`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer local-foundry-token' // Some servers require this header
                },
                body: JSON.stringify(format.body)
            });
            
            const responseText = await response.text();
            
            if (response.ok) {
                console.log(`✅ Format "${format.name}" succeeded!`);
                try {
                    const data = JSON.parse(responseText);
                    return { success: true, data, format: format.name };
                } catch (e) {
                    return { success: true, text: responseText, format: format.name };
                }
            } else {
                console.log(`❌ Format "${format.name}" failed with status ${response.status}`);
                console.log(`   Response: ${responseText.substring(0, 100)}`);
            }
        } catch (error) {
            console.log(`❌ Format "${format.name}" error:`, error.message);
        }
    }
    
    return { success: false, error: "All formats failed" };
};

// Call Foundry API with format detection
export const callFoundryPhi = async (prompt, options = {}) => {
    console.log(`📡 Calling Foundry for prompt: ${prompt.substring(0, 100)}...`);
    
    const result = await tryRequestFormats(prompt, options);
    
    if (!result.success) {
        throw new Error(result.error || "All request formats failed. Ensure the local Foundry server is running and the model name matches.");
    }
    
    // Parse the response
    let text = '';
    if (result.data) {
        if (result.data.choices && result.data.choices[0] && result.data.choices[0].message) {
            text = result.data.choices[0].message.content;
        } else if (result.data.choices && result.data.choices[0] && result.data.choices[0].text) {
            text = result.data.choices[0].text;
        } else if (result.data.response) {
            text = result.data.response;
        } else if (result.data.text) {
            text = result.data.text;
        } else if (result.data.generated_text) {
            text = result.data.generated_text;
        } else if (result.data.output) {
            text = result.data.output;
        } else {
            text = JSON.stringify(result.data);
        }
    } else if (result.text) {
        text = result.text;
    }
    
    console.log(`📝 Response (${result.format}): ${text.substring(0, 200)}`);
    
    return {
        text: text,
        format: result.format,
        raw: result.data || result.text
    };
};

// Clean JSON string
const cleanJsonString = (responseText) => {
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
    }
    
    // Remove any trailing commas before closing braces/brackets
    jsonText = jsonText.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
    
    // Note: Aggressive regex replacement removed as it can corrupt 
    // valid song data (like apostrophes or colons inside titles).
    // Relying on model output and markdown stripping.
    
    return jsonText;
};

// Retry wrapper
const withRetry = async (fn, context, retries = PHI_CONFIG.retryAttempts) => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries) throw error;
            console.warn(`Retry ${i + 1}/${retries} for ${context}:`, error.message);
            await new Promise(resolve => setTimeout(resolve, PHI_CONFIG.retryDelay * (i + 1)));
        }
    }
};

// Fallback playlists (same as before)
const FALLBACK_PLAYLISTS = {
    'Joy': [
        { title: "Happy", artist: "Pharrell Williams" },
        { title: "Walking on Sunshine", artist: "Katrina and the Waves" },
        { title: "Can't Stop the Feeling!", artist: "Justin Timberlake" },
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
        { title: "Good Vibrations", artist: "The Beach Boys" },
        { title: "September", artist: "Earth, Wind & Fire" },
        { title: "Best Day of My Life", artist: "American Authors" },
        { title: "I Gotta Feeling", artist: "The Black Eyed Peas" },
        { title: "Shut Up and Dance", artist: "Walk The Moon" },
        { title: "Roar", artist: "Katy Perry" }
    ],
    'Sadness': [
        { title: "Someone Like You", artist: "Adele" },
        { title: "Fix You", artist: "Coldplay" },
        { title: "The Sound of Silence", artist: "Simon & Garfunkel" },
        { title: "Yesterday", artist: "The Beatles" },
        { title: "Hurt", artist: "Johnny Cash" },
        { title: "All I Want", artist: "Kodaline" },
        { title: "Skinny Love", artist: "Bon Iver" },
        { title: "Stay With Me", artist: "Sam Smith" },
        { title: "Let Her Go", artist: "Passenger" },
        { title: "Tears in Heaven", artist: "Eric Clapton" }
    ],
    'Anger': [
        { title: "Killing in the Name", artist: "Rage Against the Machine" },
        { title: "Break Stuff", artist: "Limp Bizkit" },
        { title: "In the End", artist: "Linkin Park" },
        { title: "Smells Like Teen Spirit", artist: "Nirvana" },
        { title: "Chop Suey!", artist: "System of a Down" },
        { title: "Du Hast", artist: "Rammstein" },
        { title: "Bodies", artist: "Drowning Pool" },
        { title: "Given Up", artist: "Linkin Park" },
        { title: "Down with the Sickness", artist: "Disturbed" },
        { title: "Headstrong", artist: "Trapt" }
    ],
    'Excitement': [
        { title: "Eye of the Tiger", artist: "Survivor" },
        { title: "Don't Stop Me Now", artist: "Queen" },
        { title: "Lose Yourself", artist: "Eminem" },
        { title: "Titanium", artist: "David Guetta ft. Sia" },
        { title: "Levels", artist: "Avicii" },
        { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis" },
        { title: "Thunderstruck", artist: "AC/DC" },
        { title: "Seven Nation Army", artist: "Macklemore" },
        { title: "Wake Me Up", artist: "Avicii" },
        { title: "Party Rock Anthem", artist: "LMFAO" }
    ],
    'Melancholy': [
        { title: "Video Games", artist: "Lana Del Rey" },
        { title: "The Night We Met", artist: "Lord Huron" },
        { title: "Exile", artist: "Taylor Swift ft. Bon Iver" },
        { title: "Holocene", artist: "Bon Iver" },
        { title: "Summertime Sadness", artist: "Lana Del Rey" },
        { title: "Liability", artist: "Taylor Swift" },
        { title: "Writer in the Dark", artist: "Lorde" },
        { title: "Slow Dancing in a Burning Room", artist: "John Mayer" },
        { title: "Landslide", artist: "Fleetwood Mac" },
        { title: "Black", artist: "Pearl Jam" }
    ],
    'Peaceful': [
        { title: "Weightless", artist: "Marconi Union" },
        { title: "Clair de Lune", artist: "Debussy" },
        { title: "River Flows in You", artist: "Yiruma" },
        { title: "Gymnopédie No.1", artist: "Erik Satie" },
        { title: "Spiegel im Spiegel", artist: "Arvo Pärt" },
        { title: "Holocene", artist: "Bon Iver" },
        { title: "Sunrise", artist: "Norah Jones" },
        { title: "Banana Pancakes", artist: "Jack Johnson" },
        { title: "Come Away With Me", artist: "Norah Jones" },
        { title: "Put Your Records On", artist: "Corinne Bailey Rae" }
    ],
    'default': [
        { title: "Bohemian Rhapsody", artist: "Queen" },
        { title: "Imagine", artist: "John Lennon" },
        { title: "Hotel California", artist: "Eagles" },
        { title: "Billie Jean", artist: "Michael Jackson" },
        { title: "Like a Rolling Stone", artist: "Bob Dylan" },
        { title: "Smells Like Teen Spirit", artist: "Nirvana" },
        { title: "What's Going On", artist: "Marvin Gaye" },
        { title: "Respect", artist: "Aretha Franklin" },
        { title: "Good Vibrations", artist: "The Beach Boys" },
        { title: "Hey Jude", artist: "The Beatles" }
    ]
};

// Main exported function: generatePlaylist
export const generatePlaylist = async (emotion) => {
    await checkOnlineStatus();
    
    const cacheKey = `playlist_${emotion}`;
    const cachedPlaylist = PHI_CONFIG.enableCaching ? playlistCache.get(cacheKey) : null;
    if (cachedPlaylist) {
        console.log(`📦 Returning cached playlist for emotion: ${emotion}`);
        return cachedPlaylist;
    }
    
    try {
        const prompt = `Generate a playlist of 10 songs that capture the feeling of '${emotion}'. 
        
Return ONLY a valid JSON object with this exact structure:
{
    "songs": [
        {"title": "Song Title", "artist": "Artist Name"},
        {"title": "Another Song", "artist": "Another Artist"}
    ]
}

The playlist should have diverse genres and artists suitable for this mood. Do not include any text outside the JSON.`;
        
        const response = await withRetry(
            () => callFoundryPhi(prompt, {
                temperature: 0.7,
                max_tokens: 600
            }),
            `playlist generation for ${emotion}`
        );
        
        const jsonText = cleanJsonString(response.text);
        let parsed;
        
        try {
            parsed = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse playlist JSON:", jsonText);
            throw new Error("The AI returned a response in an unexpected format.");
        }
        
        if (parsed && Array.isArray(parsed.songs)) {
            const playlist = parsed.songs;
            if (PHI_CONFIG.enableCaching) {
                playlistCache.set(cacheKey, playlist);
            }
            return playlist;
        } else if (Array.isArray(parsed)) {
            if (PHI_CONFIG.enableCaching) {
                playlistCache.set(cacheKey, parsed);
            }
            return parsed;
        } else {
            throw new Error("The AI returned a playlist, but its structure was not what we expected.");
        }
    } catch (error) {
        console.warn(`⚠️ Foundry failed. Using fallback for emotion: ${emotion}.`, error.message);
        
        let fallbackKey = emotion;
        if (!FALLBACK_PLAYLISTS[fallbackKey]) {
            if (emotion.includes('Joy')) fallbackKey = 'Joy';
            else if (emotion.includes('Sad')) fallbackKey = 'Sadness';
            else if (emotion.includes('Anger')) fallbackKey = 'Anger';
            else fallbackKey = 'default';
        }
        
        return FALLBACK_PLAYLISTS[fallbackKey];
    }
};

// Emotion detection (using fallback)
export const detectEmotionFromImage = async (base64ImageData) => {
    console.log("📸 Emotion detection from image - using fallback");
    return 'Joy';
};

export const detectEmotionFromAudio = async (base64AudioData, mimeType) => {
    console.log("🎤 Emotion detection from audio - using fallback");
    return 'Joy';
};

// Health check
export const checkFoundryHealth = async () => {
    try {
        const result = await tryRequestFormats("test", { max_tokens: 5 });
        return {
            healthy: result.success,
            format: result.format,
            message: result.success ? '✅ Foundry service is working' : '❌ No working format found'
        };
    } catch (error) {
        return {
            healthy: false,
            error: error.message,
            message: '❌ Could not connect to Foundry service'
        };
    }
};