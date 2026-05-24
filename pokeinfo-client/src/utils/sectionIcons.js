import AbilityIcon from '../img/Poké-info_Ability.png';
import EvolutionChainIcon from '../img/Poké-info_Evolution_Chain.png';
import GamesIcon from '../img/Poké-info_Games.png';
import TypingIcon from '../img/Poké-info_Typing.png';

export const SECTION_ICONS = {
    ability: AbilityIcon,
    evolutionChain: EvolutionChainIcon,
    games: GamesIcon,
    typing: TypingIcon
};

export function getSectionIcon(section) {
    return SECTION_ICONS[section] || null;
}
