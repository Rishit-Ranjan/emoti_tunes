import { GoogleGenAI, Type } from "@google/genai";
if (!import.meta.env.VITE_API_KEY) {
  throw new Error("API key environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const checkOnlineStatus = () => {
    if (!navigator.onLine) {
        throw new Error("You are currently offline. An internet connection is required.");
    }
};
const playlistResponseSchema = {
    type: Type.OBJECT,
    properties: {
        songs: {
            type: Type.ARRAY,
            description: "A list of songs for the playlist.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "The title of the song."
                    },
                    artist: {
                        type: Type.STRING,
                        description: "The name of the artist or band."
                    }
                },
                required: ["title", "artist"]
            }
        }
    },
    required: ["songs"]
};
const emotionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        emotion: {
            type: Type.STRING,
            description: "The detected emotion from the list provided.",
            enum: ['Joy', 'Sadness', 'Anger', 'Excitement', 'Melancholy', 'Peaceful', 'Joy-Anger', 'Joy-Surprise', 'Joy-Excitement', 'Sad-Anger']
        },
        feature_analysis: {
            type: Type.STRING,
            description: "The detected emotion from the list provided.",
        }
    },
    required: ["emotion", "feature_analysis"]
};

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

/**
 * Extracts a JSON string from a markdown code block if present.
 * @param responseText The raw text from the AI response.
 * @returns A clean JSON string.
 */
const cleanJsonString = (responseText) => {
    let jsonText = responseText.trim();
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
    }
    return jsonText;
};
const handleApiError = (error, context) => {
    console.error(`Error during ${context}:`, error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key")) {
            return new Error("The application's API key is invalid or missing. Please contact support.");
        }
        // Passthrough for specific, user-friendly errors thrown intentionally
        if (error.message.includes("offline") || error.message.startsWith("The AI")) {
            return error;
        }
    }
    return new Error(`Could not connect to the AI service for ${context}. Please check your internet connection and try again.`);
};
export const generatePlaylist = async (emotion) => {
    checkOnlineStatus();
    try {
        const prompt = `Generate a playlist of 10 songs that perfectly capture the feeling of '${emotion}'. For each song, provide the title and the artist's name. Focus on a diverse mix of genres and artists suitable for this mood.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: playlistResponseSchema,
                temperature: 0.8,
            }
        });
        const jsonText = cleanJsonString(response.text);
        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        }
        catch (parseError) {
            console.error("Failed to parse playlist JSON:", jsonText, parseError);
            throw new Error("The AI returned a response, but it was in an unexpected format.");
        }
        if (parsed && Array.isArray(parsed.songs)) {
            return parsed.songs;
        }
        else {
            console.error("Unexpected JSON structure for playlist:", parsed);
            throw new Error("The AI returned a playlist, but its structure was not what we expected.");
        }
    }
    catch (error) {
        console.warn(`Gemini API failed for playlist generation. Switching to offline fallback mode for emotion: ${emotion}.`, error);
        
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
export const detectEmotionFromImage = async (base64ImageData) => {
    checkOnlineStatus();
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };
        const textPart = {
            text: `Analyze the user's facial expression in this image and identify their primary emotion. Choose the most fitting emotion from the following list: Joy, Sadness, Anger, Excitement, Melancholy, Peaceful, Joy-Anger, Joy-Surprise, Joy-Excitement, Sad-Anger.`
        };
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: emotionResponseSchema,
            }
        });
        const jsonText = cleanJsonString(response.text);
        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        }
        catch (parseError) {
            console.error("Failed to parse emotion JSON from image analysis:", jsonText, parseError);
            throw new Error("The AI analyzed the image, but its response was in an unexpected format.");
        }
        if (parsed && typeof parsed.emotion === 'string') {
            
            console.log("Image Feature Analysis: ", parsed_analysis);
            return parsed.emotion;
        }
        else {
            console.error("Unexpected JSON structure for emotion detection:", parsed);
            throw new Error("The AI's analysis of the image was inconclusive or in an unexpected format.");
        }
    }
    catch (error) {
        throw handleApiError(error, "image analysis");
    }
};
export const detectEmotionFromAudio = async (base64AudioData, mimeType) => {
    checkOnlineStatus();
    try {
        const audioPart = {
            inlineData: {
                mimeType,
                data: base64AudioData,
            },
        };
        const textPart = {
            text: `Analyze the user's tone of voice in this audio clip and identify their primary emotion. Choose the most fitting emotion from the following list: Joy, Sadness, Anger, Excitement, Melancholy, Peaceful, Joy-Anger, Joy-Surprise, Joy-Excitement, Sad-Anger.`
        };
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [audioPart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: emotionResponseSchema,
            }
        });
        const jsonText = cleanJsonString(response.text);
        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        }
        catch (parseError) {
            console.error("Failed to parse emotion JSON from audio analysis:", jsonText, parseError);
            throw new Error("The AI analyzed your voice, but its response was in an unexpected format.");
        }
        if (parsed && typeof parsed.emotion === 'string') {
            console.log("Audio Feature Analysis: ", parsed.feature_analysis);
            return parsed.emotion;
        }
        else {
            console.error("Unexpected JSON structure for emotion detection:", parsed);
            throw new Error("The AI's analysis of your voice was inconclusive or in an unexpected format.");
        }
    }
    catch (error) {
        throw handleApiError(error, "audio analysis");
    }
};
