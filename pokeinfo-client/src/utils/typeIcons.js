import BugIcon from '../img/Typing/Poké-info_Bug.png';
import DarkIcon from '../img/Typing/Poké-info_Dark.png';
import DragonIcon from '../img/Typing/Poké-info_Dragon.png';
import ElectricIcon from '../img/Typing/Poké-info_Electric.png';
import FairyIcon from '../img/Typing/Poké-info_Fairy.png';
import FightingIcon from '../img/Typing/Poké-info_Fighting.png';
import FireIcon from '../img/Typing/Poké-info_Fire.png';
import FlyingIcon from '../img/Typing/Poké-info_Flying.png';
import GhostIcon from '../img/Typing/Poké-info_Ghost.png';
import GrassIcon from '../img/Typing/Poké-info_Grass.png';
import GroundIcon from '../img/Typing/Poké-info_Ground.png';
import IceIcon from '../img/Typing/Poké-info_Ice.png';
import NormalIcon from '../img/Typing/Poké-info_Normal.png';
import PoisonIcon from '../img/Typing/Poké-info_Poison.png';
import PsychicIcon from '../img/Typing/Poké-info_Psychic.png';
import RockIcon from '../img/Typing/Poké-info_Rock.png';
import SteelIcon from '../img/Typing/Poké-info_Steel.png';
import WaterIcon from '../img/Typing/Poké-info_Water.png';

export const TYPE_ICONS = {
    bug: BugIcon,
    dark: DarkIcon,
    dragon: DragonIcon,
    electric: ElectricIcon,
    fairy: FairyIcon,
    fighting: FightingIcon,
    fire: FireIcon,
    flying: FlyingIcon,
    ghost: GhostIcon,
    grass: GrassIcon,
    ground: GroundIcon,
    ice: IceIcon,
    normal: NormalIcon,
    poison: PoisonIcon,
    psychic: PsychicIcon,
    rock: RockIcon,
    steel: SteelIcon,
    water: WaterIcon
};

export function getTypeIcon(type) {
    return TYPE_ICONS[type] || null;
}
