import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

// Navigation links with "Sandbox" right next to "Home"
const NAV_LINKS = [
  { label: 'Home', href: '#hero', id: 'hero' },
  { label: 'Sandbox', href: '#sandbox', id: 'sandbox' },
  { label: 'Expertise', href: '#services', id: 'services' },
  { label: 'Manifesto', href: '#about', id: 'about' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Sticky navbar shadow and background styling on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section on home page scroll
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const elements = NAV_LINKS.map((link) =>
      document.getElementById(link.id)
    ).filter(Boolean);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll or navigate to target section
  const scrollToTarget = (targetId) => {
    if (targetId === 'hero') {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      if (window.__lenis) {
        window.__lenis.scrollTo(targetEl, { offset: -70, duration: 1.2 });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Click handler for desktop and mobile navigation links
  const handleNavClick = (e, link) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      // Small timeout ensures mobile drawer unmounts and Lenis resumes before scroll
      setTimeout(() => {
        scrollToTarget(link.id);
      }, 150);
    } else {
      navigate(`/${link.href}`);
    }
  };

  return (
    <>
      {/* Sticky Fixed Navbar Header */}
      <header
        className={`waply-navbar-wrapper ${scrolled ? 'is-scrolled' : ''} ${
          mobileMenuOpen ? 'is-menu-open' : ''
        }`}
      >
        <motion.div
          className="waply-navbar"
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 1. BRAND LOGO WITH ANIMATION */}
          <Link
            to="/"
            className="waply-brand"
            onClick={(e) => handleNavClick(e, { id: 'hero', href: '#hero' })}
          >
            <motion.div
              className="waply-brand-icon"
              whileHover={{ rotate: 90, scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className="waply-logo-text">WP</span>
              <span className="waply-logo-glow" />
            </motion.div>

            <div className="waply-brand-meta">
              <span className="waply-brand-name">
                Waply
                <span className="waply-brand-dot" />
              </span>
              <span className="waply-brand-sub">Autonomous AI</span>
            </div>
          </Link>

          {/* 2. CORE NAVIGATION LINKS (Home, Sandbox next, Expertise, Manifesto, Contact) */}
          <nav className="waply-nav-links" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === '/' && activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`waply-nav-link ${isActive ? 'is-active' : ''}`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="waply-active-indicator"
                      className="waply-nav-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* 3. RIGHT ACTIONS: LOGIN & SIGN UP OR DASHBOARD */}
          <div className="waply-nav-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="waply-btn-login">
                  Login
                </Link>
                {/* Sign up is visible on desktop / tablet, hidden on mobile */}
                <Link to="/register" className="waply-btn-signup">
                  <span>Sign Up</span>
                  <ArrowUpRight className="waply-arrow-icon" />
                </Link>
              </>
            ) : (
              <div className="waply-user-pill">
                <span className="waply-user-role">
                  {isAdmin ? 'Admin' : 'User'}
                </span>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="waply-btn-dashboard"
                >
                  <LayoutDashboard size={14} />
                  <span className="waply-user-role-label">
                    {isAdmin ? 'Admin' : 'Dashboard'}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="waply-btn-logout"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut />
                </button>
              </div>
            )}

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              type="button"
              className="waply-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </motion.div>
      </header>

      {/* 4. FULL-SCREEN MOBILE & TABLET DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="waply-mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="waply-mobile-menu-inner">
              {/* Mobile Navigation Links */}
              <div className="waply-mobile-links">
                {NAV_LINKS.map((link, idx) => {
                  const isActive = location.pathname === '/' && activeSection === link.id;
                  return (
                    <motion.a
                      key={link.id}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link)}
                      className={`waply-mobile-link ${isActive ? 'is-active' : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * idx, duration: 0.22 }}
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight />
                    </motion.a>
                  );
                })}
              </div>

              {/* Bottom Actions inside Mobile Drawer */}
              <div className="waply-mobile-actions">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="waply-mobile-btn-outline"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="waply-mobile-btn-solid"
                    >
                      <span>Sign Up</span>
                      <ArrowUpRight size={16} />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="waply-mobile-btn-solid"
                    >
                      <LayoutDashboard size={16} />
                      <span>{isAdmin ? 'Admin Console' : 'Dashboard'}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="waply-mobile-btn-outline"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


// import React, { useEffect, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { AnimatePresence, motion } from "motion/react";
// import {
//   ArrowUpRight,
//   Menu,
//   X,
//   ChevronRight,
// } from "lucide-react";
// import { useAuth } from "../../../context/AuthContext";
// import "./Navbar.css";

// const links = [
//   { label: "Home", id: "hero" },
//   { label: "Sandbox", id: "sandbox" },
//   { label: "Expertise", id: "services" },
//   { label: "Manifesto", id: "about" },
//   { label: "Contact", id: "contact" },
// ];

// export default function Navbar() {
//   const { isAuthenticated, isAdmin, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [scrolled, setScrolled] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [activeSection, setActiveSection] = useState("hero");

//   useEffect(() => {
//     const onScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };

//     onScroll();
//     window.addEventListener("scroll", onScroll, { passive: true });

//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   useEffect(() => {
//     if (location.pathname !== "/") {
//       setActiveSection("");
//       return;
//     }

//     const sections = links
//       .map(({ id }) => document.getElementById(id))
//       .filter(Boolean);

//     if (!sections.length) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         const visible = entries
//           .filter((entry) => entry.isIntersecting)
//           .sort(
//             (a, b) =>
//               b.intersectionRatio - a.intersectionRatio
//           );

//         if (visible.length) {
//           setActiveSection(visible[0].target.id);
//         }
//       },
//       {
//         rootMargin: "-20% 0px -65% 0px",
//         threshold: [0, 0.1, 0.25, 0.5],
//       }
//     );

//     sections.forEach((section) => observer.observe(section));

//     return () => observer.disconnect();
//   }, [location.pathname]);

//   useEffect(() => {
//     if (!menuOpen) return;

//     const previousOverflow = document.body.style.overflow;
//     document.body.style.overflow = "hidden";

//     return () => {
//       document.body.style.overflow = previousOverflow;
//     };
//   }, [menuOpen]);

//   useEffect(() => {
//     const onKeyDown = (event) => {
//       if (event.key === "Escape") setMenuOpen(false);
//     };

//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, []);

//   const scrollToSection = (id) => {
//     const target = document.getElementById(id);

//     if (id === "hero" && !target) {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     if (!target) return;

//     if (window.__lenis) {
//       window.__lenis.scrollTo(target, {
//         offset: -105,
//         duration: 1,
//       });
//     } else {
//       target.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });
//     }
//   };

//   const handleNavClick = (event, id) => {
//     event.preventDefault();
//     setMenuOpen(false);

//     if (location.pathname === "/") {
//       scrollToSection(id);
//     } else {
//       navigate(`/#${id}`);
//     }
//   };

//   const dashboardPath = isAdmin ? "/admin" : "/dashboard";

//   return (
//     <>
//       <header
//         className={`wa-header ${
//           scrolled ? "wa-header--scrolled" : ""
//         }`}
//       >
//         <div className="wa-header-inner">
//           {/* BRAND */}

//           <Link
//             to="/"
//             className="wa-brand"
//             aria-label="Waply home"
//             onClick={(event) => handleNavClick(event, "hero")}
//           >
//             <motion.span
//               className="wa-brand-symbol"
//               whileHover={{ scale: 1.05, rotate: -4 }}
//               whileTap={{ scale: 0.96 }}
//             >
//               <span className="wa-symbol-letter">W</span>
//               <span className="wa-symbol-dot" />
//             </motion.span>

//             <span className="wa-brand-text">
//               <span className="wa-brand-name">
//                 WAPLY<span>.</span>
//               </span>
//               <span className="wa-brand-tagline">
//                 AUTONOMOUS AI
//               </span>
//             </span>
//           </Link>

//           {/* DESKTOP NAVIGATION */}

//           <nav className="wa-navigation" aria-label="Main navigation">
//             {links.map((link, index) => {
//               const active =
//                 location.pathname === "/" &&
//                 activeSection === link.id;

//               return (
//                 <a
//                   key={link.id}
//                   href={`/#${link.id}`}
//                   onClick={(event) =>
//                     handleNavClick(event, link.id)
//                   }
//                   className={`wa-nav-link ${
//                     active ? "is-active" : ""
//                   }`}
//                   aria-current={active ? "location" : undefined}
//                 >
//                   <span className="wa-nav-index">
//                     0{index + 1}
//                   </span>

//                   <span className="wa-nav-label">
//                     {link.label}
//                   </span>

//                   <span className="wa-nav-line" />
//                 </a>
//               );
//             })}
//           </nav>

//           {/* AUTH ACTIONS */}

//           <div className="wa-actions">
//             {!isAuthenticated ? (
//               <>
//                 <Link to="/login" className="wa-login">
//                   Log in
//                 </Link>

//                 <Link to="/register" className="wa-signup">
//                   <span>Sign up</span>
//                   <ArrowUpRight size={16} />
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <Link
//                   to={dashboardPath}
//                   className="wa-login wa-dashboard-link"
//                 >
//                   {isAdmin ? "Admin" : "Dashboard"}
//                 </Link>

//                 <button
//                   className="wa-signup wa-logout"
//                   onClick={logout}
//                   type="button"
//                 >
//                   <span>Log out</span>
//                   <ArrowUpRight size={16} />
//                 </button>
//               </>
//             )}

//             <button
//               type="button"
//               className="wa-menu-toggle"
//               aria-label={menuOpen ? "Close navigation" : "Open navigation"}
//               aria-expanded={menuOpen}
//               onClick={() => setMenuOpen((open) => !open)}
//             >
//               <AnimatePresence mode="wait" initial={false}>
//                 <motion.span
//                   key={menuOpen ? "close" : "open"}
//                   initial={{ opacity: 0, rotate: -45 }}
//                   animate={{ opacity: 1, rotate: 0 }}
//                   exit={{ opacity: 0, rotate: 45 }}
//                   transition={{ duration: 0.16 }}
//                 >
//                   {menuOpen ? <X size={21} /> : <Menu size={21} />}
//                 </motion.span>
//               </AnimatePresence>
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* MOBILE MENU */}

//       <AnimatePresence>
//         {menuOpen && (
//           <motion.div
//             className="wa-mobile-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setMenuOpen(false)}
//           >
//             <motion.nav
//               className="wa-mobile-menu"
//               aria-label="Mobile navigation"
//               initial={{ opacity: 0, y: -12 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.25 }}
//               onClick={(event) => event.stopPropagation()}
//             >
//               <div className="wa-mobile-heading">
//                 <span>EXPLORE WAPLY</span>
//                 <span>01 — 05</span>
//               </div>

//               {links.map((link, index) => (
//                 <motion.a
//                   key={link.id}
//                   href={`/#${link.id}`}
//                   className={`wa-mobile-link ${
//                     activeSection === link.id ? "is-active" : ""
//                   }`}
//                   onClick={(event) =>
//                     handleNavClick(event, link.id)
//                   }
//                   initial={{ opacity: 0, x: -8 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.045 }}
//                 >
//                   <span className="wa-mobile-index">
//                     0{index + 1}
//                   </span>

//                   <span>{link.label}</span>

//                   <ChevronRight size={18} />
//                 </motion.a>
//               ))}

//               <div className="wa-mobile-actions">
//                 {!isAuthenticated ? (
//                   <>
//                     <Link
//                       to="/login"
//                       onClick={() => setMenuOpen(false)}
//                       className="wa-mobile-login"
//                     >
//                       Log in
//                     </Link>

//                     <Link
//                       to="/register"
//                       onClick={() => setMenuOpen(false)}
//                       className="wa-mobile-signup"
//                     >
//                       <span>Get started</span>
//                       <ArrowUpRight size={17} />
//                     </Link>
//                   </>
//                 ) : (
//                   <>
//                     <Link
//                       to={dashboardPath}
//                       onClick={() => setMenuOpen(false)}
//                       className="wa-mobile-signup"
//                     >
//                       <span>
//                         {isAdmin ? "Admin console" : "Dashboard"}
//                       </span>
//                       <ArrowUpRight size={17} />
//                     </Link>

//                     <button
//                       type="button"
//                       className="wa-mobile-login"
//                       onClick={() => {
//                         setMenuOpen(false);
//                         logout();
//                       }}
//                     >
//                       Log out
//                     </button>
//                   </>
//                 )}
//               </div>

//               <div className="wa-mobile-footnote">
//                 WAPLY® — AUTONOMOUS AI SYSTEMS
//               </div>
//             </motion.nav>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
