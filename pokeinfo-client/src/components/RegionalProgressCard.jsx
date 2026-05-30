import firstPlaceIcon from '../img/Profile/Poké-info_First_Place.png';
import secondPlaceIcon from '../img/Profile/Poké-info_Second_Place.png';
import thirdPlaceIcon from '../img/Profile/Poké-info_Third_Place.png';

export default function RegionalProgressCard({ region, collected, total, percentage, color, rank }) {
    const regionInitial = region.charAt(0).toUpperCase();

    const getRankIcon = () => {
        switch(rank) {
            case 1:
                return firstPlaceIcon;
            case 2:
                return secondPlaceIcon;
            case 3:
                return thirdPlaceIcon;
            default:
                return null;
        }
    };

    const rankIcon = getRankIcon();

    return (
        <div className="regional-progress-card">
            <div className="card-header">
                <div className="region-circle" style={{ backgroundColor: color }}>
                    {regionInitial}
                </div>

                <div className="region-info">
                    <h3 className="region-name">{region}</h3>
                </div>

                {rankIcon && (
                    <div className="rank-badge">
                        <img src={rankIcon} alt={`Rank ${rank}`} className="rank-badge-icon" />
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