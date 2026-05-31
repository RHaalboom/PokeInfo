import firstPlaceIcon from '../img/Profile/Poké-info_First_Place.png';
import secondPlaceIcon from '../img/Profile/Poké-info_Second_Place.png';
import thirdPlaceIcon from '../img/Profile/Poké-info_Third_Place.png';
import noRankIcon from '../img/Profile/Poké-info_No_Rank.png';

export default function RegionalProgressCard({ region, collected, total, percentage, color, rank }) {
    const regionInitial = region.charAt(0).toUpperCase();

    const getRankDisplay = () => {
        // No Pokémon collected yet - show No_Rank image
        if (collected === 0) {
            return { type: 'image', value: noRankIcon, label: 'No Rank' };
        }

        // Pokémon collected - check ranking
        if (rank === null || rank === undefined) {
            return null; // User not in rankings yet
        }

        // Top 3 rankings - show medal icon
        if (rank >= 1 && rank <= 3) {
            switch(rank) {
                case 1:
                    return { type: 'image', value: firstPlaceIcon, label: `Rank ${rank}` };
                case 2:
                    return { type: 'image', value: secondPlaceIcon, label: `Rank ${rank}` };
                case 3:
                    return { type: 'image', value: thirdPlaceIcon, label: `Rank ${rank}` };
                default:
                    return null;
            }
        }

        // Rank 4 or lower - show rank number
        if (rank > 3) {
            return { type: 'text', value: rank, label: `Rank ${rank}` };
        }

        return null;
    };

    const rankDisplay = getRankDisplay();

    return (
        <div className="regional-progress-card">
            <div className="card-header">
                <div className="region-circle" style={{ backgroundColor: color }}>
                    {regionInitial}
                </div>

                <div className="region-info">
                    <h3 className="region-name">{region}</h3>
                </div>

                {rankDisplay && (
                    <div className="rank-badge">
                        {rankDisplay.type === 'image' ? (
                            <img src={rankDisplay.value} alt={rankDisplay.label} className="rank-badge-icon" />
                        ) : (
                                <div className="rank-badge-text">Rank {rankDisplay.value}</div>
                        )}
                    </div>
                )}
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar-background">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: color
                        }}
                    ></div>
                </div>
            </div>

            <div className="card-footer">
                <div className="region-count">
                    <span className="count-current">{collected}</span>
                    <span className="count-separator"> / </span>
                    <span className="count-total">{total}</span>
                </div>

                <div className="progress-percentage" style={{ color }}>
                    {percentage}%
                </div>
            </div>
        </div>
    );
}