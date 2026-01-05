import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
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
      $('.sidebar-btn').on('click', function() {
        $('.sidebar-popup').addClass('open');
        $('.sidebar-wrapper').addClass('open');
      });
      $('.close-sidebar-popup, .sidebar-popup').on('click', function() {
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
        onInitialized: function(event) {
          var $firstAnimatingElements = $('.owl-item').eq(event.item.index).find("[data-animation]");
          doAnimations($firstAnimatingElements);
        },
        onChanged: function(event){
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
        zIndex: 1001
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
        <div className="main-navigation" style={{padding: '0'}}>
          <nav className="navbar navbar-expand-lg" style={{
            padding: isScrolled ? '12px 0' : '16px 0',
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
                  height: isScrolled ? '55px' : '65px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  transition: 'all 0.3s ease'
                }} />

              </div>

              {/* Desktop Menu - Hidden on mobile */}
              <div className="d-none d-lg-flex align-items-center" style={{flex: 1, justifyContent: 'flex-end'}}>
                <ul className="navbar-nav justify-content-end flex-grow-1" style={{alignItems: 'center', flexDirection: 'row'}}>
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
                      e.currentTarget.style.color = '#FFC107';
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      Home
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#about-area" style={{
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
                      e.currentTarget.style.color = '#FFC107';
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      About Us
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#service-area" style={{
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
                      e.currentTarget.style.color = '#FFC107';
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      Capabilities
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#quote-area" style={{
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
                      e.currentTarget.style.color = '#FFC107';
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
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
                    <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }} className="theme-btn" style={{
                      padding: '10px 24px',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                      color: '#000',
                      borderRadius: '8px',
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
                      e.currentTarget.style.background = 'linear-gradient(135deg, #FFB300 0%, #FFA000 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.3)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)';
                    }}>
                      Login
                      <i className="fas fa-arrow-right" style={{fontSize: '12px', transition: 'transform 0.3s ease'}}></i>
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
            height: '50px',
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
        
        <div style={{padding: '20px 0'}}>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li style={{borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
              <a 
                href="/" 
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFC107';
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
            <li style={{borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
              <a 
                href="#about-area" 
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFC107';
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
            <li style={{borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
              <a 
                href="#service-area" 
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFC107';
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
            <li style={{borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
              <a 
                href="#quote-area" 
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFC107';
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
          
          <div style={{padding: '20px', display: 'flex', justifyContent: 'flex-start'}}>
            <a 
              href="/signup" 
              onClick={(e) => { 
                e.preventDefault(); 
                setIsMobileMenuOpen(false);
                navigate('/signup'); 
              }} 
              className="theme-btn" 
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
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
              <i className="fas fa-arrow-right" style={{fontSize: '11px'}}></i>
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
            <img src="/Logo.png" alt="" />
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
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-x-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
      </div>

      <main className="main">
        {/* Hero Area */}
        <div className="hero-section">
          <div className="hero-slider owl-carousel">
            <div className="hero-single">
              <video muted loop autoPlay>
                <source src="/assets/img/cns.mp4" type="video/mp4" />
              </video>
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-md-12 col-lg-8">
                    <div className="hero-content">
                      <h6 className="hero-sub-title" data-animation="fadeInUp" data-delay=".25s">
                        Laser cutting & Bending - 24x7 ONLINE
                      </h6>
                      <h1 className="hero-title" data-animation="fadeInRight" data-delay=".50s">
                        Instant quote <br/> Fastest delivery <br/> best price
                      </h1>
                      {/* <div className="hero-btn" data-animation="fadeInUp" data-delay="1s">
                        <a href="https://workdrive.zohopublic.in/collection/pgd574e5ce61888a2407c93078e287e399d18/external" target="_blank" rel="noopener noreferrer" className="theme-btn">Upload Files<i className="fas fa-arrow-right"></i></a>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Area */}
        <div className="partner-area pt-negative">
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
        </div>

        {/* Process Area */}
        <div className="process-area py-100" style={{background: '#f8f9fa'}}>
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <div className="site-heading text-center wow fadeInDown" data-wow-delay=".25s">
                  <h2 className="site-title mb-4" style={{fontSize: '2.5rem', fontWeight: '700', color: '#1a1a1a'}}>
                    How It <span style={{color: '#FFC107'}}>Works</span>
                  </h2>
                  <p style={{fontSize: '1.1rem', color: '#666', marginBottom: '3rem'}}>
                    Simple steps to get your fabrication done quickly and efficiently
                  </p>
                </div>
              </div>
            </div>
            <div className="process-wrap mt-3 wow fadeInUp" data-wow-delay=".25s">
              <div className="row g-4 justify-content-center" style={{position: 'relative'}}>
                {/* Connecting Line - Desktop Only */}
                <div className="d-none d-lg-block" style={{
                  position: 'absolute',
                  top: '80px',
                  left: '12%',
                  right: '12%',
                  height: '3px',
                  background: 'linear-gradient(90deg, #002C5B 0%, #FFC107 50%, #002C5B 100%)',
                  zIndex: 0,
                  borderRadius: '2px'
                }}></div>
                
                <div className="col-md-6 col-lg-3 col-xl-3">
                  <div className="process-item" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '35px 25px',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0,0,0,0.05)',
                    height: '100%',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 193, 7, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}>
                    <span className="count" style={{
                      position: 'absolute',
                      top: '15px',
                      right: '20px',
                      fontSize: '3rem',
                      fontWeight: '800',
                      color: 'transparent',
                      WebkitTextStroke: '2px #002C5B',
                      lineHeight: '1',
                      opacity: '0.15'
                    }}>01</span>
                    <div className="icon" style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 25px',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                    }}>
                      <img src="/assets/img/1.png" alt="Upload" style={{
                        width: '50px',
                        height: '50px',
                        filter: 'brightness(0) invert(1)'
                      }} />
                    </div>
                    <div className="content">
                      <h4 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#002C5B',
                        marginBottom: '12px',
                        lineHeight: '1.3'
                      }}>Upload Your Files</h4>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.6',
                        margin: 0
                      }}>We accept dwg, dxf, step, jpg, hand sketches etc.</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 col-lg-3 col-xl-3">
                  <div className="process-item" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '35px 25px',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0,0,0,0.05)',
                    height: '100%',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 193, 7, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}>
                    <span className="count" style={{
                      position: 'absolute',
                      top: '15px',
                      right: '20px',
                      fontSize: '3rem',
                      fontWeight: '800',
                      color: 'transparent',
                      WebkitTextStroke: '2px #002C5B',
                      lineHeight: '1',
                      opacity: '0.15'
                    }}>02</span>
                    <div className="icon" style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 25px',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                    }}>
                      <img src="/assets/img/2.png" alt="Quote" style={{
                        width: '50px',
                        height: '50px',
                        filter: 'brightness(0) invert(1)'
                      }} />
                    </div>
                    <div className="content">
                      <h4 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#002C5B',
                        marginBottom: '12px',
                        lineHeight: '1.3'
                      }}>Get a Quote in 2 Hours</h4>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.6',
                        margin: 0
                      }}>As low as RS. 65/Kg * We save OUR material for you.</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 col-lg-3 col-xl-3">
                  <div className="process-item" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '35px 25px',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0,0,0,0.05)',
                    height: '100%',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 193, 7, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}>
                    <span className="count" style={{
                      position: 'absolute',
                      top: '15px',
                      right: '20px',
                      fontSize: '3rem',
                      fontWeight: '800',
                      color: 'transparent',
                      WebkitTextStroke: '2px #002C5B',
                      lineHeight: '1',
                      opacity: '0.15'
                    }}>03</span>
                    <div className="icon" style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 25px',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                    }}>
                      <img src="/assets/img/3.png" alt="Confirm" style={{
                        width: '50px',
                        height: '50px',
                        filter: 'brightness(0) invert(1)'
                      }} />
                    </div>
                    <div className="content">
                      <h4 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#002C5B',
                        marginBottom: '12px',
                        lineHeight: '1.3'
                      }}>Confirm Your Order</h4>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.6',
                        margin: 0
                      }}>Your order history remains to your account</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 col-lg-3 col-xl-3">
                  <div className="process-item last-item" style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '35px 25px',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0,0,0,0.05)',
                    height: '100%',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 193, 7, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}>
                    <span className="count" style={{
                      position: 'absolute',
                      top: '15px',
                      right: '20px',
                      fontSize: '3rem',
                      fontWeight: '800',
                      color: 'transparent',
                      WebkitTextStroke: '2px #002C5B',
                      lineHeight: '1',
                      opacity: '0.15'
                    }}>04</span>
                    <div className="icon" style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 25px',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                    }}>
                      <img src="/assets/img/5.png" alt="Dispatch" style={{
                        width: '50px',
                        height: '50px',
                        filter: 'brightness(0) invert(1)'
                      }} />
                    </div>
                    <div className="content">
                      <h4 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#002C5B',
                        marginBottom: '12px',
                        lineHeight: '1.3'
                      }}>Dispatched in 48 Hours</h4>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#666',
                        lineHeight: '1.6',
                        margin: 0
                      }}>Guaranteed delivery at your door step</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Counter Area */}
        <div className="counter-area pt-40 pb-40">
          <div className="container">
            <div className="row g-4 justify-content-center">
              <div className="col-md-6 col-lg-4 col-xl-3">
                <div className="counter-item wow fadeInUp" data-wow-delay=".25s">
                  <div className="icon">
                    <img src="/assets/img/icon/construction.svg" alt="" />
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
                  <div className="icon">
                    <img src="/assets/img/icon/happy.svg" alt="" />
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
                  <div className="icon">
                    <img src="/assets/img/icon/team-2.svg" alt="" />
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
                  <div className="icon">
                    <img src="/assets/img/icon/award.svg" alt="" />
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
        <div className="about-area py-120" id="about-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="about-left wow fadeInLeft" data-wow-delay=".25s">
                  <div className="about-img">
                    <img className="img-1" src="/assets/img/cutting-tool.jpg" alt="" />
                    <img className="img-2" src="/assets/img/laserrr.jpg" alt="" />
                  </div>
                  <div className="about-experience">
                    <h5>30<span>+</span></h5>
                    <p>Years Of Experience</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="about-right wow fadeInUp" data-wow-delay=".25s">
                  <div className="site-heading mb-3">
                    <h2 className="site-title">We Are The <span>Best and Expert</span> For 247CutBend</h2>
                  </div>
                  <p className="about-text">247CutBend, your trusted partner for precision cutting, bending, and metal fabrication services. With advanced technology and a commitment to quality, we provide a comprehensive range of services, including laser cutting, bending, welding, punching, and design & development, tailored to meet each client's unique requirements. Operating in major cities across India—Bangalore, Delhi NCR, Chennai, and more—we bring top-tier fabrication solutions closer to you.</p>
                  <div className="about-content">
                    <div className="row g-3">
                      <div className="col-md-12">
                        <div className="about-item border-bottom pe-2">
                          <div className="icon">
                            <img src="/assets/img/icon/team-2.svg" alt="" />
                          </div>
                          <div className="content">
                            <h6>Cutting</h6>
                            <p>We provide precise laser cutting services for intricate designs and large-scale projects, ensuring clean, accurate results every time.</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="about-item">
                          <div className="icon">
                            <img src="/assets/img/icon/material.svg" alt="" />
                          </div>
                          <div className="content">
                            <h6>Bending</h6>
                            <p>Our advanced bending services deliver exact angles and curves, shaping materials to meet complex design specifications with precision.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Area */}
        <div className="service-area bg py-100" id="service-area" style={{background: '#ffffff'}}>
          <div className="container">
            <div className="row g-4 align-items-center mb-5">
              <div className="col-lg-6">
                <div className="site-heading mb-0">
                  <h2 className="site-title" style={{
                    fontSize: '2.8rem',
                    fontWeight: '700',
                    color: '#002C5B',
                    marginBottom: '20px',
                    lineHeight: '1.2'
                  }}>
                    Our <span style={{color: '#FFC107'}}>Capabilities</span>
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
                    padding: '25px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h4 className="service-title" style={{
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: '#002C5B',
                      marginBottom: '15px',
                      lineHeight: '1.3'
                    }}>
                      <a href="#" style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#002C5B'}>
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
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
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
                      <i className="fas fa-arrow-right" style={{fontSize: '12px'}}></i>
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
                    padding: '25px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h4 className="service-title" style={{
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: '#002C5B',
                      marginBottom: '15px',
                      lineHeight: '1.3'
                    }}>
                      <a href="#" style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#002C5B'}>
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
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
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
                      <i className="fas fa-arrow-right" style={{fontSize: '12px'}}></i>
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
                    padding: '25px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h4 className="service-title" style={{
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: '#002C5B',
                      marginBottom: '15px',
                      lineHeight: '1.3'
                    }}>
                      <a href="#" style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#002C5B'}>
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
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
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
                      <i className="fas fa-arrow-right" style={{fontSize: '12px'}}></i>
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
                    padding: '25px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h4 className="service-title" style={{
                      fontSize: '1.35rem',
                      fontWeight: '700',
                      color: '#002C5B',
                      marginBottom: '15px',
                      lineHeight: '1.3'
                    }}>
                      <a href="#" style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#002C5B'}>
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
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
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
                      <i className="fas fa-arrow-right" style={{fontSize: '12px'}}></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Area */}
        <div className="testimonial-area ts-bg pt-90 pb-40">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                <div className="site-heading wow fadeInDown" data-wow-delay=".25s">
                  <h2 className="site-title text-white">What Our Client <span>Say's</span> about us</h2>
                  <p className="text-white">
                    It is a long established fact that a reader will be distracted by the readable content
                    of a page when Internet tend to repeat predefined chunks.
                  </p>
                  <a href="#" className="theme-btn mt-30">Know More <i className="fas fa-arrow-right"></i></a>
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
        <div className="choose-area bg py-100" style={{background: '#ffffff'}}>
          <div className="container">
            <div className="row mb-5">
              <div className="col-lg-12">
                <div className="site-heading text-center mb-4">
                  <h2 className="site-title" style={{
                    fontSize: '2.8rem',
                    fontWeight: '700',
                    color: '#002C5B',
                    marginBottom: '15px',
                    lineHeight: '1.2'
                  }}>
                    Why <span style={{color: '#FFC107'}}>Choose</span> <span style={{color: '#FFC107'}}>247Cutbend</span>?
                  </h2>
                  <p style={{
                    fontSize: '1.15rem',
                    color: '#666',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    <span style={{color: '#FFC107', fontWeight: '700', fontSize: '1.3rem'}}>1200+</span> Ton per Month of Laser cutting capacity
                  </p>
                </div>
              </div>
            </div>
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="choose-content wow fadeInUp" data-wow-delay=".25s">
                  <div className="choose-content-wrap" style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
                    <div className="choose-item" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '20px',
                      padding: '20px',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.05)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <div className="choose-item-icon" style={{
                        width: '70px',
                        height: '70px',
                        minWidth: '70px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '3px dashed #FFC107',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                        e.currentTarget.style.borderColor = '#FFB300';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        e.currentTarget.style.borderColor = '#FFC107';
                      }}>
                        <img src="/assets/img/icon/money.svg" alt="Save Time" style={{
                          width: '35px',
                          height: '35px',
                          filter: 'brightness(0) saturate(100%) invert(77%) sepia(99%) saturate(1352%) hue-rotate(358deg) brightness(102%) contrast(101%)'
                        }} />
                      </div>
                      <div className="choose-item-info" style={{flex: 1}}>
                        <h4 style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#002C5B',
                          marginBottom: '10px',
                          lineHeight: '1.3'
                        }}>Save Time, Get Instant Estimates</h4>
                        <p style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          lineHeight: '1.7',
                          margin: 0
                        }}>No more waiting for quotes—get your estimates in minutes, not days.</p>
                      </div>
                    </div>

                    <div className="choose-item" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '20px',
                      padding: '20px',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.05)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <div className="choose-item-icon" style={{
                        width: '70px',
                        height: '70px',
                        minWidth: '70px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '3px dashed #FFC107',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                        e.currentTarget.style.borderColor = '#FFB300';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        e.currentTarget.style.borderColor = '#FFC107';
                      }}>
                        <img src="/assets/img/icon/team.svg" alt="Material Management" style={{
                          width: '35px',
                          height: '35px',
                          filter: 'brightness(0) saturate(100%) invert(77%) sepia(99%) saturate(1352%) hue-rotate(358deg) brightness(102%) contrast(101%)'
                        }} />
                      </div>
                      <div className="choose-item-info" style={{flex: 1}}>
                        <h4 style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#002C5B',
                          marginBottom: '10px',
                          lineHeight: '1.3'
                        }}>Skip the Hassle of Material Management</h4>
                        <p style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          lineHeight: '1.7',
                          margin: 0
                        }}>Forget sourcing, loading, unloading, and outsourcing. We handle it all for you.</p>
                      </div>
                    </div>

                    <div className="choose-item" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '20px',
                      padding: '20px',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.05)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <div className="choose-item-icon" style={{
                        width: '70px',
                        height: '70px',
                        minWidth: '70px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '3px dashed #FFC107',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                        e.currentTarget.style.borderColor = '#FFB300';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        e.currentTarget.style.borderColor = '#FFC107';
                      }}>
                        <img src="/assets/img/icon/certified.svg" alt="Consolidate Vendors" style={{
                          width: '35px',
                          height: '35px',
                          filter: 'brightness(0) saturate(100%) invert(77%) sepia(99%) saturate(1352%) hue-rotate(358deg) brightness(102%) contrast(101%)'
                        }} />
                      </div>
                      <div className="choose-item-info" style={{flex: 1}}>
                        <h4 style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#002C5B',
                          marginBottom: '10px',
                          lineHeight: '1.3'
                        }}>Consolidate Your Vendors</h4>
                        <p style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          lineHeight: '1.7',
                          margin: 0
                        }}>Why deal with multiple suppliers for your cutting and bending needs? With us, one partner does it all.</p>
                      </div>
                    </div>

                    <div className="choose-item" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '20px',
                      padding: '20px',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.05)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <div className="choose-item-icon" style={{
                        width: '70px',
                        height: '70px',
                        minWidth: '70px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '3px dashed #FFC107',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                        e.currentTarget.style.borderColor = '#FFB300';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        e.currentTarget.style.borderColor = '#FFC107';
                      }}>
                        <img src="/assets/img/icon/certified.svg" alt="Capacity and Precision" style={{
                          width: '35px',
                          height: '35px',
                          filter: 'brightness(0) saturate(100%) invert(77%) sepia(99%) saturate(1352%) hue-rotate(358deg) brightness(102%) contrast(101%)'
                        }} />
                      </div>
                      <div className="choose-item-info" style={{flex: 1}}>
                        <h4 style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#002C5B',
                          marginBottom: '10px',
                          lineHeight: '1.3'
                        }}>Unmatched Capacity and Precision</h4>
                        <p style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          lineHeight: '1.7',
                          margin: 0
                        }}>With 15 state-of-the-art laser cutting machines and 9 advanced press brakes, paired with a large selection of tools, we ensure your projects are completed with speed, precision, and quality.</p>
                      </div>
                    </div>

                    <div className="choose-item" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '20px',
                      padding: '20px',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 193, 7, 0.05)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <div className="choose-item-icon" style={{
                        width: '70px',
                        height: '70px',
                        minWidth: '70px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '3px dashed #FFC107',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                        e.currentTarget.style.borderColor = '#FFB300';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        e.currentTarget.style.borderColor = '#FFC107';
                      }}>
                        <img src="/assets/img/icon/certified.svg" alt="247Cutbend" style={{
                          width: '35px',
                          height: '35px',
                          filter: 'brightness(0) saturate(100%) invert(77%) sepia(99%) saturate(1352%) hue-rotate(358deg) brightness(102%) contrast(101%)'
                        }} />
                      </div>
                      <div className="choose-item-info" style={{flex: 1}}>
                        <h4 style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#002C5B',
                          marginBottom: '10px',
                          lineHeight: '1.3'
                        }}>247Cutbend</h4>
                        <p style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          lineHeight: '1.7',
                          margin: 0
                        }}>Your trusted, one-stop solution for all laser cutting and bending needs. Let's simplify your workflow!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="choose-img" style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  transition: 'all 0.4s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                }}>
                  <img src="/assets/img/cutting-tool.jpg" alt="Laser Cutting Machine" style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }} />
                </div>
              </div>
            </div>
            <div className="row mt-5">
              <div className="col-lg-12">
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 179, 0, 0.1) 100%)',
                  borderRadius: '16px',
                  padding: '30px',
                  textAlign: 'center',
                  border: '2px dashed #FFC107'
                }}>
                  <p style={{
                    fontSize: '1.1rem',
                    color: '#002C5B',
                    marginBottom: '10px',
                    fontWeight: '600'
                  }}>
                    You have purchased <span style={{color: '#FFC107', fontWeight: '700'}}>@ Rs. 53/kg</span> material + Loading charges + Transport + You nest it + You added Transportation + Again loaded !!!!!
                  </p>
                  <p style={{
                    fontSize: '1.3rem',
                    color: '#002C5B',
                    margin: 0,
                    fontWeight: '700'
                  }}>
                    Turnout price - <span style={{color: '#FFC107', fontSize: '1.5rem'}}>Rs. 62 / Kg</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Area */}
        <div className="quote-area" style={{
          backgroundImage: 'url(/assets/img/1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          padding: '100px 0'
        }} id="quote-area">
          {/* Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 44, 91, 0.85) 0%, rgba(0, 44, 91, 0.75) 100%)',
            zIndex: 1
          }}></div>
          
          <div className="container" style={{position: 'relative', zIndex: 2}}>
            <div className="row">
              <div className="col-lg-7 ms-auto">
                <div className="quote-content" style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '45px 40px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="quote-head" style={{marginBottom: '30px'}}>
                    <h3 style={{
                      fontSize: '2.2rem',
                      fontWeight: '700',
                      color: '#002C5B',
                      marginBottom: '15px',
                      lineHeight: '1.2'
                    }}>
                      Request A <span style={{color: '#FFC107'}}>Quote</span>
                    </h3>
                    <p style={{
                      fontSize: '1rem',
                      color: '#666',
                      lineHeight: '1.7',
                      margin: 0
                    }}>
                      Get an instant quote for your fabrication needs. Fill out the form below and our team will get back to you within 2 hours.
                    </p>
                  </div>
                  <div className="quote-form">
                    <form action="#">
                      <div className="row g-3">
                        <div className="col-lg-6">
                          <div className="form-group" style={{marginBottom: '20px'}}>
                            <div className="form-icon" style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <i className="far fa-user-tie" style={{
                                position: 'absolute',
                                left: '18px',
                                color: '#FFC107',
                                fontSize: '18px',
                                zIndex: 2
                              }}></i>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Your Name"
                                style={{
                                  padding: '14px 18px 14px 50px',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '12px',
                                  fontSize: '15px',
                                  transition: 'all 0.3s ease',
                                  width: '100%',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#FFC107';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group" style={{marginBottom: '20px'}}>
                            <div className="form-icon" style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <i className="far fa-envelope" style={{
                                position: 'absolute',
                                left: '18px',
                                color: '#FFC107',
                                fontSize: '18px',
                                zIndex: 2
                              }}></i>
                              <input 
                                type="email" 
                                className="form-control" 
                                placeholder="Your Email"
                                style={{
                                  padding: '14px 18px 14px 50px',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '12px',
                                  fontSize: '15px',
                                  transition: 'all 0.3s ease',
                                  width: '100%',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#FFC107';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group" style={{marginBottom: '20px'}}>
                            <div className="form-icon" style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <i className="far fa-phone" style={{
                                position: 'absolute',
                                left: '18px',
                                color: '#FFC107',
                                fontSize: '18px',
                                zIndex: 2
                              }}></i>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Your Phone"
                                style={{
                                  padding: '14px 18px 14px 50px',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '12px',
                                  fontSize: '15px',
                                  transition: 'all 0.3s ease',
                                  width: '100%',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#FFC107';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group" style={{marginBottom: '20px'}}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              paddingTop: '14px'
                            }}>
                              <div className="form-check" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  value="" 
                                  id="flexCheckDefaultCutting"
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: '#FFC107'
                                  }}
                                />
                                <label 
                                  className="form-check-label" 
                                  htmlFor="flexCheckDefaultCutting"
                                  style={{
                                    fontSize: '15px',
                                    color: '#002C5B',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    margin: 0
                                  }}>
                                  Cutting
                                </label>
                              </div>
                              <div className="form-check" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  value="" 
                                  id="flexCheckDefaultCutting&Bending"
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: '#FFC107'
                                  }}
                                />
                                <label 
                                  className="form-check-label" 
                                  htmlFor="flexCheckDefaultCutting&Bending"
                                  style={{
                                    fontSize: '15px',
                                    color: '#002C5B',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    margin: 0
                                  }}>
                                  Cutting & Bending
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="form-group" style={{marginBottom: '25px'}}>
                            <div className="form-icon" style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'flex-start'
                            }}>
                              <i className="far fa-comment-lines" style={{
                                position: 'absolute',
                                left: '18px',
                                top: '18px',
                                color: '#FFC107',
                                fontSize: '18px',
                                zIndex: 2
                              }}></i>
                              <textarea 
                                className="form-control" 
                                cols="30" 
                                rows="4" 
                                placeholder="Your Message"
                                style={{
                                  padding: '14px 18px 14px 50px',
                                  border: '2px solid #e0e0e0',
                                  borderRadius: '12px',
                                  fontSize: '15px',
                                  transition: 'all 0.3s ease',
                                  width: '100%',
                                  outline: 'none',
                                  resize: 'vertical',
                                  minHeight: '120px',
                                  fontFamily: 'inherit'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#FFC107';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <button 
                            type="submit" 
                            className="theme-btn"
                            style={{
                              padding: '16px 32px',
                              fontSize: '16px',
                              fontWeight: '600',
                              background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                              color: '#000',
                              borderRadius: '12px',
                              boxShadow: '0 6px 20px rgba(255, 193, 7, 0.4)',
                              transition: 'all 0.3s ease',
                              border: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              width: '100%',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.5)';
                              e.currentTarget.style.background = 'linear-gradient(135deg, #FFB300 0%, #FFA000 100%)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
                              e.currentTarget.style.background = 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)';
                            }}
                          >
                            Register Now
                            <i className="fas fa-arrow-right" style={{fontSize: '14px', transition: 'transform 0.3s ease'}}></i>
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

        {/* FAQ Area */}
        <div className="faq-area py-100" style={{background: '#ffffff'}}>
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="faq-content wow fadeInUp" data-wow-delay=".25s">
                  <div className="site-heading mb-4">
                    <h2 className="site-title" style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: '#002C5B',
                      marginBottom: '20px',
                      lineHeight: '1.2'
                    }}>
                      General <span style={{color: '#FFC107'}}>Frequently</span> Asked Questions
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
                  <a href="#quote-area" className="theme-btn" style={{
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
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
                    <i className="fas fa-arrow-right" style={{fontSize: '12px'}}></i>
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
                          padding: '20px 25px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#002C5B',
                          boxShadow: 'none'
                        }}>
                        <span style={{
                          width: '50px',
                          height: '50px',
                          minWidth: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
                        }}>
                          <i className="far fa-question" style={{color: '#ffffff', fontSize: '20px'}}></i>
                        </span>
                        <span style={{flex: 1}}>How Long Does A Service Take?</span>
                        <i className="fas fa-chevron-up" style={{color: '#FFC107', fontSize: '14px'}}></i>
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
                          padding: '20px 25px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#002C5B',
                          boxShadow: 'none'
                        }}>
                        <span style={{
                          width: '50px',
                          height: '50px',
                          minWidth: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
                        }}>
                          <i className="far fa-question" style={{color: '#ffffff', fontSize: '20px'}}></i>
                        </span>
                        <span style={{flex: 1}}>How Can I Become A Member?</span>
                        <i className="fas fa-chevron-down" style={{color: '#FFC107', fontSize: '14px'}}></i>
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
                          padding: '20px 25px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#002C5B',
                          boxShadow: 'none'
                        }}>
                        <span style={{
                          width: '50px',
                          height: '50px',
                          minWidth: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
                        }}>
                          <i className="far fa-question" style={{color: '#ffffff', fontSize: '20px'}}></i>
                        </span>
                        <span style={{flex: 1}}>What Payment Gateway You Support?</span>
                        <i className="fas fa-chevron-down" style={{color: '#FFC107', fontSize: '14px'}}></i>
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
                          padding: '20px 25px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#002C5B',
                          boxShadow: 'none'
                        }}>
                        <span style={{
                          width: '50px',
                          height: '50px',
                          minWidth: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
                        }}>
                          <i className="far fa-question" style={{color: '#ffffff', fontSize: '20px'}}></i>
                        </span>
                        <span style={{flex: 1}}>How Can I Cancel My Request?</span>
                        <i className="fas fa-chevron-down" style={{color: '#FFC107', fontSize: '14px'}}></i>
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
        </div>

        {/* Blog Area */}
        <div className="blog-area py-100 bg">
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
        </div>
      </main>

      {/* Footer Area */}
      <footer className="footer-area" style={{
        background: '#002C5B',
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

        <div className="footer-widget" style={{position: 'relative', zIndex: 1}}>
          <div className="container">
            <div className="footer-widget-wrap" style={{padding: '50px 0 30px'}}>
              <div className="row g-4">
                <div className="col-lg-5">
                  <div className="footer-widget-box about-us">
                    <div className="footer-logo" style={{display: 'inline-block', marginBottom: '20px'}}>
                      <img src="/Logo.png" alt="247CutBend Logo" style={{height: '50px', width: 'auto'}} />
                    </div>
                    <p style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.95rem',
                      lineHeight: '1.7',
                      marginBottom: '25px'
                    }}>
                      247CutBend, your trusted partner for precision cutting, bending, and metal fabrication services. With advanced technology and a commitment to quality.
                    </p>
                    <div className="footer-newsletter">
                      <h6 style={{
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        marginBottom: '10px'
                      }}>Subscribe Our Newsletter</h6>
                      <div className="newsletter-form">
                        <form action="#" onSubmit={(e) => { e.preventDefault(); }}>
                          <div className="form-group" style={{margin: 0}}>
                            <div className="form-icon" style={{
                              display: 'flex',
                              background: '#ffffff',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              boxShadow: '0 1px 5px rgba(0,0,0,0.1)'
                            }}>
                              {/* <i className="far fa-envelope" style={{
                                padding: '8px 10px',
                                color: '#FFC107',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center'
                              }}></i> */}
                              <input 
                                type="email" 
                                className="form-control" 
                                placeholder="Your Email"
                                required
                                style={{
                                  flex: 1,
                                  border: 'none',
                                  padding: '8px 8px',
                                  outline: 'none',
                                  fontSize: '13px',
                                  background: 'transparent'
                                }}
                              />
                              <button className="theme-btn" type="submit" style={{
                                background: '#FFC107',
                                color: '#000',
                                border: 'none',
                                // padding: '8px 16px',
                                fontWeight: '600',
                                fontSize: '13px',
                                marginBottom:"10px",
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#FFB300';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#FFC107';
                              }}>
                                Subscribe
                              </button>
                            </div>
                          </div>
                        </form>
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
                        background: '#FFC107',
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
                        e.currentTarget.style.color = '#FFC107';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}>
                        <i className="far fa-angle-double-right" style={{fontSize: '12px'}}></i>
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
                        e.currentTarget.style.color = '#FFC107';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}>
                        <i className="far fa-angle-double-right" style={{fontSize: '12px'}}></i>
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
                        e.currentTarget.style.color = '#FFC107';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}>
                        <i className="far fa-angle-double-right" style={{fontSize: '12px'}}></i>
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
                        e.currentTarget.style.color = '#FFC107';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}>
                        <i className="far fa-angle-double-right" style={{fontSize: '12px'}}></i>
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
                        e.currentTarget.style.color = '#FFC107';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}>
                        <i className="far fa-angle-double-right" style={{fontSize: '12px'}}></i>
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
                        background: '#FFC107',
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
                      <li style={{display: 'flex', alignItems: 'flex-start', gap: '15px'}}>
                        <div className="icon" style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '50%',
                          background: '#FFC107',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className="far fa-location-dot" style={{color: '#000', fontSize: '18px'}}></i>
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
                      <li style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <div className="icon" style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '50%',
                          background: '#FFC107',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className="far fa-phone" style={{color: '#000', fontSize: '18px'}}></i>
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
                          onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
                            +91 9004073379
                          </a>
                        </div>
                      </li>
                      <li style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <div className="icon" style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '50%',
                          background: '#FFC107',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i className="far fa-envelope" style={{color: '#000', fontSize: '18px'}}></i>
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
                          onMouseEnter={(e) => e.currentTarget.style.color = '#FFC107'}
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
        <div className="container" style={{position: 'relative', zIndex: 1}}>
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
                    color: '#FFC107',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}>Cutbend</a> All Rights Reserved.
                </p>
              </div>
              <div className="col-md-6">
                <ul className="footer-social" style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <li><a href="#" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFC107';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    f
                  </a></li>
                  <li><a href="#" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFC107';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <i className="fab fa-x-twitter" style={{fontSize: '14px'}}></i>
                  </a></li>
                  <li><a href="#" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFC107';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    in
                  </a></li>
                </ul>
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
 