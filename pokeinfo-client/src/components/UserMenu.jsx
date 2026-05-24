import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout as logoutService } from "../services/authService";
import userIcon from "../img/Poké-info_User.png";
import userIconHover from "../img/Poké-info_User_hover.png";
import settingsIcon from "../img/Poké-info_Settings.png";
import settingsIconHover from "../img/Poké-info_Settings_hover.png";
import logoutIcon from "../img/Poké-info_Logout.png";
import logoutIconHover from "../img/Poké-info_Logout_hover.png";
import "../styles/userMenu.css";

export default function UserMenu({ onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isMenuOpen]);

    function handleLogout() {
        logoutService();
        onLogout();
        setIsMenuOpen(false);
        navigate("/");
    }

    function handleMenuItemClick() {
        setIsMenuOpen(false);
    }

    return (
        <div className="user-menu-container" ref={menuRef} data-cy="user-menu-container">
            <Link 
                to="/profile" 
                className="user-icon-link" 
                title="Go to Profile"
                onMouseEnter={() => setHoveredItem('userIcon')}
                onMouseLeave={() => setHoveredItem(null)}
                data-cy="user-profile-link"
            >
                <img 
                    src={hoveredItem === 'userIcon' ? userIconHover : userIcon} 
                    alt="User Profile" 
                    className="user-icon" 
                />
            </Link>

            <div className="hamburger-menu">
                <button 
                    className="hamburger-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Menu"
                    data-cy="hamburger-toggle"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {isMenuOpen && (
                    <div className="menu-dropdown" data-cy="menu-dropdown">
                        <Link 
                            to="/settings" 
                            className="menu-item"
                            onClick={handleMenuItemClick}
                            onMouseEnter={() => setHoveredItem('settings')}
                            onMouseLeave={() => setHoveredItem(null)}
                            data-cy="settings-link"
                        >
                            <img 
                                src={hoveredItem === 'settings' ? settingsIconHover : settingsIcon} 
                                alt="Settings" 
                                className="menu-icon" 
                            />
                            Settings
                        </Link>
                        <button 
                            className="menu-item menu-logout"
                            onClick={handleLogout}
                            onMouseEnter={() => setHoveredItem('logout')}
                            onMouseLeave={() => setHoveredItem(null)}
                            data-cy="logout-button"
                        >
                            <img 
                                src={hoveredItem === 'logout' ? logoutIconHover : logoutIcon} 
                                alt="Logout" 
                                className="menu-icon" 
                            />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
