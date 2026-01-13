import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigate = (path, options) => (e) => {
    e.preventDefault();
    navigate(path, options);
    const hasTargetState = options?.state?.targetId || options?.state?.targetSequence;
    if (!hasTargetState) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="bg-[#2d3992] text-white relative overflow-hidden" style={{ position: 'relative' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ zIndex: 0 }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="blueprint" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint)" />
        </svg>
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
            {/* Company Info & Newsletter */}
            <div className="lg:col-span-2 mb-6 md:mb-0">
              <div className="mb-8">
                <img
                  src="/Logo.png"
                  alt="247CutBend Logo"
                  style={{ height: '50px', width: 'auto', marginBottom: '24px' }}
                />
              </div>

              <p style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.9rem',
                lineHeight: '1.8',
                marginBottom: '32px',
                maxWidth: '500px'
              }}>
                247CutBend, your trusted partner for precision cutting, bending, and metal fabrication services. With advanced technology and a commitment to quality.
              </p>

              {/* Newsletter */}
              <div>
                <h6 style={{
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  letterSpacing: '0.3px'
                }}>Subscribe Our Newsletter</h6>
                <form action="#" onSubmit={(e) => { e.preventDefault(); }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#ffffff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    maxWidth: '100%'
                  }}
                    className="newsletter-form">
                    <div style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      background: 'transparent'
                    }}>
                      <i className="far fa-envelope" style={{
                        color: '#f15925',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center'
                      }}></i>
                    </div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      required
                      style={{
                        flex: 1,
                        border: 'none',
                        padding: '10px 8px',
                        outline: 'none',
                        fontSize: '14px',
                        background: 'transparent',
                        color: '#333'
                      }}
                    />
                    <button type="submit" style={{
                      background: '#f15925',
                      color: '#000',
                      border: 'none',
                      padding: '10px 20px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      marginTop: '10px'
                    }}
                      className="newsletter-submit-btn"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f15925';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f15925';
                      }}>
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>

              {/* Social Media Icons */}
              <div style={{ marginTop: '24px' }}>
                <h6 style={{
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  letterSpacing: '0.3px'
                }}>Follow Us</h6>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#f15925',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f15925';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#f15925',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f15925';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#f15925',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f15925';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-6 md:mb-0">
              <h4 style={{
                color: '#ffffff',
                fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                fontWeight: '700',
                marginBottom: '24px',
                position: 'relative',
                paddingBottom: '12px',
                letterSpacing: '0.3px'
              }}>
                Quick Link
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '40px',
                  height: '3px',
                  background: '#f15925',
                  borderRadius: '2px'
                }}></span>
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '14px' }}>
                  <Link
                    to="/"
                    onClick={handleNavigate('/', { state: { targetId: 'about-area' } })}
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.paddingLeft = '4px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      e.currentTarget.style.paddingLeft = '0';
                    }}>
                    About Us
                  </Link>
                </li>
                {/* <li style={{ marginBottom: '14px' }}>
                  <Link
                    to="/blog-area"
                    state={{ targetId: 'blog-area' }}
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.paddingLeft = '4px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      e.currentTarget.style.paddingLeft = '0';
                    }}>
                    Blogs
                  </Link>
                </li>
                <li style={{ marginBottom: '14px' }}>
                  <Link
                    to="/faq-area"
                    state={{ targetId: 'faq-area' }}
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.paddingLeft = '4px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      e.currentTarget.style.paddingLeft = '0';
                    }}>
                    Faqs
                  </Link>
                </li> */}
                <li style={{ marginBottom: '14px' }}>
                  <Link
                    to="/terms-and-conditions"
                    onClick={handleNavigate('/terms-and-conditions')}
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.paddingLeft = '4px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      e.currentTarget.style.paddingLeft = '0';
                    }}>
                    Terms & Conditions
                  </Link>
                </li>
                <li style={{ marginBottom: '14px' }}>
                  <Link
                    to="/privacy-policy"
                    onClick={handleNavigate('/privacy-policy')}
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.paddingLeft = '4px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      e.currentTarget.style.paddingLeft = '0';
                    }}>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get In Touch */}
            <div className="mb-6 md:mb-0">
              <h4 style={{
                color: '#ffffff',
                fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                fontWeight: '700',
                marginBottom: '24px',
                position: 'relative',
                paddingBottom: '12px',
                letterSpacing: '0.3px'
              }}>
                Get In Touch
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '40px',
                  height: '3px',
                  background: '#f15925',
                  borderRadius: '2px'
                }}></span>
              </h4>
              <div style={{ marginTop: '8px' }}>
                {/* Address */}
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#f15925',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '14px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <MapPinIcon className="w-4 h-4" style={{ color: '#000' }} />
                  </div>
                  <div>
                    <p style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '6px'
                    }}>Our Address:</p>
                    <p style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.85rem',
                      lineHeight: '1.6',
                      margin: 0
                    }}>578-587 Savli GIDC Rd, Vadodara, Manjusar, Gujarat 391770, India</p>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#f15925',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '14px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <PhoneIcon className="w-4 h-4" style={{ color: '#000' }} />
                  </div>
                  <div>
                    <p style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '6px'
                    }}>Call Us:</p>
                    <a href="tel:+919512041116" style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f15925'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}>
                      +91 9004073379
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#f15925',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '14px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <EnvelopeIcon className="w-4 h-4" style={{ color: '#000' }} />
                  </div>
                  <div>
                    <p style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '6px'
                    }}>Mail Us:</p>
                    <a href="mailto:sales@247cutbend.in" style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f15925'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}>
                      sales@247cutbend.in
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.15)',
            marginTop: '50px',
            paddingTop: '24px',
            textAlign: 'center'
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.9rem',
              margin: 0,
              letterSpacing: '0.3px'
            }}>
              © Copyright {new Date().getFullYear()} Cutbend All Rights Reserved.
            </p>
          </div>
        </div>
      </div >
    </footer >
  );
};

export default Footer;
