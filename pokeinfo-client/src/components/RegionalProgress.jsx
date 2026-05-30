import '../styles/regionalProgress.css';
import RegionalProgressCard from './RegionalProgressCard';
import progressIcon from '../img/Profile/Poké-info_Progress_Regional.png';

// Color mapping for each region
const REGION_COLORS = {
    KANTO: '#E74C3C',      // Red
    JOHTO: '#F39C12',      // Orange
    HOENN: '#16A085',      // Green
    SINNOH: '#8E44AD',     // Purple
    UNOVA: '#3498DB',      // Blue
    KALOS: '#E91E63',      // Pink
    ALOLA: '#F1C40F',      // Yellow
    GALAR: '#2ECC71',      // Light Green
    HISUI: '#9B59B6',      // Deep Purple
    PALDEA: '#E67E22'      // Dark Orange
};

// Region display data
const REGION_DATA = [
    { key: 'KANTO', name: 'Kanto' },
    { key: 'JOHTO', name: 'Johto' },
    { key: 'HOENN', name: 'Hoenn' },
    { key: 'SINNOH', name: 'Sinnoh' },
    { key: 'UNOVA', name: 'Unova' },
    { key: 'KALOS', name: 'Kalos' },
    { key: 'ALOLA', name: 'Alola' },
    { key: 'GALAR', name: 'Galar' },
    { key: 'HISUI', name: 'Hisui' },
    { key: 'PALDEA', name: 'Paldea' }
];

export default function RegionalProgress({ pokedexProgress, pokedexData }) {
    return (
        <div className="regional-progress-container">
            <div className="regional-progress-header">
                <h2>
                    <img src={progressIcon} alt="Regional Progress" className="progress-header-icon" />
                    Regional Progress
                </h2>
                <p className="regional-description">Track your collection progress by region.</p>
            </div>

            <div className="regional-cards-grid">
                {REGION_DATA.map(region => {
                    const caught = pokedexProgress[region.key] || 0;
                    const total = pokedexData[region.key]?.totalPokemon || 0;
                    const percentage = total > 0 ? Math.round((caught / total) * 100) : 0;
                    const color = REGION_COLORS[region.key];

                    return (
                        <RegionalProgressCard
                            key={region.key}
                            region={region.name}
                            collected={caught}
                            total={total}
                            percentage={percentage}
                            color={color}
                            rank={null}
                        />
                    );
                })}
            </div>

            <div className="regional-info-footer">
                <span className="info-icon">ⓘ</span>
                <p>Progress is updated in real-time as you add to your collection.</p>
            </div>
        </div>
    );
}
