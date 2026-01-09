import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { roleUtils } from '../utils/authUtils';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle CTA button clicks - redirect based on auth status and role
  const handleCTAClick = (e, targetPath = '/upload') => {
    e.preventDefault();

    if (!user) {
      // Not logged in - open signup in new tab
      window.open('/signup', '_blank');
    } else {
      // Logged in - redirect based on role
      const userRole = roleUtils.getUserRole(user);

      if (roleUtils.isAdmin(user) || roleUtils.isBackOffice(user) || roleUtils.isSubAdmin(user)) {
        // Admin/BackOffice/SubAdmin - redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // Customer - redirect to customer dashboard or target path
        navigate(targetPath);
      }
    }
  };

  // Smooth scroll to element without adding hash to URL
  const scrollToQuoteArea = (e) => {
    if (e) {
      e.preventDefault();
    }
    const element = document.getElementById('quote-area');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToAboutArea = (e) => {
    if (e) {
      e.preventDefault();
    }
    const element = document.getElementById('about-area');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToServiceArea = (e) => {
    if (e) {
      e.preventDefault();
    }
    const element = document.getElementById('service-area');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  useEffect(() => {
    // Wait for DOM and scripts to be ready
    const initializePlugins = () => {
      if (typeof window.jQuery === 'undefined') {
        setTimeout(initializePlugins, 100);
        return;
      }

      const $ = window.jQuery;
      // Multi level dropdown menu
      $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
        if (!$(this).next().hasClass('show')) {
          $(this).parents('.dropdown-menu').first().find('.show').removeClass('show');
        }
        var $subMenu = $(this).next('.dropdown-menu');
        $subMenu.toggleClass('show');
        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
          $('.dropdown-submenu .show').removeClass('show');
        });
        return false;
      });

      // Header Search
      if ($('.search-box-outer').length) {
        $('.search-box-outer').on('click', function () {
          $('body').addClass('search-active');
        });
        $('.close-search').on('click', function () {
          $('body').removeClass('search-active');
        });
      }

      // data-background
      $("[data-background]").each(function () {
        $(this).css("background-image", "url(" + $(this).attr("data-background") + ")");
      });

      // Sidebar popup
      $('.sidebar-btn').on('click', function () {
        $('.sidebar-popup').addClass('open');
        $('.sidebar-wrapper').addClass('open');
      });
      $('.close-sidebar-popup, .sidebar-popup').on('click', function () {
        $('.sidebar-popup').removeClass('open');
        $('.sidebar-wrapper').removeClass('open');
      });

      // WOW init
      if (window.WOW) {
        new window.WOW().init();
      }

      // Hero slider
      $('.hero-slider').owlCarousel({
        loop: true,
        nav: true,
        dots: true,
        margin: 0,
        autoplay: true,
        autoplayHoverPause: true,
        autoplayTimeout: 5000,
        items: 1,
        navText: [
          "<i class='far fa-long-arrow-left'></i>",
          "<i class='far fa-long-arrow-right'></i>"
        ],
        onInitialized: function (event) {
          var $firstAnimatingElements = $('.owl-item').eq(event.item.index).find("[data-animation]");
          doAnimations($firstAnimatingElements);
        },
        onChanged: function (event) {
          var $firstAnimatingElements = $('.owl-item').eq(event.item.index).find("[data-animation]");
          doAnimations($firstAnimatingElements);
        }
      });

      // Hero slider do animations
      function doAnimations(elements) {
        var animationEndEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        elements.each(function () {
          var $this = $(this);
          var $animationDelay = $this.data('delay');
          var $animationDuration = $this.data('duration');
          var $animationType = 'animated ' + $this.data('animation');
          $this.css({
            'animation-delay': $animationDelay,
            '-webkit-animation-delay': $animationDelay,
            'animation-duration': $animationDuration,
            '-webkit-animation-duration': $animationDuration,
          });
          $this.addClass($animationType).one(animationEndEvents, function () {
            $this.removeClass($animationType);
          });
        });
      }

      // Service slider
      $('.service-slider').owlCarousel({
        loop: true,
        margin: 15,
        nav: true,
        dots: false,
        autoplay: false,
        navText: [
          "<i class='far fa-arrow-left'></i>",
          "<i class='far fa-arrow-right'></i>"
        ],
        responsive: {
          0: {
            items: 1
          },
          600: {
            items: 2
          },
          1000: {
            items: 3
          },
          1100: {
            items: 4
          }
        }
      });

      // Testimonial slider
      $('.testimonial-slider').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        dots: true,
        autoplay: true,
        responsive: {
          0: {
            items: 1
          },
          600: {
            items: 2
          },
          1000: {
            items: 2
          }
        }
      });

      // Partner slider
      $('.partner-slider').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,
        navText: [
          "<i class='icofont-long-arrow-left'></i>",
          "<i class='icofont-long-arrow-right'></i>"
        ],
        dots: false,
        autoplay: true,
        responsive: {
          0: {
            items: 2
          },
          600: {
            items: 3
          },
          1000: {
            items: 6
          }
        }
      });

      // Preloader
      $(".preloader").fadeOut("slow");

      // Fun fact counter
      $('.counter').countTo();
      $('.counter-box').appear(function () {
        $('.counter').countTo();
      }, {
        accY: -100
      });

      // Magnific popup init
      $(".popup-gallery").magnificPopup({
        delegate: '.popup-img',
        type: 'image',
        gallery: {
          enabled: true
        },
      });

      $(".popup-youtube, .popup-vimeo, .popup-gmaps").magnificPopup({
        type: "iframe",
        mainClass: "mfp-fade",
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false
      });

      // Scroll to top
      $(window).scroll(function () {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
          $("#scroll-top").addClass('active');
        } else {
          $("#scroll-top").removeClass('active');
        }
      });

      $("#scroll-top").on('click', function () {
        $("html, body").animate({ scrollTop: 0 }, 1500);
        return false;
      });

      // Navbar fixed top
      $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
          $('.navbar').addClass("fixed-top");
        } else {
          $('.navbar').removeClass("fixed-top");
        }
      });

      // Copyright date
      let date = new Date().getFullYear();
      $("#date").html(date);

      // Nice select
      $('.select').niceSelect();
    };

    // Initialize after a short delay to ensure DOM is ready
    setTimeout(() => {
      initializePlugins();
    }, 500);

    return () => {
      // Cleanup: destroy carousels and remove event listeners
      if (typeof window.jQuery !== 'undefined') {
        const $ = window.jQuery;
        $('.hero-slider, .service-slider, .testimonial-slider, .partner-slider').trigger('destroy.owl.carousel');
      }
    };
  }, []);

  return (
    <div className="App">
      {/* Preloader */}
      <div className="preloader">
        <div className="loader-ripple">
          <div></div>
          <div></div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2" style={{
        position: 'sticky',
        top: 0,
        zIndex: 1001,
        background: 'linear-gradient(90deg, #2d3992 0%, #2d3992 50%, #2d3992 100%)',
        boxShadow: '0 2px 10px rgba(45, 57, 146, 0.3)'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              <div className="d-flex align-items-center gap-4 flex-wrap">
                <a href="mailto:sales@247cutbend.in" className="text-white text-decoration-none d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
                  <i className="far fa-envelope" style={{ fontSize: '16px' }}></i>
                  <span>sales@247cutbend.in</span>
                </a>
                <a href="tel:+919512041116" className="text-white text-decoration-none d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
                  <i className="far fa-phone" style={{ fontSize: '16px' }}></i>
                  <span>+91 9004073379</span>
                </a>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="d-flex align-items-center justify-content-end gap-3 flex-wrap">
                <span className="text-white" style={{ fontSize: '14px' }}>Follow Us:</span>
                <div className="d-flex align-items-center gap-2">
                  <a href="https://www.facebook.com/247cutbend/" target="_blank" rel="noopener noreferrer" className="text-white d-flex align-items-center justify-content-center" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <i className="fab fa-facebook-f" style={{ fontSize: '14px' }}></i>
                  </a>
                  <a href="#" className="text-white d-flex align-items-center justify-content-center" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <i className="fab fa-twitter" style={{ fontSize: '14px' }}></i>
                  </a>
                  <a href="https://www.instagram.com/247cutbend/" target="_blank" rel="noopener noreferrer" className="text-white d-flex align-items-center justify-content-center" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <i className="fab fa-instagram" style={{ fontSize: '14px' }}></i>
                  </a>
                  <a href="#" className="text-white d-flex align-items-center justify-content-center" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <i className="fab fa-linkedin-in" style={{ fontSize: '14px' }}></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Area */}
      <header className="header" style={{
        padding: '0',
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
        <div className="main-navigation" style={{ padding: '0' }}>
          <nav className="navbar navbar-expand-lg" style={{
            minHeight: isScrolled ? '75px' : '90px',
            transition: 'all 0.3s ease'
          }}>
            <div className="container position-relative">
              <div className="navbar-brand" style={{
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.3s ease'
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                {/* <img src="https://www.247cutbend.in/assets/img/logo%20(2).png" alt="logo" /> */}
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
                    <a className="nav-link" href="/" style={{
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
                    <a className="nav-link" href="/" onClick={scrollToAboutArea} style={{
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
                    <a className="nav-link" href="/" onClick={scrollToAboutArea} style={{
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
                    <a className="nav-link" href="/" onClick={scrollToQuoteArea} style={{
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

              {/* Mobile Menu Toggle Button - Visible only on mobile */}
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
      </header>

      {/* Mobile Sidebar - Outside navbar for full screen coverage */}
      <div
        className="mobile-sidebar-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          opacity: isMobileMenuOpen ? 1 : 0,
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          transition: 'all 0.3s ease',
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
        }}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <div
        className="mobile-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '280px',
          height: '100vh',
          background: '#fff',
          zIndex: 10000,
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto'
        }}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <img src="/Logo.png" alt="247CutBend Logo" style={{
            height: '35px',
            width: 'auto',
            objectFit: 'contain'
          }} />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '24px',
              color: '#1a1a1a',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>

        <div style={{ padding: '15px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <a
                href="/"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  padding: '12px 15px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f15925';
                  e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1a1a1a';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Home
              </a>
            </li>
            <li style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <a
                href="/"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  scrollToAboutArea(e);
                }}
                style={{
                  display: 'block',
                  padding: '12px 15px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f15925';
                  e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1a1a1a';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                About Us
              </a>
            </li>
            <li style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <a
                href="/"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  scrollToAboutArea(e);
                }}
                style={{
                  display: 'block',
                  padding: '12px 15px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f15925';
                  e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1a1a1a';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Capabilities
              </a>
            </li>
            <li style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <a
                href="/"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  scrollToQuoteArea(e);
                }}
                style={{
                  display: 'block',
                  padding: '12px 15px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f15925';
                  e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1a1a1a';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Contact Us
              </a>
            </li>
          </ul>

          <div style={{ padding: '15px', display: 'flex', justifyContent: 'flex-start' }}>
            <a
              href="/signup"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="theme-btn"
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                color: '#000',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                transition: 'all 0.3s ease',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
                width: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              Login
              <i className="fas fa-arrow-right" style={{ fontSize: '11px' }}></i>
            </a>
          </div>
        </div>
      </div>

      {/* Popup Search */}
      <div className="search-popup">
        <button className="close-search"><span className="far fa-times"></span></button>
        <form action="#">
          <div className="form-group">
            <input type="search" name="search-field" className="form-control" placeholder="Search Here..." required />
            <button type="submit"><i className="far fa-search"></i></button>
          </div>
        </form>
      </div>

      {/* Sidebar Popup */}
      <div className="sidebar-popup offcanvas offcanvas-end" tabIndex="-1" id="sidebarPopup">
        <div className="offcanvas-header">
          <div className="sidebar-popup-logo">
            <img src="/Logo.png" alt="" style={{ height: '35px', width: 'auto' }} />
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close">
            <i className="far fa-xmark"></i>
          </button>
        </div>
        <div className="sidebar-popup-wrap offcanvas-body">
          <div className="sidebar-popup-content">
            <div className="sidebar-popup-about">
              <h4>About Us</h4>
              <p>247CutBend, your trusted partner for precision cutting, bending, and metal fabrication services. With advanced technology and a commitment to quality,</p>
            </div>
            <div className="sidebar-popup-contact">
              <h4>Contact Info</h4>
              <ul>
                <li>
                  <div className="icon">
                    <i className="far fa-envelope"></i>
                  </div>
                  <div className="content">
                    <h6>Email</h6>
                    <a href="#"><span className="__cf_email__">support@247cutbend.in</span></a>
                  </div>
                </li>
                <li>
                  <div className="icon">
                    <i className="far fa-phone"></i>
                  </div>
                  <div className="content">
                    <h6>Phone</h6>
                    <a href="tel:+21236547898">+91 99300 04026</a>
                  </div>
                </li>
                <li>
                  <div className="icon">
                    <i className="far fa-location-dot"></i>
                  </div>
                  <div className="content">
                    <h6>Address</h6>
                    <a href="#">578-587 Savli GIDC Rd, Vadodara, Manjusar, Gujarat 391770, India</a>
                  </div>
                </li>
              </ul>
            </div>
            <div className="sidebar-popup-social">
              <h4>Follow Us</h4>
              <a href="https://www.facebook.com/247cutbend/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-x-twitter"></i></a>
              <a href="https://www.instagram.com/247cutbend/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
      </div>

      <main className="main">
        {/* Hero Area */}
        <div className="hero-section" id='home'>
          <div className="hero-slider owl-carousel">
            <div className="hero-single">
              <video muted loop autoPlay>
                <source src="/assets/img/cns.mp4" type="video/mp4" />
              </video>
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-md-12 col-lg-8">
                    <div className="hero-content">
                      <p className="hero-sub-title" data-animation="fadeInUp" data-delay=".25s" style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
                        Quick Delivery & Cheapest Price at
                      </p>
                      <h3 className="hero-title" data-animation="fadeInRight" data-delay=".50s" style={{ marginBottom: '15px', marginTop: '10px' }}>
                        247 Cut Bend<br />
                        Your Partner for<br />
                        Custom Metal Fabrication
                      </h3>
                      <div className="hero-btn" data-animation="fadeInUp" data-delay="1s" style={{ marginTop: '15px' }}>
                        <a
                          href="#"
                          className="theme-btn"
                          onClick={(e) => handleCTAClick(e, '/upload')}
                        >
                          Click to Upload Your File
                          <i className="fas fa-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Area - Commented out for now */}
        {false && <div className="partner-area pt-negative">
          <div className="container-fluid">
            <div className="col-lg-12">
              <div className="partner-wrap">
                <div className="partner-wrapper partner-slider owl-carousel owl-theme">
                  <img className="partner-wrapper-img" src="/assets/img/partner/01.jpg" alt="thumb" />
                  <img className="partner-wrapper-img" src="/assets/img/partner/02.jpg" alt="thumb" />
                  <img className="partner-wrapper-img" src="/assets/img/partner/03.jpg" alt="thumb" />
                  <img className="partner-wrapper-img" src="/assets/img/partner/04.jpg" alt="thumb" />
                  <img className="partner-wrapper-img" src="/assets/img/partner/05.jpg" alt="thumb" />
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* Company Stats & Features Banner */}
        <div className="company-stats-banner">
          {/* SVG Background Decoration */}
          <div className="stats-banner-svg-bg">
            <svg width="100%" height="100%" viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              {/* Geometric patterns */}
              <circle cx="100" cy="100" r="80" fill="rgba(241, 89, 37, 0.08)" opacity="0.6" />
              <circle cx="1100" cy="100" r="90" fill="rgba(241, 89, 37, 0.06)" opacity="0.5" />
              <path d="M600 20 L650 80 L750 80 L680 120 L720 180 L600 140 L480 180 L520 120 L450 80 L550 80 Z" fill="rgba(241, 89, 37, 0.05)" opacity="0.4" />
              {/* Decorative lines */}
              <line x1="0" y1="50" x2="1200" y2="50" stroke="rgba(241, 89, 37, 0.1)" strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="150" x2="1200" y2="150" stroke="rgba(241, 89, 37, 0.1)" strokeWidth="1" opacity="0.3" />
              {/* Small decorative circles */}
              <circle cx="200" cy="50" r="15" fill="rgba(241, 89, 37, 0.1)" opacity="0.4" />
              <circle cx="1000" cy="150" r="20" fill="rgba(241, 89, 37, 0.08)" opacity="0.35" />
              <circle cx="300" cy="150" r="12" fill="rgba(241, 89, 37, 0.12)" opacity="0.4" />
              <circle cx="900" cy="50" r="18" fill="rgba(241, 89, 37, 0.09)" opacity="0.3" />
            </svg>
          </div>
          <div className="container">
            <div className="stats-banner-content">
              <div className="stat-item">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="stat-text">Instant Quotes & Fast Turnaround</div>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-industry"></i>
                </div>
                <div className="stat-text">Laser Cutting | CNC Bending | Fabrication</div>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-text">Prototype to Mass Production</div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Area */}
        <div className="process-area" style={{ background: '#ffffff' }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="site-heading text-center wow fadeInDown" data-wow-delay=".25s">
                  <h2 className="site-title" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1a1a1a' }}>
                    How It <span style={{ color: '#f15925' }}>Works</span>
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: 0, maxWidth: '700px', margin: '0 auto' }}>
                    Fast, factory-direct metal parts in just a few clicks. From file upload to delivery, we make production simple and transparent.
                  </p>
                </div>
              </div>
            </div>

            {/* Process Flow Line with Numbered Circles */}
            <div className="row d-none d-lg-flex" style={{ position: 'relative', marginTop: '20px', marginBottom: '20px' }}>
              <div className="col-12" style={{ position: 'relative', height: '60px' }}>
                {/* Horizontal Line */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '10%',
                  right: '10%',
                  height: '4px',
                  background: '#f15925',
                  transform: 'translateY(-50%)',
                  zIndex: 0
                }}></div>

                {/* Numbered Circles - Evenly spaced for 5 items */}
                {[1, 2, 3, 4, 5].map((num, index) => {
                  const positions = [10, 30, 50, 70, 90]; // Evenly distributed percentages
                  return (
                    <div key={num} style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${positions[index]}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: '#2d3992',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      boxShadow: '0 4px 15px rgba(45, 57, 146, 0.3)'
                    }}>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#ffffff'
                      }}>{num}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Process Steps Cards */}
            <div className="process-wrap wow fadeInUp" data-wow-delay=".25s" style={{ marginTop: '10px' }}>
              <div className="row" style={{ display: 'flex', flexWrap: 'nowrap', margin: 0, gap: '10px' }}>
                {/* Step 1 */}
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <a
                    href="#"
                    style={{ textDecoration: 'none', display: 'block' }}
                    onClick={(e) => handleCTAClick(e, '/dashboard')}
                  >
                    <div className="process-item" style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '15px 12px',
                      border: '3px solid #e0e0e0',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 89, 37, 0.15)';
                        e.currentTarget.style.borderColor = '#f15925';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }}>
                      <div className="icon" style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        background: '#f15925',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '15px'
                      }}>
                        <i className="fas fa-upload" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                      </div>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#2d3992',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>Upload Your Files</h4>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        lineHeight: '1.5',
                        margin: 0
                      }}>Redirect to upload section in Dashboard</p>
                    </div>
                  </a>
                </div>

                {/* Step 2 */}
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <div className="process-item" style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '18px 15px',
                    border: '3px solid #e0e0e0',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 89, 37, 0.15)';
                      e.currentTarget.style.borderColor = '#f15925';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }}>
                    <div className="icon" style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      background: '#f15925',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '15px'
                    }}>
                      <i className="fas fa-file-invoice-dollar" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                    </div>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>Get a Quote in 2 Hours</h4>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      lineHeight: '1.5',
                      margin: 0
                    }}>Receive detailed pricing and quote within 2 hours of file submission</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <div className="process-item" style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '18px 15px',
                    border: '3px solid #e0e0e0',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 89, 37, 0.15)';
                      e.currentTarget.style.borderColor = '#f15925';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }}>
                    <div className="icon" style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      background: '#f15925',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '15px'
                    }}>
                      <i className="fas fa-check-circle" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                    </div>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>Order Acknowledgement</h4>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      lineHeight: '1.5',
                      margin: 0
                    }}>Order acknowledgement within 10 minutes</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <div className="process-item" style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '18px 15px',
                    border: '3px solid #e0e0e0',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 89, 37, 0.15)';
                      e.currentTarget.style.borderColor = '#f15925';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }}>
                    <div className="icon" style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      background: '#f15925',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '15px'
                    }}>
                      <i className="fas fa-clock" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                    </div>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>Delivery Time Confirmation</h4>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      lineHeight: '1.5',
                      margin: 0
                    }}>Delivery time confirmation in 1 hour</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <div className="process-item" style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '18px 15px',
                    border: '3px solid #e0e0e0',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(241, 89, 37, 0.15)';
                      e.currentTarget.style.borderColor = '#f15925';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }}>
                    <div className="icon" style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      background: '#f15925',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '15px'
                    }}>
                      <i className="fas fa-truck-fast" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                    </div>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>Fast Delivery</h4>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      lineHeight: '1.5',
                      margin: 0
                    }}>Fast delivery within 24–36 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row  mx-3">
          <div className="col-lg-12">
            <div className="note-banner-content">
              <div className="note-banner-icon">
                <i className="fas fa-info-circle"></i>
              </div>
              <div className="note-banner-text">
                <span className="highlight">Advance payment</span> ensures immediate processing and guaranteed production slotting
              </div>
            </div>
          </div>
        </div>


        {/* Counter Area */}
        <div className="counter-area pt-20 pb-20">
          <div className="container">
            <div className="row g-4 justify-content-center">
              <div className="col-md-6 col-lg-4 col-xl-3">
                <div className="counter-item wow fadeInUp" data-wow-delay=".25s">
                  <div className="icon" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid #f15925'
                  }}>
                    <img src="/assets/img/icon/construction.svg" alt="" style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain',
                      filter: 'brightness(0) saturate(100%) invert(49%) sepia(94%) saturate(1352%) hue-rotate(349deg) brightness(104%) contrast(96%)'
                    }} />
                  </div>
                  <div className="content">
                    <div className="info">
                      <span className="counter" data-count="+" data-to="150" data-speed="3000">400</span>
                      <span className="unit">+</span>
                    </div>
                    <h6 className="title">Employees</h6>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 col-xl-3">
                <div className="counter-item wow fadeInDown" data-wow-delay=".25s">
                  <div className="icon" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid #f15925'
                  }}>
                    <img src="/assets/img/icon/happy.svg" alt="" style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain',
                      filter: 'brightness(0) saturate(100%) invert(49%) sepia(94%) saturate(1352%) hue-rotate(349deg) brightness(104%) contrast(96%)'
                    }} />
                  </div>
                  <div className="content">
                    <div className="info">
                      <span className="counter" data-count="+" data-to="25" data-speed="3000">50</span>
                      <span className="unit">+</span>
                    </div>
                    <h6 className="title">Laser Machines</h6>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 col-xl-3">
                <div className="counter-item wow fadeInUp" data-wow-delay=".25s">
                  <div className="icon" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid #f15925'
                  }}>
                    <img src="/assets/img/icon/team-2.svg" alt="" style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain',
                      filter: 'brightness(0) saturate(100%) invert(49%) sepia(94%) saturate(1352%) hue-rotate(349deg) brightness(104%) contrast(96%)'
                    }} />
                  </div>
                  <div className="content">
                    <div className="info">
                      <span className="counter" data-count="+" data-to="120" data-speed="3000">75</span>
                      <span className="unit">+</span>
                    </div>
                    <h6 className="title">Press Brakes</h6>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 col-xl-3">
                <div className="counter-item wow fadeInDown" data-wow-delay=".25s">
                  <div className="icon" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid #f15925'
                  }}>
                    <img src="/assets/img/icon/award.svg" alt="" style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain',
                      filter: 'brightness(0) saturate(100%) invert(49%) sepia(94%) saturate(1352%) hue-rotate(349deg) brightness(104%) contrast(96%)'
                    }} />
                  </div>
                  <div className="content">
                    <div className="info">
                      <span className="counter" data-count="+" data-to="50" data-speed="3000">1000</span>
                      <span className="unit">+</span>
                    </div>
                    <h6 className="title">Ton Processing capacity</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Area */}
        <div className="about-area" id="about-area" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="container">
            <div className="row" style={{ display: 'flex', alignItems: 'stretch', margin: 0 }}>
              <div className="col-lg-6" style={{ display: 'flex', alignItems: 'stretch', paddingLeft: '10px', paddingRight: '10px' }}>
                <div className="about-left wow fadeInLeft" data-wow-delay=".25s" style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'space-between', margin: 0 }}>
                  <div className="about-img" style={{ flex: 1, margin: 0 }}>
                    <img className="img-1" src="/assets/img/cutting-tool.jpg" alt="" />
                    <img className="img-2" src="/assets/img/laserrr.jpg" alt="" />
                  </div>
                  <div className="about-experience" style={{ marginTop: '15px' }}>
                    <h5>30<span>+</span></h5>
                    <p>Years Of Experience</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6" style={{ display: 'flex', alignItems: 'stretch', paddingLeft: '10px', paddingRight: '10px' }}>
                <div className="about-right wow fadeInUp" data-wow-delay=".25s" style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'flex-start', margin: 0 }}>
                  <div className="site-heading">
                    <h3 className="site-title" style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      lineHeight: '1.2'
                    }}>
                      <span style={{ color: '#2d3992' }}>Manufacturing</span>{' '}
                      <span style={{ color: '#f15925' }}>Capabilities</span>
                    </h3>
                  </div>
                  <p className="about-text" style={{ marginBottom: '12px', marginTop: '8px', fontSize: '1rem', color: '#666', lineHeight: '1.7' }}>
                    247CutBend is your partner in custom- cut metal plates and bend products. We are at your service day and night for the perfect semi-finished metal parts.
                  </p>

                  <div style={{
                    background: '#f8f9fa',
                    borderLeft: '4px solid #f15925',
                    padding: '10px 12px',
                    marginBottom: '12px',
                    borderRadius: '8px',
                    fontStyle: 'italic',
                    color: '#2d3992',
                    fontSize: '1rem',
                    lineHeight: '1.6'
                  }}>
                    "Our facility handles more than 5,000 tons of stainless steel and carbon steel annually, ensuring consistent capacity, reliability, and high-volume production capability."
                  </div>

                  <div className="about-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        marginBottom: '12px',
                        marginTop: 0,
                        lineHeight: '1.6'
                      }}>
                        Based in <strong style={{ color: '#2d3992' }}>Vadodara</strong>, our production centre spans <strong style={{ color: '#2d3992' }}>5,000 m²</strong>, and operates with:
                      </p>

                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '12px 15px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                      }}>
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0
                        }}>
                          <li style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '0.95rem',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.paddingLeft = '5px';
                              e.currentTarget.style.color = '#2d3992';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.paddingLeft = '0';
                              e.currentTarget.style.color = '#333';
                            }}>
                            <span style={{
                              color: '#f15925',
                              marginRight: '12px',
                              fontSize: '1.3rem',
                              fontWeight: 'bold'
                            }}>•</span>
                            <strong style={{ color: '#2d3992', marginRight: '8px', fontSize: '1.05rem' }}>10</strong> laser cutting machines
                          </li>
                          <li style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '0.95rem',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.paddingLeft = '5px';
                              e.currentTarget.style.color = '#2d3992';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.paddingLeft = '0';
                              e.currentTarget.style.color = '#333';
                            }}>
                            <span style={{
                              color: '#f15925',
                              marginRight: '12px',
                              fontSize: '1.3rem',
                              fontWeight: 'bold'
                            }}>•</span>
                            <strong style={{ color: '#2d3992', marginRight: '8px', fontSize: '1.05rem' }}>15</strong> high-precision bending machines
                          </li>
                          <li style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '0.95rem',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.paddingLeft = '5px';
                              e.currentTarget.style.color = '#2d3992';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.paddingLeft = '0';
                              e.currentTarget.style.color = '#333';
                            }}>
                            <span style={{
                              color: '#f15925',
                              marginRight: '12px',
                              fontSize: '1.3rem',
                              fontWeight: 'bold'
                            }}>•</span>
                            <strong style={{ color: '#2d3992', marginRight: '8px', fontSize: '1.05rem' }}>60</strong> skilled metal-fabrication professionals
                          </li>
                          <li style={{
                            padding: '8px 0',
                            fontSize: '0.95rem',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.paddingLeft = '5px';
                              e.currentTarget.style.color = '#2d3992';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.paddingLeft = '0';
                              e.currentTarget.style.color = '#333';
                            }}>
                            <span style={{
                              color: '#f15925',
                              marginRight: '12px',
                              fontSize: '1.3rem',
                              fontWeight: 'bold'
                            }}>•</span>
                            <span style={{ marginRight: '8px' }}>Materials processed:</span> <strong style={{ color: '#2d3992', fontSize: '1.05rem' }}>Stainless Steel</strong> <span style={{ margin: '0 6px' }}>&</span> <strong style={{ color: '#f15925', fontSize: '1.05rem' }}>Carbon Steel</strong>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Area - Commented out for now */}
        {false && <div className="service-area bg py-100" id="service-area" style={{ background: '#ffffff' }}>
          <div className="container">
            <div className="row g-4 align-items-center mb-5">
              <div className="col-lg-6">
                <div className="site-heading mb-0">
                  <h2 className="site-title" style={{
                    fontSize: '2.8rem',
                    fontWeight: '700',
                    color: '#2d3992',
                    marginBottom: '20px',
                    lineHeight: '1.2'
                  }}>
                    Our <span style={{ color: '#f15925' }}>Capabilities</span>
                  </h2>
                </div>
              </div>
              <div className="col-lg-6">
                <p style={{
                  fontSize: '1.05rem',
                  color: '#666',
                  lineHeight: '1.8',
                  margin: 0
                }}>
                  Explore our state-of-the-art machinery and advanced fabrication capabilities designed to meet your precision manufacturing needs with unmatched quality and efficiency.
                </p>
              </div>
            </div>
            <div className="row g-4 mt-4">
              {/* Service Card 1 */}
              <div className="col-md-6 col-lg-3">
                <div className="service-item" style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(241, 89, 37, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 25px rgba(0,0,0,0.08)';
                  }}>
                  <span className="count" style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '20px',
                    fontSize: '5rem',
                    fontWeight: '900',
                    color: 'rgba(0, 44, 91, 0.08)',
                    lineHeight: '1',
                    zIndex: 0,
                    fontFamily: 'Arial, sans-serif'
                  }}>01</span>
                  <div className="service-img" style={{
                    width: '100%',
                    height: '220px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f8f9fa'
                  }}>
                    <img src="/assets/img/Machine1.png" alt="GN Laser Cutting Machine" style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }} />
                  </div>
                  <div className="service-content" style={{
                    padding: '20px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h4 className="service-title" style={{
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '15px',
                      lineHeight: '1.3'
                    }}>
                      <a href="#" style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f15925'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2d3992'}>
                        The GN Laser Cutting Machine
                      </a>
                    </h4>
                    <p className="service-text" style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      lineHeight: '1.7',
                      marginBottom: '20px',
                      flex: 1
                    }}>
                      The GN Laser Cutting Machine (Model GN NCF3015-E, 2017) is a high-precision industrial laser cutter with 2.2KW laser power and a 3x1.5m working area, featuring Cypcut control for automation.
                    </p>
                    <a href="#" className="theme-btn" style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                      color: '#000',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(241, 89, 37, 0.3)',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      width: 'fit-content',
                      marginTop: 'auto'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(241, 89, 37, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(241, 89, 37, 0.3)';
                      }}>
                      Learn More
                      <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="col-md-6 col-lg-3">
                <div className="service-item" style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 193, 7, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 25px rgba(0,0,0,0.08)';
                  }}>
                  <span className="count" style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '20px',
                    fontSize: '5rem',
                    fontWeight: '900',
                    color: 'rgba(0, 44, 91, 0.08)',
                    lineHeight: '1',
                    zIndex: 0,
                    fontFamily: 'Arial, sans-serif'
                  }}>02</span>
                  <div className="service-img" style={{
                    width: '100%',
                    height: '220px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f8f9fa'
                  }}>
                    <img src="/assets/img/Machine1.png" alt="Press Brake Machine" style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }} />
                  </div>
                  <div className="service-content" style={{
                    padding: '20px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h4 className="service-title" style={{
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '15px',
                      lineHeight: '1.3'
                    }}>
                      <a href="#" style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f15925'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2d3992'}>
                        Advanced Press Brake
                      </a>
                    </h4>
                    <p className="service-text" style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      lineHeight: '1.7',
                      marginBottom: '20px',
                      flex: 1
                    }}>
                      Our advanced press brake machines deliver precise bending operations with high accuracy. Perfect for creating complex angles and shapes in various metal materials.
                    </p>
                    <a href="#" className="theme-btn" style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                      color: '#000',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      width: 'fit-content',
                      marginTop: 'auto'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.3)';
                      }}>
                      Learn More
                      <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Service Card 3 */}
              <div className="col-md-6 col-lg-3">
                <div className="service-item" style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 193, 7, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 25px rgba(0,0,0,0.08)';
                  }}>
                  <span className="count" style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '20px',
                    fontSize: '5rem',
                    fontWeight: '900',
                    color: 'rgba(0, 44, 91, 0.08)',
                    lineHeight: '1',
                    zIndex: 0,
                    fontFamily: 'Arial, sans-serif'
                  }}>03</span>
                  <div className="service-img" style={{
                    width: '100%',
                    height: '220px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f8f9fa'
                  }}>
                    <img src="/assets/img/Machine1.png" alt="Welding Services" style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }} />
                  </div>
                  <div className="service-content" style={{
                    padding: '20px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h4 className="service-title" style={{
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '15px',
                      lineHeight: '1.3'
                    }}>
                      <a href="#" style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f15925'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2d3992'}>
                        Precision Welding Services
                      </a>
                    </h4>
                    <p className="service-text" style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      lineHeight: '1.7',
                      marginBottom: '20px',
                      flex: 1
                    }}>
                      Professional welding services using advanced techniques and equipment to ensure strong, durable joints for all your metal fabrication requirements.
                    </p>
                    <a href="#" className="theme-btn" style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                      color: '#000',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      width: 'fit-content',
                      marginTop: 'auto'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.3)';
                      }}>
                      Learn More
                      <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Service Card 4 */}
              <div className="col-md-6 col-lg-3">
                <div className="service-item" style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 193, 7, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 25px rgba(0,0,0,0.08)';
                  }}>
                  <span className="count" style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '20px',
                    fontSize: '5rem',
                    fontWeight: '900',
                    color: 'rgba(0, 44, 91, 0.08)',
                    lineHeight: '1',
                    zIndex: 0,
                    fontFamily: 'Arial, sans-serif'
                  }}>04</span>
                  <div className="service-img" style={{
                    width: '100%',
                    height: '220px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f8f9fa'
                  }}>
                    <img src="/assets/img/Machine1.png" alt="Design & Development" style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }} />
                  </div>
                  <div className="service-content" style={{
                    padding: '20px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h4 className="service-title" style={{
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '15px',
                      lineHeight: '1.3'
                    }}>
                      <a href="#" style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f15925'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2d3992'}>
                        Design & Development
                      </a>
                    </h4>
                    <p className="service-text" style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      lineHeight: '1.7',
                      marginBottom: '20px',
                      flex: 1
                    }}>
                      Complete design and development services from concept to production, helping you bring your ideas to life with expert engineering support.
                    </p>
                    <a href="#" className="theme-btn" style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                      color: '#000',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      width: 'fit-content',
                      marginTop: 'auto'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(5px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.3)';
                      }}>
                      Learn More
                      <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* Testimonial Area */}
        <div className="testimonial-area ts-bg pt-50">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                <div className="site-heading wow fadeInDown" data-wow-delay=".25s">
                  <h2 className="site-title text-white">What Our Client <span>Say's</span> about us</h2>
                  <p className="text-white">
                    It is a long established fact that a reader will be distracted by the readable content
                    of a page when Internet tend to repeat predefined chunks.
                  </p>
                  <a className="theme-btn mt-30"
                    onClick={() =>
                      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })
                    }>Know More <i className="fas fa-arrow-right"></i></a>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="testimonial-slider owl-carousel owl-theme wow fadeInUp" data-wow-delay=".25s">
                  <div className="testimonial-item">
                    <div className="testimonial-content">
                      <div className="testimonial-author-img">
                        <img src="/assets/img/testimonial/NoPhofile.png" alt="" />
                      </div>
                      <div className="testimonial-author-info">
                        <h4>Niesha Phips</h4>
                        <p>Customer</p>
                        <div className="testimonial-rate">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                      </div>
                    </div>
                    <div className="testimonial-quote">
                      <div className="testimonial-quote-icon">
                        <img src="/assets/img/icon/quote.svg" alt="" />
                      </div>
                      <p>
                        There are many variations passage available the majority have suffered of alteration in some form by the injected humour or randomised words which look even slightly believable.
                      </p>
                    </div>
                  </div>
                  <div className="testimonial-item">
                    <div className="testimonial-content">
                      <div className="testimonial-author-img">
                        <img src="/assets/img/testimonial/NoPhofile.png" alt="" />
                      </div>
                      <div className="testimonial-author-info">
                        <h4>Daniel Porter</h4>
                        <p>Customer</p>
                        <div className="testimonial-rate">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                      </div>
                    </div>
                    <div className="testimonial-quote">
                      <div className="testimonial-quote-icon">
                        <img src="/assets/img/icon/quote.svg" alt="" />
                      </div>
                      <p>
                        There are many variations passage available the majority have suffered of alteration in some form by the injected humour or randomised words which look even slightly believable.
                      </p>
                    </div>
                  </div>
                  <div className="testimonial-item">
                    <div className="testimonial-content">
                      <div className="testimonial-author-img">
                        <img src="/assets/img/testimonial/NoPhofile.png" alt="" />
                      </div>
                      <div className="testimonial-author-info">
                        <h4>Ebony Swihart</h4>
                        <p>Customer</p>
                        <div className="testimonial-rate">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                      </div>
                    </div>
                    <div className="testimonial-quote">
                      <div className="testimonial-quote-icon">
                        <img src="/assets/img/icon/quote.svg" alt="" />
                      </div>
                      <p>
                        There are many variations passage available the majority have suffered of alteration in some form by the injected humour or randomised words which look even slightly believable.
                      </p>
                    </div>
                  </div>
                  <div className="testimonial-item">
                    <div className="testimonial-content">
                      <div className="testimonial-author-img">
                        <img src="/assets/img/testimonial/NoPhofile.png" alt="" />
                      </div>
                      <div className="testimonial-author-info">
                        <h4>Loreta Jones</h4>
                        <p>Customer</p>
                        <div className="testimonial-rate">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                      </div>
                    </div>
                    <div className="testimonial-quote">
                      <div className="testimonial-quote-icon">
                        <img src="/assets/img/icon/quote.svg" alt="" />
                      </div>
                      <p>
                        There are many variations passage available the majority have suffered of alteration in some form by the injected humour or randomised words which look even slightly believable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Choose Area */}
        <div className="choose-area bg">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="site-heading text-center">
                  <h2 className="site-title mt-5">
                    Why <span className="text-orange">Choose</span> <span className="text-orange">247Cutbend</span>?
                  </h2>
                  <p>
                    <span className="text-orange">1200+</span> Ton per Month of Laser cutting capacity
                  </p>
                </div>
              </div>
            </div>
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="choose-content wow fadeInUp" data-wow-delay=".25s">
                  <div className="choose-content-wrap">
                    <div className="choose-item">
                      <div className="choose-item-icon">
                        <img src="/assets/img/icon/money.svg" alt="Save Time" />
                      </div>
                      <div className="choose-item-info">
                        <h4>Save Time, Get Instant Estimates</h4>
                        <p>No more waiting for quotes—get your estimates in minutes, not days.</p>
                      </div>
                    </div>

                    <div className="choose-item">
                      <div className="choose-item-icon">
                        <img src="/assets/img/icon/team.svg" alt="Material Management" />
                      </div>
                      <div className="choose-item-info">
                        <h4>Skip the Hassle of Material Management</h4>
                        <p>Forget sourcing, loading, unloading, and outsourcing. We handle it all for you.</p>
                      </div>
                    </div>

                    <div className="choose-item">
                      <div className="choose-item-icon">
                        <img src="/assets/img/icon/certified.svg" alt="Consolidate Vendors" />
                      </div>
                      <div className="choose-item-info">
                        <h4>Consolidate Your Vendors</h4>
                        <p>Why deal with multiple suppliers for your cutting and bending needs? With us, one partner does it all.</p>
                      </div>
                    </div>

                    <div className="choose-item">
                      <div className="choose-item-icon">
                        <img src="/assets/img/icon/certified.svg" alt="Capacity and Precision" />
                      </div>
                      <div className="choose-item-info">
                        <h4>Unmatched Capacity and Precision</h4>
                        <p>With 15 state-of-the-art laser cutting machines and 9 advanced press brakes, paired with a large selection of tools, we ensure your projects are completed with speed, precision, and quality.</p>
                      </div>
                    </div>

                    <div className="choose-item">
                      <div className="choose-item-icon">
                        <img src="/assets/img/icon/certified.svg" alt="247Cutbend" />
                      </div>
                      <div className="choose-item-info">
                        <h4>247Cutbend</h4>
                        <p>Your trusted, one-stop solution for all laser cutting and bending needs. Let's simplify your workflow!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="choose-img">
                  <img src="/assets/img/steel-laser-cutting-service-1000x1000.webp" alt="Laser Cutting Machine" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Area */}
        <div className="quote-area" id="quote-area">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-6">
                <div className="quote-text-content" style={{
                  paddingRight: '40px',
                  color: '#ffffff'
                }}>
                  <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '20px',
                    lineHeight: '1.3'
                  }}>
                    Fast, Affordable Laser Cutting & CNC Bending Services.
                  </h2>
                  <p style={{
                    fontSize: '1.15rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.8',
                    margin: 0
                  }}>
                    Get reliable Metal Fabrication at highly competitive pricing delivered faster to meet your production timelines.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="quote-content">
                  <div className="quote-head">
                    <h3>
                      Request A <span className="text-orange">Quote</span>
                    </h3>
                    <p>
                      Get an instant quote for your fabrication needs. Fill out the form below and our team will get back to you within 2 hours.
                    </p>
                  </div>
                  <div className="quote-form">
                    <form action="#">
                      <div className="row" style={{ marginLeft: '-8px', marginRight: '-8px' }}>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <div className="form-icon">
                              <i className="far fa-user-tie"></i>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Your Name"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <div className="form-icon">
                              <i className="far fa-envelope"></i>
                              <input
                                type="email"
                                className="form-control"
                                placeholder="Your Email"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <div className="form-icon">
                              <i className="far fa-phone"></i>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Your Phone"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <div className="checkbox-group">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  value=""
                                  id="flexCheckDefaultCutting"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="flexCheckDefaultCutting"
                                >
                                  Cutting
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  value=""
                                  id="flexCheckDefaultCutting&Bending"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="flexCheckDefaultCutting&Bending"
                                >
                                  Cutting & Bending
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="form-group">
                            <div className="form-icon">
                              <i className="far fa-comment-lines"></i>
                              <textarea
                                className="form-control"
                                cols="30"
                                rows="4"
                                placeholder="Your Message"
                              ></textarea>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <button
                            type="submit"
                            className="theme-btn"
                          >
                            Register Now
                            <i className="fas fa-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Area - Commented out for now */}
        {false && <div className="faq-area py-100" style={{ background: '#ffffff' }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="faq-content wow fadeInUp" data-wow-delay=".25s">
                  <div className="site-heading mb-4">
                    <h2 className="site-title" style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: '#2d3992',
                      marginBottom: '20px',
                      lineHeight: '1.2'
                    }}>
                      General <span style={{ color: '#f15925' }}>Frequently</span> Asked Questions
                    </h2>
                  </div>
                  <p style={{
                    fontSize: '1.05rem',
                    color: '#666',
                    lineHeight: '1.8',
                    marginBottom: '20px'
                  }}>
                    Find answers to common questions about our services, processes, and policies. If you have any additional questions, feel free to reach out to our support team.
                  </p>
                  <p style={{
                    fontSize: '1.05rem',
                    color: '#666',
                    lineHeight: '1.8',
                    marginBottom: '30px'
                  }}>
                    We're here to help you understand how we can assist with your laser cutting and bending needs, from initial quote to final delivery.
                  </p>
                  <a href="/" onClick={scrollToQuoteArea} className="theme-btn" style={{
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                    color: '#000',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.3)';
                    }}>
                    Have Any Question?
                    <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
                  </a>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="accordion wow fadeInRight" data-wow-delay=".25s" id="accordionExample" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <div className="accordion-item" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                    }}>
                    <h2 className="accordion-header" id="headingOne">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '15px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2d3992',
                          boxShadow: 'none'
                        }}>
                        <span style={{
                          width: '50px',
                          height: '50px',
                          minWidth: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
                        }}>
                          <i className="far fa-question" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                        </span>
                        <span style={{ flex: 1 }}>How Long Does A Service Take?</span>
                        <i className="fas fa-chevron-up" style={{ color: '#f15925', fontSize: '14px' }}></i>
                      </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse show"
                      aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                      <div className="accordion-body" style={{
                        padding: '0 25px 25px 85px',
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.7'
                      }}>
                        Our standard service timeline varies based on the complexity and volume of your order. Typically, we provide quotes within 2 hours of receiving your files, and standard orders are dispatched within 48 hours. For larger or more complex projects, we'll provide a detailed timeline during the quoting process.
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                    }}>
                    <h2 className="accordion-header" id="headingTwo">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '15px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2d3992',
                          boxShadow: 'none'
                        }}>
                        <span style={{
                          width: '50px',
                          height: '50px',
                          minWidth: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
                        }}>
                          <i className="far fa-question" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                        </span>
                        <span style={{ flex: 1 }}>How Can I Become A Member?</span>
                        <i className="fas fa-chevron-down" style={{ color: '#f15925', fontSize: '14px' }}></i>
                      </button>
                    </h2>
                    <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo"
                      data-bs-parent="#accordionExample">
                      <div className="accordion-body" style={{
                        padding: '0 25px 25px 85px',
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.7'
                      }}>
                        Becoming a member is easy! Simply register on our platform by clicking the "Login" button in the header. Once registered, you'll have access to instant quotes, order tracking, order history, and exclusive member benefits. Registration is free and takes just a few minutes.
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                    }}>
                    <h2 className="accordion-header" id="headingThree">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseThree" aria-expanded="false"
                        aria-controls="collapseThree"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '15px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2d3992',
                          boxShadow: 'none'
                        }}>
                        <span style={{
                          width: '50px',
                          height: '50px',
                          minWidth: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
                        }}>
                          <i className="far fa-question" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                        </span>
                        <span style={{ flex: 1 }}>What Payment Gateway You Support?</span>
                        <i className="fas fa-chevron-down" style={{ color: '#f15925', fontSize: '14px' }}></i>
                      </button>
                    </h2>
                    <div id="collapseThree" className="accordion-collapse collapse"
                      aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                      <div className="accordion-body" style={{
                        padding: '0 25px 25px 85px',
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.7'
                      }}>
                        We support multiple secure payment gateways including credit cards, debit cards, net banking, UPI, and other popular payment methods. All transactions are processed through secure, encrypted channels to ensure your financial information is protected.
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                    }}>
                    <h2 className="accordion-header" id="headingFour">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseFour" aria-expanded="false"
                        aria-controls="collapseFour"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '15px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2d3992',
                          boxShadow: 'none'
                        }}>
                        <span style={{
                          width: '50px',
                          height: '50px',
                          minWidth: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f15925 0%, #f15925 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
                        }}>
                          <i className="far fa-question" style={{ color: '#ffffff', fontSize: '20px' }}></i>
                        </span>
                        <span style={{ flex: 1 }}>How Can I Cancel My Request?</span>
                        <i className="fas fa-chevron-down" style={{ color: '#f15925', fontSize: '14px' }}></i>
                      </button>
                    </h2>
                    <div id="collapseFour" className="accordion-collapse collapse"
                      aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                      <div className="accordion-body" style={{
                        padding: '0 25px 25px 85px',
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.7'
                      }}>
                        You can cancel your request at any time before production begins. Simply log into your account, navigate to your orders, and click the cancel button. For orders that have already entered production, please contact our support team immediately. Refunds will be processed according to our cancellation policy.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* Blog Area - Commented out for now */}
        {/* <div className="blog-area py-100 bg">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 mx-auto">
                <div className="site-heading text-center wow fadeInDown" data-wow-delay=".25s">
                  <h2 className="site-title">Our Latest News & <span>Blog</span></h2>
                  <div className="heading-divider"></div>
                </div>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="blog-item wow fadeInUp" data-wow-delay=".25s">
                  <div className="blog-item-img">
                    <img src="/assets/img/cnc-cut.jpg" alt="Thumb" />
                    <div className="blog-date">
                      <strong>20</strong>
                      <span>Nov</span>
                    </div>
                  </div>
                  <div className="blog-item-info">
                    <div className="blog-item-meta">
                      <ul>
                        <li><a href="#"><i className="far fa-user-circle"></i> By Alicia Davis</a></li>
                        <li><a href="#"><i className="far fa-comments"></i> 2.5k Comments</a></li>
                      </ul>
                    </div>
                    <h4 className="blog-title">
                      <a href="#">There are many variations of passages orem available.</a>
                    </h4>
                    <p>
                      It is a long established fact that a reader will majority have suffered distracted readable.
                    </p>
                    <a className="theme-btn" href="#">Read More<i className="fas fa-arrow-right"></i></a>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="blog-item wow fadeInDown" data-wow-delay=".25s">
                  <div className="blog-item-img">
                    <img src="/assets/img/cutting.jpg" alt="Thumb" />
                    <div className="blog-date">
                      <strong>25</strong>
                      <span>Nov</span>
                    </div>
                  </div>
                  <div className="blog-item-info">
                    <div className="blog-item-meta">
                      <ul>
                        <li><a href="#"><i className="far fa-user-circle"></i> By Alicia Davis</a></li>
                        <li><a href="#"><i className="far fa-comments"></i> 1.2k Comments</a></li>
                      </ul>
                    </div>
                    <h4 className="blog-title">
                      <a href="#">Generator internet repeat tend word chunk  necessary.</a>
                    </h4>
                    <p>
                      It is a long established fact that a reader will majority have suffered distracted readable.
                    </p>
                    <a className="theme-btn" href="#">Read More<i className="fas fa-arrow-right"></i></a>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="blog-item wow fadeInUp" data-wow-delay=".25s">
                  <div className="blog-item-img">
                    <img src="/assets/img/cnc-cut.jpg" alt="Thumb" />
                    <div className="blog-date">
                      <strong>28</strong>
                      <span>Nov</span>
                    </div>
                  </div>
                  <div className="blog-item-info">
                    <div className="blog-item-meta">
                      <ul>
                        <li><a href="#"><i className="far fa-user-circle"></i> By Alicia Davis</a></li>
                        <li><a href="#"><i className="far fa-comments"></i> 2.8k Comments</a></li>
                      </ul>
                    </div>
                    <h4 className="blog-title">
                      <a href="#">Survived only five centuries but also the leap into.</a>
                    </h4>
                    <p>
                      It is a long established fact that a reader will majority have suffered distracted readable.
                    </p>
                    <a className="theme-btn" href="#">Read More<i className="fas fa-arrow-right"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </main>

      {/* Quote Banner */}
      <div className="quote-banner">
        {/* Light Orange SVG Decorative Element */}
        <div className="quote-banner-svg-decoration">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="150" cy="150" r="120" fill="rgba(255, 193, 7, 0.2)" opacity="0.6" />
            <circle cx="150" cy="150" r="80" fill="rgba(255, 193, 7, 0.15)" opacity="0.5" />
            <circle cx="150" cy="150" r="40" fill="rgba(255, 193, 7, 0.1)" opacity="0.4" />
            <path d="M150 30 L170 90 L230 90 L180 130 L200 190 L150 150 L100 190 L120 130 L70 90 L130 90 Z" fill="rgba(255, 193, 7, 0.25)" opacity="0.5" />
          </svg>
        </div>
        <div className="container quote-banner-container">
          <div className="quote-banner-content">
            <div className="quote-banner-icon">
              <div className="loader">
                <div className="truckWrapper">
                  <div className="truckBody">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 198 93"
                      className="trucksvg"
                    >
                      <path
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#F83D3D"
                        d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
                      />
                      <path
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#7D7C7C"
                        d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
                      />
                      <path
                        strokeWidth="2"
                        stroke="#282828"
                        fill="#282828"
                        d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
                      />
                      <rect
                        strokeWidth="2"
                        stroke="#282828"
                        fill="#FFFCAB"
                        rx="1"
                        height="7"
                        width="5"
                        y="63"
                        x="187"
                      />
                      <rect
                        strokeWidth="2"
                        stroke="#282828"
                        fill="#282828"
                        rx="1"
                        height="11"
                        width="4"
                        y="81"
                        x="193"
                      />
                      <rect
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#DFDFDF"
                        rx="2.5"
                        height="90"
                        width="121"
                        y="1.5"
                        x="6.5"
                      />
                      <rect
                        strokeWidth="2"
                        stroke="#282828"
                        fill="#DFDFDF"
                        rx="2"
                        height="4"
                        width="6"
                        y="84"
                        x="1"
                      />
                    </svg>
                  </div>
                  <div className="truckTires">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 30 30"
                      className="tiresvg"
                    >
                      <circle
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#282828"
                        r="13.5"
                        cy="15"
                        cx="15"
                      />
                      <circle fill="#DFDFDF" r="7" cy="15" cx="15" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 30 30"
                      className="tiresvg"
                    >
                      <circle
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#282828"
                        r="13.5"
                        cy="15"
                        cx="15"
                      />
                      <circle fill="#DFDFDF" r="7" cy="15" cx="15" />
                    </svg>
                  </div>
                  <div className="road"></div>
                  <svg
                    viewBox="0 0 453.459 453.459"
                    xmlns="http://www.w3.org/2000/svg"
                    className="lampPost"
                  >
                    <path
                      d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
                        c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
                        c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
                        c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
                        h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
                        v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
                        V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
                        M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
                        h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="quote-banner-text">
              <p>
                "Just upload your design and confirm your material. We deliver accurate, machine-calibrated, quality-inspected parts within 24-36 hours".
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <footer className="footer-area" style={{
        background: '#2d3992',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Blueprint Pattern Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          zIndex: 0
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="blueprint" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blueprint)" />
          </svg>
        </div>

        <div className="footer-widget" style={{ position: 'relative', zIndex: 1 }}>
          <div className="container">
            <div className="footer-widget-wrap" style={{ padding: '40px 0 20px' }}>
              <div className="row g-4">
                <div className="col-lg-5">
                  <div className="footer-widget-box about-us">
                    <div className="footer-logo" style={{ display: 'inline-block', marginBottom: '20px' }}>
                      <img src="/Whitelogo.png" alt="247CutBend Logo" style={{ height: '35px', width: 'auto' }} />
                    </div>
                    <p style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.95rem',
                      lineHeight: '1.7',
                      marginBottom: '25px'
                    }}>
                      247CutBend, your trusted partner for precision cutting, bending, and metal fabrication services. With advanced technology and a commitment to quality.
                    </p>
                    <div className="footer-social-media">
                      <h6 style={{
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        marginBottom: '15px'
                      }}>Follow Us</h6>
                      <div className="social-links" style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        <a href="https://www.facebook.com/247cutbend/" target="_blank" rel="noopener noreferrer" style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          fontSize: '16px'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f15925';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}>
                          <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          fontSize: '16px'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f15925';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}>
                          <i className="fab fa-x-twitter"></i>
                        </a>
                        <a href="https://www.instagram.com/247cutbend/" target="_blank" rel="noopener noreferrer" style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          fontSize: '16px'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f15925';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}>
                          <i className="fab fa-instagram"></i>
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          fontSize: '16px'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f15925';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}>
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="footer-widget-box list">
                    <h4 className="footer-widget-title" style={{
                      color: '#ffffff',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      marginBottom: '20px',
                      position: 'relative',
                      paddingBottom: '10px'
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
                    <ul className="footer-list" style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <li><a href="#" style={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f15925';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <i className="far fa-angle-double-right" style={{ fontSize: '12px' }}></i>
                        About Us
                      </a></li>
                      <li><a href="#" style={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f15925';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <i className="far fa-angle-double-right" style={{ fontSize: '12px' }}></i>
                        Blogs
                      </a></li>
                      <li><a href="#" style={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f15925';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <i className="far fa-angle-double-right" style={{ fontSize: '12px' }}></i>
                        Faqs
                      </a></li>
                      <li><a href="#" style={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f15925';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <i className="far fa-angle-double-right" style={{ fontSize: '12px' }}></i>
                        Terms & Conditions
                      </a></li>
                      <li><a href="#" style={{
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f15925';
                          e.currentTarget.style.transform = 'translateX(5px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <i className="far fa-angle-double-right" style={{ fontSize: '12px' }}></i>
                        Privacy Policy
                      </a></li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="footer-widget-box">
                    <h4 className="footer-widget-title" style={{
                      color: '#ffffff',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      marginBottom: '20px',
                      position: 'relative',
                      paddingBottom: '10px'
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
                    <ul className="footer-contact" style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px'
                    }}>
                      <li style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        <div className="icon" style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '50%',
                          background: '#f15925',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className="far fa-location-dot" style={{ color: '#000', fontSize: '18px' }}></i>
                        </div>
                        <div className="content">
                          <h6 style={{
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            marginBottom: '5px',
                            margin: 0
                          }}>Our Address</h6>
                          <p style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            margin: 0
                          }}>578-587 Savli GIDC Rd, Vadodara, Manjusar, Gujarat 391770, India</p>
                        </div>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="icon" style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '50%',
                          background: '#f15925',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className="far fa-phone" style={{ color: '#000', fontSize: '18px' }}></i>
                        </div>
                        <div className="content">
                          <h6 style={{
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            marginBottom: '5px',
                            margin: 0
                          }}>Call Us</h6>
                          <a href="tel:+919512041116" style={{
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            transition: 'color 0.3s ease'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#f15925'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
                            +91 9004073379
                          </a>
                        </div>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="icon" style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '50%',
                          background: '#f15925',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className="far fa-envelope" style={{ color: '#000', fontSize: '18px' }}></i>
                        </div>
                        <div className="content">
                          <h6 style={{
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            marginBottom: '5px',
                            margin: 0
                          }}>Mail Us</h6>
                          <a href="mailto:sales@247cutbend.in" style={{
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            transition: 'color 0.3s ease'
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#f15925'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
                            sales@247cutbend.in
                          </a>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="copyright" style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '20px 0'
          }}>
            <div className="row align-items-center">
              <div className="col-md-6">
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  &copy; Copyright <span id="date"></span> <a href="#" style={{
                    color: '#f15925',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}>Cutbend</a> All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <a href="https://api.whatsapp.com/send?phone=919512041116" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
        <span><i className="fab fa-whatsapp" aria-hidden="true"></i></span>
      </a>

      {/* Scroll Top */}
      <a href="#top" id="scroll-top"><i className="far fa-arrow-up"></i></a>
    </div>
  );
}

export default Home;

