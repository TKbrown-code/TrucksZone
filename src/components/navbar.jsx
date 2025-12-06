import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Profilepic from "../assets/userIconpro.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faHome, faInfoCircle, faEnvelope, faUser, faCog, faSignOutAlt, faTruck, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import Logo from "../assets/Logo.png";
import "../styles/navbar.css";


function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        // Prevent body scroll when menu is open
        document.body.style.overflow = isMobileMenuOpen ? 'unset' : 'hidden';
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = 'unset';
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('nav')) {
                closeMobileMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                closeMobileMenu();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav>
                <div className="navContainer">
                    <div className="logocontainer">
                        <Link to="/" onClick={closeMobileMenu}>
                            <img src={Logo} alt="TrucksZone Logo" className="logoImage" />
                            <h1 style={{color:"black"}}>Trucks<span style={{color:"red"}}>Zone</span></h1>
                        </Link>
                    </div>

                    <div className="linksContainer">
                        <ul className={isMobileMenuOpen ? 'mobile-menu-open' : ''}>
                            <li><Link to="/" onClick={closeMobileMenu}> Home</Link></li>
                            <li><Link to="/allTrucks" onClick={closeMobileMenu}> Trucks</Link></li>
                            <li><Link to="/contact" onClick={closeMobileMenu}> Contact</Link></li>
                            {user ? (
                                <>
                                    <div className="usermenuedropdown">
                                        <button className="dropbtn">
                                            <img src={Profilepic} alt="User Profile" />
                                        </button>
                                        <div className="usermenuedropdown-content">
                                            <ul>
                                                <li><Link to="/dashboard" onClick={closeMobileMenu}><FontAwesomeIcon icon={faUser} className="nav-icon" /> Profile</Link></li>
                                                <li><button onClick={() => { navigate('/dashboard'); closeMobileMenu(); }}><FontAwesomeIcon icon={faCog} className="nav-icon" /> Settings</button></li>
                                                <li><button onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" /> Logout</button></li>
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <li><Link to="/login" onClick={closeMobileMenu} className="loginbtn">Login</Link></li>
                            )}
                        </ul>
                    </div>

                    <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}>
                <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                    <div className="mobile-menu-header">
                        <img src={Logo} alt="TrucksZone Logo" className="mobile-menu-logo" />
                        <button className="mobile-menu-close" onClick={closeMobileMenu}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <ul>
                        <li><Link to="/" onClick={closeMobileMenu}><FontAwesomeIcon icon={faHome} className="nav-icon" /> Home</Link></li>
                        <li><Link to="/allTrucks" onClick={closeMobileMenu}><FontAwesomeIcon icon={faTruckFast} className="nav-icon" /> Trucks</Link></li>
                        <li><Link to="/contact" onClick={closeMobileMenu}><FontAwesomeIcon icon={faEnvelope} className="nav-icon" /> Contact</Link></li>
                        {user ? (
                            <>
                                <div className="mobile-user-section">
                                    <div className="mobile-user-info">
                                        <img src={Profilepic} alt="User Profile" className="mobile-user-avatar" />
                                        <span>User Account</span>
                                    </div>
                                    <div className="mobile-user-menu">
                                        <li><Link to="/dashboard" onClick={closeMobileMenu}><FontAwesomeIcon icon={faUser} className="nav-icon" /> Profile</Link></li>
                                        <li><button onClick={() => { navigate('/dashboard'); closeMobileMenu(); }}><FontAwesomeIcon icon={faCog} className="nav-icon" /> Settings</button></li>
                                        <li><button onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" /> Logout</button></li>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <li><Link to="/login" onClick={closeMobileMenu} className="mobile-login-btn">Login</Link></li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default Navbar;
