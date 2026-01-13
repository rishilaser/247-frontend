
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed
import { roleUtils } from '../../utils/authUtils'; // Adjust path as needed

const MainHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Header scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const scrollToElement = (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleNavigation = (e, targetId) => {
        e.preventDefault();
        if (location.pathname === '/') {
            if (targetId === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                scrollToElement(targetId);
            }
        } else {
            // Navigate to home with target
            navigate('/', { state: { targetId } });
        }
        setIsMobileMenuOpen(false);
    };

    // Handle CTA button clicks
    const handleCTAClick = (e, targetPath = '/upload') => {
        e.preventDefault();
        setIsMobileMenuOpen(false);

        if (!user) {
            window.open('/signup', '_blank');
        } else {
            const userRole = roleUtils.getUserRole(user);
            if (roleUtils.isAdmin(user) || roleUtils.isBackOffice(user) || roleUtils.isSubAdmin(user)) {
                navigate('/admin/dashboard');
            } else {
                navigate(targetPath);
            }
        }
    };

    return (
        <>
            {/* Top Bar */}
            <div
                className="text-white py-2"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1001,
                    background: 'linear-gradient(90deg, #2d3992 0%, #2d3992 100%)',
                    boxShadow: '0 2px 10px rgba(45, 57, 146, 0.3)',
                }}
            >
                <div className="container px-4 px-md-3 px-lg-5 px-sm-3">
                    <div className="row align-items-center">

                        {/* LEFT – Email & Phone */}
                        <div className="col-6 col-md-auto d-flex flex-column flex-md-row gap-1 gap-md-4">
                            <a
                                href="mailto:sales@247cutbend.in"
                                className="text-white text-decoration-none d-flex align-items-center gap-2"
                                style={{ fontSize: '14px' }}
                            >
                                <i className="far fa-envelope"></i>
                                <span>sales@247cutbend.in</span>
                            </a>

                            <a
                                href="tel:+919004073379"
                                className="text-white text-decoration-none d-flex align-items-center gap-2"
                                style={{ fontSize: '14px' }}
                            >
                                <i className="fas fa-phone"></i>
                                <span>+91 9004073379</span>
                            </a>
                        </div>

                        {/* RIGHT – Follow Us */}
                        <div className="col-6 col-md d-flex flex-column flex-md-row align-items-end align-items-md-center justify-content-end gap-1 gap-md-3">
                            <span style={{ fontSize: '14px' }}>Follow Us</span>

                            <div className="d-flex gap-2">
                                <a
                                    href="https://www.facebook.com/247cutbend/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.1)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <i className="fab fa-facebook-f" style={{ fontSize: '14px' }}></i>
                                </a>

                                <a
                                    href="https://www.instagram.com/247cutbend/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.1)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <i className="fab fa-instagram" style={{ fontSize: '14px' }}></i>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>


            {/* Header Area */}
            <header className="header" style={{
                background: isScrolled
                    ? 'linear-gradient(180deg, rgba(243,244,246,0.99) 0%, rgba(243,244,246,0.98) 100%)'
                    : 'linear-gradient(180deg, rgba(243,244,246,0.98) 0%, rgba(243,244,246,0.95) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: isScrolled
                    ? '0 4px 30px rgba(0,0,0,0.12)'
                    : '0 2px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                position: 'sticky',
                top: '40px',
                zIndex: 1000
            }}>
                {/* Navbar */}
                <div className="main-navigation">
                    <nav className="navbar navbar-expand-lg " style={{
                        minHeight: isScrolled ? '75px' : '90px',
                        transition: 'all 0.3s ease'
                    }}>
                        <div className="container position-relative mobile-nav-padding px-5">
                            <div className="navbar-brand" style={{
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'transform 0.3s ease',
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <img src="/Logo.png" alt="247CutBend logo" style={{
                                    height: isScrolled ? '30px' : '35px',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                    transition: 'all 0.3s ease'
                                }} />

                            </div>

                            {/* Desktop Menu - Hidden on mobile */}
                            <div className="d-none d-lg-flex align-items-center" style={{ flex: 1, justifyContent: 'flex-end' }}>
                                <ul className="navbar-nav justify-content-end flex-grow-1" style={{ alignItems: 'center', flexDirection: 'row' }}>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/" onClick={(e) => handleNavigation(e, 'home')} style={{
                                            padding: '8px 16px',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            color: '#1a1a1a',
                                            position: 'relative',
                                            transition: 'all 0.3s ease',
                                            borderRadius: '6px',
                                            margin: '0 4px'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#f15925';
                                                e.currentTarget.style.background = 'rgba(241, 89, 37, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#1a1a1a';
                                                e.currentTarget.style.background = 'transparent';
                                            }}>
                                            Home
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/" onClick={(e) => handleNavigation(e, 'counter-area')} style={{
                                            padding: '8px 16px',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            color: '#1a1a1a',
                                            position: 'relative',
                                            transition: 'all 0.3s ease',
                                            borderRadius: '6px',
                                            margin: '0 4px'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#f15925';
                                                e.currentTarget.style.background = 'rgba(241, 89, 37, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#1a1a1a';
                                                e.currentTarget.style.background = 'transparent';
                                            }}>
                                            About Us
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/" onClick={(e) => handleNavigation(e, 'counter-area')} style={{
                                            padding: '8px 16px',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            color: '#1a1a1a',
                                            position: 'relative',
                                            transition: 'all 0.3s ease',
                                            borderRadius: '6px',
                                            margin: '0 4px'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#f15925';
                                                e.currentTarget.style.background = 'rgba(241, 89, 37, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#1a1a1a';
                                                e.currentTarget.style.background = 'transparent';
                                            }}>
                                            Capabilities
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/" onClick={(e) => handleNavigation(e, 'quote-area')} style={{
                                            padding: '8px 16px',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            color: '#1a1a1a',
                                            position: 'relative',
                                            transition: 'all 0.3s ease',
                                            borderRadius: '6px',
                                            margin: '0 4px'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#f15925';
                                                e.currentTarget.style.background = 'rgba(241, 89, 37, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#1a1a1a';
                                                e.currentTarget.style.background = 'transparent';
                                            }}>
                                            Contact Us
                                        </a>
                                    </li>
                                </ul>
                                <div className="nav-right">
                                    <div className="nav-btn">
                                        <a
                                            href="/signup"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="theme-btn"
                                            style={{
                                                padding: '10px 24px',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                                                color: '#ffffff',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 15px rgba(241, 89, 37, 0.3)',
                                                transition: 'all 0.3s ease',
                                                border: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                textDecoration: 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(241, 89, 37, 0.4)';
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #f15925 0%, #f15925 100%)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(241, 89, 37, 0.3)';
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #f15925 0%, #f15925 100%)';
                                            }}>
                                            Login
                                            <i className="fas fa-arrow-right" style={{ fontSize: '12px', transition: 'transform 0.3s ease' }}></i>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Menu Toggle Button */}
                            <button
                                className="d-lg-none navbar-toggler"
                                type="button"
                                onClick={() => setIsMobileMenuOpen(true)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    outline: 'none'
                                }}
                                aria-label="Toggle navigation"
                            >
                                <i className="fas fa-bars" style={{
                                    fontSize: '24px',
                                    color: '#1a1a1a',
                                    transition: 'color 0.3s ease'
                                }}></i>
                            </button>
                        </div>
                    </nav>

                </div>
                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100vh',
                            background: 'rgba(0,0,0,0.4)',
                            zIndex: 999
                        }}
                    />
                )}

                {/* Mobile Menu */}
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: isMobileMenuOpen ? '0' : '-100%',
                        width: '280px',
                        height: '100vh',
                        background: '#fff',
                        zIndex: 1000,
                        transition: 'right 0.3s ease',
                        padding: '20px',
                        boxShadow: '-5px 0 20px rgba(0,0,0,0.1)'
                    }}
                    className="d-lg-none"
                >
                    {/* Close Button */}
                    <div style={{ textAlign: 'right' }}>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                fontSize: '22px',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Mobile Links */}
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                        {[
                            { label: 'Home', action: (e) => handleNavigation(e, 'home') },
                            { label: 'About Us', action: (e) => handleNavigation(e, 'counter-area') },
                            { label: 'Capabilities', action: (e) => handleNavigation(e, 'counter-area') },
                            { label: 'Contact Us', action: (e) => handleNavigation(e, 'quote-area') }
                        ].map((item, index) => (
                            <li key={index} style={{ marginBottom: '15px' }}>
                                <button
                                    onClick={item.action}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        padding: '10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Login Button */}
                    <a
                        href="/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'block',
                            marginTop: '20px',
                            padding: '12px',
                            background: '#f15925',
                            color: '#fff',
                            textAlign: 'center',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        Login
                    </a>
                </div>

            </header>
        </>
    );
};

export default MainHeader;
