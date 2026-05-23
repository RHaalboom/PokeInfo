import RedIcon from '../img/Games/Poké-info_Red.png';

export const GAME_ICONS = {
    red: RedIcon,
    blue: null, // Add when available
    yellow: null, // Add when available
    gold: null, // Add when available
    silver: null, // Add when available
    crystal: null, // Add when available
    ruby: null, // Add when available
    sapphire: null, // Add when available
    emerald: null, // Add when available
    'fire-red': null, // Add when available
    'leaf-green': null, // Add when available
    diamond: null, // Add when available
    pearl: null, // Add when available
    platinum: null, // Add when available
    'heart-gold': null, // Add when available
    'soul-silver': null, // Add when available
    black: null, // Add when available
    white: null, // Add when available
    'black-2': null, // Add when available
    'white-2': null, // Add when available
    x: null, // Add when available
    y: null, // Add when available
    'omega-ruby': null, // Add when available
    'alpha-sapphire': null, // Add when available
    'sun': null, // Add when available
    'moon': null, // Add when available
    'ultra-sun': null, // Add when available
    'ultra-moon': null, // Add when available
    'sword': null, // Add when available
    'shield': null, // Add when available
    'legends-arceus': null, // Add when available
    'brilliant-diamond': null, // Add when available
    'shining-pearl': null, // Add when available
    'scarlet': null, // Add when available
    'violet': null, // Add when available
};

export function getGameIcon(game) {
    const gameLower = game.toLowerCase();
    return GAME_ICONS[gameLower] || null;
}

export function formatGameName(game) {
    // Map of game names that need special formatting
    const gameNameMap = {
        'firered': 'Fire Red',
        'leafgreen': 'Leaf Green',
        'heartgold': 'Heart Gold',
        'soulsilver': 'Soul Silver',
        'black-2': 'Black 2',
        'white-2': 'White 2',
    };

    const gameLower = game.toLowerCase();

    // Check if game needs special formatting
    if (gameNameMap[gameLower]) {
        return gameNameMap[gameLower];
    }

    // Default formatting: capitalize each word
    return game
        .split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function getGameClass(game) {
    // Map of game names to their CSS class names
    const gameClassMap = {
        'firered': 'fire-red',
        'leafgreen': 'leaf-green',
        'heartgold': 'heart-gold',
        'soulsilver': 'soul-silver',
        'black-2': 'black-2',
        'white-2': 'white-2',
    };

    const gameLower = game.toLowerCase();

    // Check if game has a specific class mapping
    if (gameClassMap[gameLower]) {
        return `game-${gameClassMap[gameLower]}`;
    }

    // Default: convert to kebab-case
    return `game-${gameLower.replace(/\s+/g, '-')}`;
}
