import RedIcon from '../img/Games/Poké-info_Red.png';
import BlueIcon from '../img/Games/Poké-info_Blue.png';
import YellowIcon from '../img/Games/Poké-info_Yellow.png';
import GoldIcon from '../img/Games/Poké-info_Gold.png';
import SilverIcon from '../img/Games/Poké-info_Silver.png';
import CrystalIcon from '../img/Games/Poké-info_Crystal.png';
import RubyIcon from '../img/Games/Poké-info_Ruby.png';
import SapphireIcon from '../img/Games/Poké-info_Sapphire.png';
import EmeraldIcon from '../img/Games/Poké-info_Emerald.png';
import FireRedIcon from '../img/Games/Poké-info_FireRed.png';
import LeafGreenIcon from '../img/Games/Poké-info_LeafGreen.png';
import DiamondIcon from '../img/Games/Poké-info_Diamond.png';
import PearlIcon from '../img/Games/Poké-info_Pearl.png';
import PlatinumIcon from '../img/Games/Poké-info_Platinum.png';
import HeartGoldIcon from '../img/Games/Poké-info_HeartGold.png';
import SoulSilverIcon from '../img/Games/Poké-info_SoulSilver.png';
import BlackIcon from '../img/Games/Poké-info_Black.png';
import WhiteIcon from '../img/Games/Poké-info_White.png';
import Black2Icon from '../img/Games/Poké-info_Black2.png';
import White2Icon from '../img/Games/Poké-info_White2.png';
import XIcon from '../img/Games/Poké-info_X.png';
import YIcon from '../img/Games/Poké-info_Y.png';
import SunIcon from '../img/Games/Poké-info_Sun.png';
import MoonIcon from '../img/Games/Poké-info_Moon.png';
import UltraSunIcon from '../img/Games/Poké-info_UltraSun.png';
import UltraMoonIcon from '../img/Games/Poké-info_UltraMoon.png';

export const GAME_ICONS = {
    red: RedIcon,
    blue: BlueIcon,
    yellow: YellowIcon,
    gold: GoldIcon,
    silver: SilverIcon,
    crystal: CrystalIcon,
    ruby: RubyIcon,
    sapphire: SapphireIcon,
    emerald: EmeraldIcon,
    'fire-red': FireRedIcon,
    'leaf-green': LeafGreenIcon,
    firered: FireRedIcon, // Support alternative naming
    leafgreen: LeafGreenIcon, // Support alternative naming
    diamond: DiamondIcon,
    pearl: PearlIcon,
    platinum: PlatinumIcon,
    'heart-gold': HeartGoldIcon,
    'soul-silver': SoulSilverIcon,
    heartgold: HeartGoldIcon, // Support alternative naming
    soulsilver: SoulSilverIcon, // Support alternative naming
    black: BlackIcon,
    white: WhiteIcon,
    'black-2': Black2Icon,
    'white-2': White2Icon,
    x: XIcon,
    y: YIcon,
    'sun': SunIcon,
    'moon': MoonIcon,
    'ultra-sun': UltraSunIcon,
    'ultra-moon': UltraMoonIcon,
    'sword': null, // Add when available
    'shield': null, // Add when available
    'omega-ruby': null, // Add when available
    'omegaruby': null, // Support alternative naming
    'alpha-sapphire': null, // Add when available
    'alphasapphire': null, // Support alternative naming
    'legends-arceus': null, // Add when available
    'legendsarceus': null, // Support alternative naming
    'brilliant-diamond': null, // Add when available
    'brilliantdiamond': null, // Support alternative naming
    'shining-pearl': null, // Add when available
    'shiningpearl': null, // Support alternative naming
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
