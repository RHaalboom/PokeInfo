import '../styles/overallProgress.css';
import progressIcon from '../img/Profile/Poké-info_Progress_Overall.png';
import nonRankIcon from '../img/Profile/Poké-info_NonRank_Overall.png';
import bronzeIcon from '../img/Profile/Poké-info_Bronze_Overall.png';
import silverIcon from '../img/Profile/Poké-info_Silver_Overall.png';
import goldIcon from '../img/Profile/Poké-info_Gold_Overall.png';
import diamondIcon from '../img/Profile/Poké-info_Diamond_Overall.png';

export default function OverallProgress({ collected, totalAvailable, percentage }) {
    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Determine rank and message
    const getRankInfo = () => {
        if (percentage >= 100) {
            return {
                rank: 'Diamond Collector',
                icon: diamondIcon,
                nextRank: null,
                nextPercentage: null,
                message: 'You\'ve achieved Diamond Collector status! You\'re a true Master Collector!'
            };
        } else if (percentage >= 75) {
            return {
                rank: 'Gold Collector',
                icon: goldIcon,
                nextRank: 'Diamond Collector',
                nextPercentage: '100%',
                message: 'Excellent progress! You\'re almost a Master Collector.'
            };
        } else if (percentage >= 50) {
            return {
                rank: 'Silver Collector',
                icon: silverIcon,
                nextRank: 'Gold Collector',
                nextPercentage: '75%',
                message: 'Great job! Keep collecting to reach Gold rank.'
            };
        } else if (percentage >= 25) {
            return {
                rank: 'Bronze Collector',
                icon: bronzeIcon,
                nextRank: 'Silver Collector',
                nextPercentage: '50%',
                message: 'Good start! Work towards Silver rank.'
            };
        } else {
            return {
                rank: 'Beginner',
                icon: nonRankIcon,
                nextRank: 'Bronze Collector',
                nextPercentage: '25%',
                message: 'Start your collection journey towards Bronze rank!'
            };
        }
    };

    const rankInfo = getRankInfo();

    return (
        <div className="overall-progress-container">
            <div className="overall-progress-header">
                <h2>
                    <img src={progressIcon} alt="Overall Progress" className="progress-header-icon" />
                    Overall Progress
                </h2>
                <p className="overall-description">Your total collection across all regions.</p>
            </div>

            <div className="overall-progress-content">
                {/* Left: Circular Progress */}
                <div className="overall-circle-section">
                    <svg
                        width={220}
                        height={220}
                        className="overall-progress-svg"
                        viewBox="0 0 220 220"
                    >
                        {/* Background circle */}
                        <circle
                            cx={110}
                            cy={110}
                            r={radius}
                            className="overall-progress-background"
                        />
                        {/* Progress circle */}
                        <circle
                            cx={110}
                            cy={110}
                            r={radius}
                            className="overall-progress-circle"
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset
                            }}
                        />
                    </svg>
                    <div className="overall-circle-text">
                        <span className="overall-percentage">{percentage}%</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="overall-divider"></div>

                {/* Middle: Stats */}
                <div className="overall-stats-section">
                    <div className="stats-row">
                        <div className="stats-display">
                            <div className="stat-number">{collected}</div>
                            <div className="stat-label">Collected</div>
                        </div>
                        <div className="stats-divider">/</div>
                        <div className="stats-display">
                            <div className="stat-number">{totalAvailable}</div>
                            <div className="stat-label">Total Available</div>
                        </div>
                    </div>
                    <div className="stats-message">
                        Keep going! You're on your way to becoming a <span className="highlight">Master Collector</span>.
                    </div>
                </div>

                {/* Divider */}
                <div className="overall-divider"></div>

                {/* Right: Master Collector Rank */}
                <div className="master-collector-section">
                    <div className="rank-badge">
                        <img src={rankInfo.icon} alt={rankInfo.rank} className="rank-icon" />
                    </div>
                    <div className="rank-content">
                        <div className="rank-info">
                            <h3 className="rank-name">{rankInfo.rank}</h3>
                            <p className="rank-message">
                                {rankInfo.nextPercentage ? `Next rank at ${rankInfo.nextPercentage}` : 'Maximum rank achieved!'}
                            </p>
                        </div>
                        <div className="rank-progress-container">
                            <div className="rank-progress-bar">
                                <div className="rank-progress-fill" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="rank-percentage">{percentage}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
