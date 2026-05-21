import '../styles/circularProgress.css';

export default function CircularProgress({ percentage, pokedexName }) {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="circular-progress-container">
            <svg
                width={110}
                height={110}
                className="circular-progress-svg"
            >
                {/* Background circle */}
                <circle
                    cx={55}
                    cy={55}
                    r={radius}
                    className="progress-background"
                />
                {/* Progress circle */}
                <circle
                    cx={55}
                    cy={55}
                    r={radius}
                    className="progress-circle"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset
                    }}
                />
            </svg>
            <div className="progress-text">
                <span className="progress-percentage">{percentage}%</span>
                <span className="progress-label">{pokedexName}</span>
            </div>
        </div>
    );
}
