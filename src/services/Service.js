import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Lazy initialization of Gemini
let genAI = null;
let model = null;

const getModel = () => {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log(`🔑 Key check: ${rawKey ? "Found (Starts with " + rawKey.substring(0, 4) + ")" : "Missing"}`);

    if (!rawKey || typeof rawKey !== 'string' || rawKey.length < 5) return null;

    if (!model) {
        try {
            genAI = new GoogleGenerativeAI(rawKey);
            model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        } catch (error) {
            console.error("Failed to initialize Gemini:", error.message);
            return null;
        }
    }
    return model;
};

const CONFIG = {
    temperature: 0.7,
    maxOutputTokens: 1000,
    retryAttempts: 2,
    retryDelay: 1000,
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

const emotionCache = new ResponseCache();

// Clean JSON string
const cleanJsonString = (responseText) => {
    let jsonText = responseText.trim();

    // Remove markdown code blocks
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
    }

    // Fix trailing commas
    jsonText = jsonText.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');

    return jsonText;
};

// Retry wrapper
const withRetry = async (fn, context, retries = CONFIG.retryAttempts) => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries) throw error;
            console.warn(`Retry ${i + 1}/${retries} for ${context}:`, error.message);
            await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * (i + 1)));
        }
    }
};

// Fallback playlists
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
        { title: "Seven Nation Army", artist: "The White Stripes" },
        { title: "Wake Me Up", artist: "Avicii" },
        { title: "Party Rock Anthem", artist: "LMFAO" }
    ],
    'Melancholy': [
        { title: "Video Games", artist: "Lana Del Rey" },
        { title: "The Night We Met", artist: "Lord Huron" },
        { title: "Exile", artist: "Taylor Swift ft. Bon Iver" },
        { title: "Holocene", artist: "Bon Iver" },
        { title: "Summertime Sadness", artist: "Lana Del Rey" },
        { title: "Liability", artist: "Lorde" },
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
    const model = getModel();
    if (!model) {
        console.warn("⚠️ Gemini API Key missing or initialization failed. Using fallback playlists.");
        return getFallback(emotion);
    }

    try {
        const prompt = `Generate a fresh, unique, and diverse playlist of 10 songs that perfectly capture the feeling of '${emotion}'. 

Return ONLY a valid JSON object with this exact structure:
{
    "songs": [
        {"title": "Song Title", "artist": "Artist Name"},
        {"title": "Another Song", "artist": "Another Artist"}
    ]
}

Do not include any conversational text. Respond with JSON only.`;

        const response = await withRetry(
            async () => {
                const result = await model.generateContent(prompt);
                return result.response.text();
            },
            `playlist generation for ${emotion}`
        );

        const jsonText = cleanJsonString(response);
        let parsed;

        try {
            parsed = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse playlist JSON:", jsonText, parseError);
            throw new Error("Invalid Gemini response format.");
        }

        if (parsed && Array.isArray(parsed.songs)) {
            return parsed.songs;
        } else if (Array.isArray(parsed)) {
            return parsed;
        } else {
            throw new Error("The AI returned a playlist, but its structure was not what we expected.");
        }
    } catch (error) {
        console.warn(`⚠️ Gemini failed. Using fallback for emotion: ${emotion}.`, error.message);
        return getFallback(emotion);
    }
};

const getFallback = (emotion) => {
    let fallbackKey = emotion;
    if (!FALLBACK_PLAYLISTS[fallbackKey]) {
        if (emotion.includes('Joy')) fallbackKey = 'Joy';
        else if (emotion.includes('Sad')) fallbackKey = 'Sadness';
        else if (emotion.includes('Anger')) fallbackKey = 'Anger';
        else fallbackKey = 'default';
    }
    return FALLBACK_PLAYLISTS[fallbackKey];
};

// Emotion detection using Gemini 1.5 Flash Vision
export const detectEmotionFromImage = async (base64ImageData) => {
    console.log("📸 Vision-based Emotion Recognition via Gemini 1.5 Flash");
    const model = getModel();
    if (!model) return "Joy";

    try {
        const prompt = "Identify the primary facial emotion of the person in this image. Respond ONLY with one of these words: Joy, Sadness, Anger, Excitement, Melancholy, Peaceful, Joy-Anger, Joy-Surprise, Joy-Excitement, Sad-Anger.";

        // Strip data URL prefix if present
        const cleanBase64 = base64ImageData.includes(',') ? base64ImageData.split(',')[1] : base64ImageData;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: cleanBase64,
                    mimeType: "image/jpeg"
                }
            },
            prompt
        ]);

        const response = await result.response;
        let text = response.text().trim().toLowerCase().replace(/[^a-z-]/g, '');
        const moods = ['joy-anger', 'joy-surprise', 'joy-excitement', 'sad-anger', 'joy', 'sadness', 'anger', 'excitement', 'melancholy', 'peaceful'];

        const matchedMood = moods.find(m => text.includes(m));
        if (matchedMood) {
            return matchedMood.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
        }

        return 'Joy';
    } catch (error) {
        console.warn("⚠️ Vision analysis failed. Falling back to Joy:", error.message);
        return 'Joy';
    }
};

export const detectEmotionFromAudio = async (base64AudioData, mimeType, aerFeatures) => {
    console.log("🎤 Audio Emotion Recognition (AER) via native audio + wave features:", aerFeatures);
    const model = getModel();
    if (!model) return "Joy";
    if (!aerFeatures || !base64AudioData) return 'Joy';

    try {
        const prompt = `Perform Audio Emotion Recognition (AER) utilizing both the raw audio file and the following extracted features:
- Average Energy (Volume): ${aerFeatures.avgEnergy.toFixed(2)}
- Average Peak Frequency (Pitch): ${aerFeatures.avgFreq.toFixed(2)} Hz
- Vocal Stability (Variance): ${aerFeatures.stability.toFixed(2)}

Listen to the attached audio recording to capture the user's exact tonality and emotion.
Identify the user's emotion. Respond ONLY with one of these exact words: Joy, Sadness, Anger, Excitement, Melancholy, Peaceful, Joy-Anger, Joy-Surprise, Joy-Excitement, Sad-Anger.`;

        const cleanBase64 = base64AudioData.includes(',') ? base64AudioData.split(',')[1] : base64AudioData;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: cleanBase64,
                    mimeType: mimeType || "audio/webm"
                }
            },
            prompt
        ]);
        const response = await result.response;
        let text = response.text().trim().toLowerCase().replace(/[^a-z-]/g, '');

        const moods = ['joy-anger', 'joy-surprise', 'joy-excitement', 'sad-anger', 'joy', 'sadness', 'anger', 'excitement', 'melancholy', 'peaceful'];
        const matchedMood = moods.find(m => text.includes(m));

        if (matchedMood) {
            return matchedMood.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
        }

        return 'Joy';
    } catch (error) {
        console.warn("⚠️ AER analysis failed, falling back to Joy:", error.message);
        return 'Joy';
    }
};

// Health check
export const checkFoundryHealth = async () => {
    const model = getModel();
    if (!model) return { healthy: false, message: "❌ Gemini API Key missing or invalid" };
    try {
        const result = await model.generateContent("hi");
        return {
            healthy: !!result.response.text(),
            message: '✅ Gemini API is working'
        };
    } catch (error) {
        return {
            healthy: false,
            error: error.message,
            message: '❌ Could not connect to Gemini service'
        };
    }
};