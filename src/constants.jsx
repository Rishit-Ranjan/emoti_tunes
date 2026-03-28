import { HappyIcon, SadIcon, AngryIcon, JoyfulIcon, MelancholyIcon, EnergeticIcon } from './components/icons/EmotionIcons';
export const EMOTIONS = [
    {
        name: 'Joy',
        description: 'Feeling upbeat and happy.',
        icon: HappyIcon,
        color: 'text-yellow-300',
        gradient: 'from-yellow-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'Walking on Sunshine', artist: 'Katrina & The Waves' },
            { title: 'Happy', artist: 'Pharrell Williams' },
            { title: 'Good Vibrations', artist: 'The Beach Boys' }
        ]
    },
    {
        name: 'Sadness',
        description: 'For quiet, reflective moments.',
        icon: SadIcon,
        color: 'text-blue-300',
        gradient: 'from-blue-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'Someone Like You', artist: 'Adele' },
            { title: 'Fix You', artist: 'Coldplay' },
            { title: 'Yesterday', artist: 'The Beatles' }
        ]
    },
    {
        name: 'Anger',
        description: 'To channel your frustration.',
        icon: AngryIcon,
        color: 'text-red-400',
        gradient: 'from-red-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'Break Stuff', artist: 'Limp Bizkit' },
            { title: 'Killing In The Name', artist: 'Rage Against The Machine' },
            { title: 'Bulls On Parade', artist: 'Rage Against The Machine' }
        ]
    },
    {
        name: 'Excitement',
        description: 'High-energy and thrilling.',
        icon: JoyfulIcon,
        color: 'text-orange-400',
        gradient: 'from-orange-500/10 to-[#0a0a12]',
        recommendations: [
            { title: "Can't Stop", artist: 'Red Hot Chili Peppers' },
            { title: 'Thunderstruck', artist: 'AC/DC' },
            { title: 'Mr. Brightside', artist: 'The Killers' }
        ]
    },
    {
        name: 'Melancholy',
        description: 'Bittersweet and thoughtful.',
        icon: MelancholyIcon,
        color: 'text-indigo-300',
        gradient: 'from-indigo-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'Creep', artist: 'Radiohead' },
            { title: 'Hurt', artist: 'Johnny Cash' },
            { title: 'The Night We Met', artist: 'Lord Huron' }
        ]
    },
    {
        name: 'Peaceful',
        description: 'Calm, serene, and relaxing.',
        icon: EnergeticIcon,
        color: 'text-green-300',
        gradient: 'from-green-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'Weightless', artist: 'Marconi Union' },
            { title: 'River Flows In You', artist: 'Yiruma' },
            { title: 'Clair de Lune', artist: 'Claude Debussy' }
        ]
    },
    {
        name: 'Joy-Anger',
        description: 'Triumphant, righteous fury.',
        icon: AngryIcon,
        color: 'text-orange-400',
        gradient: 'from-orange-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'Power', artist: 'Kanye West' },
            { title: 'Survivor', artist: 'Destiny\'s Child' },
            { title: 'Eye of the Tiger', artist: 'Survivor' }
        ]
    },
    {
        name: 'Joy-Surprise',
        description: 'Delightful astonishment.',
        icon: JoyfulIcon,
        color: 'text-pink-400',
        gradient: 'from-pink-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'September', artist: 'Earth, Wind & Fire' },
            { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars' },
            { title: 'Sugar', artist: 'Maroon 5' }
        ]
    },
    {
        name: 'Joy-Excitement',
        description: 'Bursting with positive energy.',
        icon: HappyIcon,
        color: 'text-lime-300',
        gradient: 'from-lime-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'Levitating', artist: 'Dua Lipa' },
            { title: 'Shut Up and Dance', artist: 'Walk The Moon' },
            { title: 'Shake It Off', artist: 'Taylor Swift' }
        ]
    },
    {
        name: 'Sad-Anger',
        description: 'Frustrated and feeling down.',
        icon: SadIcon,
        color: 'text-purple-400',
        gradient: 'from-purple-500/10 to-[#0a0a12]',
        recommendations: [
            { title: 'In the End', artist: 'Linkin Park' },
            { title: 'Numb', artist: 'Linkin Park' },
            { title: 'Liability', artist: 'Lorde' }
        ]
    }
];
