import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import {
  ArrowUpRight, Menu, X, Terminal, Radio, ChevronDown, ArrowRight, Zap,
  Code2, ShieldCheck, Cpu, Layers, Sparkles, Globe2, Box, Compass, Workflow,
  Server, Cloud, Send, Copy, Check, Smartphone, Code, Key, RotateCcw,
  CheckCheck, Shield, Bot, Network, Database, MessageSquare, ExternalLink,
  Activity, CheckCircle2, BookOpen, Clock, Tag, Mail, ArrowUp, Globe,
} from 'lucide-react';

import './Home.css';
import Navbar from '../Navbar/Navbar'; 
function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="noise-bg pointer-events-none fixed inset-0 z-50 h-screen w-screen opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
};

function SmoothScroll({ children }) {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let animationFrameId;

    const raf = (time) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);

    // Make lenis globally accessible for anchor navigation
    window.__lenis = lenis;

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
};

// function Navbar({ onOpenContact, onOpenSandbox }) {
//   const [scrolled, setScrolled] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 50) {
//         setScrolled(true);
//       } else {
//         setScrolled(false);
//       }
//     };

//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const navLinks = [
//     { label: 'EXPERTISE', href: '#services' },
//     { label: 'SELECTED WORK', href: '#work' },
//     { label: 'API SANDBOX', href: '#sandbox', action: onOpenSandbox },
//     { label: 'MANIFESTO', href: '#about' },
//     { label: 'INSIGHTS', href: '#insights' },
//   ];

//   const handleNavClick = (href, action) => {
//     setMobileMenuOpen(false);
//     if (action) {
//       action();
//     }
//     const target = document.querySelector(href);
//     if (target) {
//       target.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <>
//       <header
//         id="main-navbar"
//         className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
//           scrolled
//             ? 'bg-[#F5F3EF]/85 backdrop-blur-md border-b border-[#0A0A0A15] py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
//             : 'bg-transparent py-6'
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
//           {/* Brand Logo */}
//           <a
//             href="#"
//             className="group flex items-center gap-3 cursor-pointer"
//             id="brand-logo"
//           >
//             <div className="w-8 h-8 rounded-sm bg-[#0A0A0A] flex items-center justify-center text-[#F5F3EF] font-bold text-sm tracking-tighter transition-transform group-hover:scale-95 duration-300">
//               PZ
//             </div>
//             <div className="flex flex-col">
//               <span className="text-xl sm:text-2xl font-black text-[#0A0A0A] tracking-[0.2em] uppercase leading-none font-sans">
//                 Waply
//               </span>
//               <span className="text-[9px] text-[#8E8E8E] tracking-[0.25em] uppercase font-mono mt-0.5 hidden sm:inline">
//                 AUTONOMOUS AI ENGINE
//               </span>
//             </div>
//           </a>

//           {/* Desktop Navigation Links with scale-x underline */}
//           <nav className="hidden md:flex items-center gap-8 lg:gap-10">
//             {navLinks.map((link) => (
//               <a
//                 key={link.label}
//                 href={link.href}
//                 onClick={(e) => {
//                   if (link.action) {
//                     e.preventDefault();
//                     link.action();
//                   }
//                 }}
//                 className="relative py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#0A0A0A]/80 hover:text-[#0A0A0A] transition-colors group cursor-pointer"
//               >
//                 {link.label}
//                 <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#0A0A0A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
//               </a>
//             ))}
//           </nav>

//           {/* Right Action: Status & "LET'S TALK" Pill */}
//           <div className="flex items-center gap-4">
//             {/* Live API badge */}
//             <button
//               onClick={onOpenSandbox}
//               className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0A0A0A15] bg-[#EAE7E1]/60 text-[11px] font-mono text-[#0A0A0A] hover:bg-[#EAE7E1] transition-all cursor-pointer"
//               title="Open WhatsApp API Live Tester"
//             >
//               <Radio className="w-3 h-3 text-[#10B981] animate-pulse" />
//               <span className="font-medium">API v2.4</span>
//               <span className="text-[#8E8E8E]">|</span>
//               <span className="text-[#8E8E8E]">99.99%</span>
//             </button>

//             {/* Let's Talk Pill Button */}
//             <button
//               onClick={onOpenContact}
//               id="navbar-cta-button"
//               className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A0A0A] text-[#F5F3EF] text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#202020] hover:shadow-lg hover:shadow-black/10 active:scale-95 cursor-pointer"
//             >
//               <span>LET'S TALK</span>
//               <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
//             </button>

//             {/* Mobile Hamburger Toggle */}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="md:hidden p-2 rounded-lg border border-[#0A0A0A15] text-[#0A0A0A] hover:bg-[#EAE7E1] transition-colors cursor-pointer"
//               aria-label="Toggle menu"
//             >
//               {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Full-screen Mobile Overlay Menu */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
//             className="fixed inset-0 z-30 bg-[#F5F3EF]/98 backdrop-blur-2xl flex flex-col justify-between p-8 pt-28 md:hidden"
//           >
//             <div className="flex flex-col space-y-6">
//               <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.25em]">
//                 DIRECTORY // NAVIGATION
//               </div>
//               {navLinks.map((link, idx) => (
//                 <motion.a
//                   key={link.label}
//                   href={link.href}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.05 * idx, duration: 0.3 }}
//                   onClick={() => handleNavClick(link.href, link.action)}
//                   className="text-3xl font-black text-[#0A0A0A] tracking-tight uppercase hover:text-[#8E8E8E] transition-colors flex items-center justify-between border-b border-[#0A0A0A15] pb-4"
//                 >
//                   <span>{link.label}</span>
//                   <ArrowUpRight className="w-6 h-6 text-[#8E8E8E]" />
//                 </motion.a>
//               ))}
//             </div>

//             <div className="space-y-4 pt-6">
//               <button
//                 onClick={() => {
//                   setMobileMenuOpen(false);
//                   onOpenSandbox();
//                 }}
//                 className="w-full py-4 rounded-full border border-[#0A0A0A] flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0A0A0A] hover:bg-[#EAE7E1] transition-colors"
//               >
//                 <Terminal className="w-4 h-4" />
//                 <span>LAUNCH API SANDBOX</span>
//               </button>

//               <button
//                 onClick={() => {
//                   setMobileMenuOpen(false);
//                   onOpenContact();
//                 }}
//                 className="w-full py-4 rounded-full bg-[#0A0A0A] flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F5F3EF]"
//               >
//                 <span>INITIATE PROJECT / TALK</span>
//                 <ArrowUpRight className="w-4 h-4" />
//               </button>

//               <div className="flex items-center justify-between text-xs text-[#8E8E8E] pt-4 font-mono">
//                 <span>Waply © 2026</span>
//                 <span>STATUS: OPERATIONAL</span>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };



function Hero({ onOpenSandbox, onOpenContact }) {
  const phrases = [
    'Building Tomorrow',
    'Shaping Futures',
    'Driving Growth',
    'Autonomous AI Messaging',
    'Ultra-Low Latency WhatsApp API',
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(90);

  const canvasRef = useRef(null);

  // Dynamic typing loop
  useEffect(() => {
    const targetPhrase = phrases[currentPhraseIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        setDisplayText(targetPhrase.substring(0, displayText.length + 1));
        if (displayText.length + 1 === targetPhrase.length) {
          // Pause at complete phrase
          setTimeout(() => setIsDeleting(true), 1800);
          setTypingSpeed(120);
        } else {
          setTypingSpeed(60 + Math.random() * 40);
        }
      } else {
        setDisplayText(targetPhrase.substring(0, displayText.length - 1));
        if (displayText.length - 1 === 0) {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(100);
        } else {
          setTypingSpeed(35);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentPhraseIndex, typingSpeed, phrases]);

  // Generative fluid Halftone / Monochrome Particle Canvas for cinematic texture
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Nodes for dynamic kinetic mesh
    const nodes = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1,
    }));

    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle organic geometric contours (representing neural messaging graphs)
      ctx.strokeStyle = 'rgba(10, 10, 10, 0.035)';
      ctx.lineWidth = 1;

      // Update and connect nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 180) {
            ctx.strokeStyle = `rgba(10, 10, 10, ${0.08 * (1 - dist / 180)})`;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 sm:px-8 pt-32 pb-12 overflow-hidden select-none"
    >
      {/* Background Generative Texture & Video Canvas */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Generative Interactive Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-[0.85] mix-blend-luminosity"
        />

        {/* Halftone Dot Pattern Overlay (printed ink aesthetic) */}
        <div className="absolute inset-0 halftone-overlay opacity-80 pointer-events-none" />

        {/* Subtle vignette radial mask */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#F5F3EF_90%)] pointer-events-none" />
      </div>

      {/* Top Editorial Index Tag */}
      {/* <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#0A0A0A15] bg-[#EAE7E1]/70 backdrop-blur-sm text-xs font-mono tracking-[0.2em] text-[#0A0A0A]"
      >
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        <span className="font-semibold uppercase">PIXZEN ENGINE v2.4</span>
        <span className="text-[#8E8E8E]">|</span>
        <span className="text-[#8E8E8E] hidden sm:inline">HIGH-THROUGHPUT WHATSAPP INFRASTRUCTURE</span>
        <span className="text-[#8E8E8E] sm:hidden">WHATSAPP API</span>
      </motion.div> */}

      {/* Main Center Typography Stage */}
      <div className="z-10 max-w-6xl mx-auto text-center flex flex-col items-center justify-center my-auto py-8">
        {/* Sub-label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#8E8E8E] mb-4"
        >
          AUTONOMOUS INTELLIGENCE & ENTERPRISE DISPATCH
        </motion.p>

        {/* Massive Headline h1 (90px+ on desktop) */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-8xl lg:text-[105px] font-black tracking-[-0.04em] leading-[0.92] text-[#0A0A0A] uppercase max-w-5xl"
        >
          Waply<span className="text-[#8E8E8E] font-light">/</span> STUDIO
        </motion.h1>

        {/* Dynamic Typing Subtitle with Blinking Cursor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-6 sm:mt-8 min-h-[50px] sm:min-h-[64px] flex items-center justify-center"
        >
          <div className="inline-flex items-center text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0A0A0A]">
            <span className="mr-1 sm:mr-2">We are</span>
            <span className="underline decoration-[#0A0A0A30] underline-offset-8">
              {displayText}
            </span>
            <span className="inline-block w-[3px] sm:w-[4px] h-[1.1em] bg-[#0A0A0A] ml-1.5 animate-blink" />
          </div>
        </motion.div>

        {/* Editorial description statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-6 max-w-2xl text-base sm:text-lg text-[#0A0A0A]/70 leading-relaxed font-normal"
        >
          The next-generation autonomous AI agency and enterprise WhatsApp Cloud messaging infrastructure.
          Deploy intelligent agent workflows, automate billion-scale conversational funnels, and trigger sub-millisecond WhatsApp API dispatches.
        </motion.p>

        {/* Action Buttons & Quick Interactive CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={onOpenSandbox}
            id="hero-try-api-btn"
            className="group w-full sm:w-auto px-8 py-4 rounded-full bg-[#0A0A0A] text-[#F5F3EF] text-xs sm:text-sm font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#202020] hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-[#10B981]" />
            <span>Make Your Whatsapp Business</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onOpenContact}
            id="hero-agency-contact-btn"
            className="group w-full sm:w-auto px-8 py-4 rounded-full border border-[#0A0A0A] bg-transparent text-[#0A0A0A] text-xs sm:text-sm font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#EAE7E1] active:scale-95 cursor-pointer"
          >
            <span>CONTACT US</span>
            <Zap className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Quick Micro-Specs Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 pt-6 border-t border-[#0A0A0A10] flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-[#8E8E8E]"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0A0A0A]" />
            <span className="text-[#0A0A0A] font-semibold">Meta Verified</span> Tier-4 Partner
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>&lt;18ms API Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
            <span>10,000+ Msgs / Sec</span>
          </div>
        </motion.div>
      </div>

      {/* Bouncing Scroll Down Chevron */}
      <motion.a
        href="#brands"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.9,
          ease: 'easeOut',
        }}
        className="z-10 flex flex-col items-center gap-2 cursor-pointer group mt-4"
        aria-label="Scroll to content"
      >
        <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#8E8E8E] group-hover:text-[#0A0A0A] transition-colors">
          SCROLL DOWN
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-8 h-8 rounded-full border border-[#0A0A0A18] flex items-center justify-center group-hover:border-[#0A0A0A] transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-[#0A0A0A]" />
        </motion.div>
      </motion.a>
    </section>
  );
};

function TrustedBrands() {
  const brands = [
    { name: 'OPENAI ECOSYSTEM', icon: Sparkles, tag: 'MODEL SYNC' },
    { name: 'META CLOUD API', icon: Globe2, tag: 'TIER-4 ROUTING' },
    { name: 'ANTHROPIC CLAUDE', icon: Cpu, tag: 'REASONING CORE' },
    { name: 'STRIPE PAYMENTS', icon: Zap, tag: 'WHATSAPP CHECKOUT' },
    { name: 'SUPABASE VECTOR', icon: Layers, tag: 'EMBEDDINGS' },
    { name: 'VERCEL EDGE', icon: Cloud, tag: 'SUB-10MS DISPATCH' },
    { name: 'LINEAR WORKSPACES', icon: Workflow, tag: 'AGENT PIPELINES' },
    { name: 'SHOPIFY ENTERPRISE', icon: Box, tag: 'CART ABANDONMENT' },
    { name: 'TWILIO ENTERPRISE', icon: Radio, tag: 'TELEMETRY' },
    { name: 'KAFKA STREAMING', icon: Server, tag: 'EVENT BROKER' },
  ];

  return (
    <section
      id="brands"
      className="relative w-full py-16 border-t border-[#0A0A0A15] bg-[#F5F3EF] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#8E8E8E]">
            01 // POWERING GLOBAL SCALE
          </span>
          <span className="h-[1px] w-12 bg-[#0A0A0A15]" />
        </div>
        <p className="text-xs font-mono text-[#0A0A0A]/60">
          INTEGRATED ACROSS 500M+ MONTHLY CONVERSATIONAL EVENTS
        </p>
      </div>

      {/* Infinite Scrolling Marquee Container with Gradient Edge Fades */}
      <div className="relative w-full overflow-hidden">
        {/* Left Gradient Mask */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-44 z-10 pointer-events-none bg-gradient-to-r from-[#F5F3EF] to-transparent" />
        
        {/* Right Gradient Mask */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-44 z-10 pointer-events-none bg-gradient-to-l from-[#F5F3EF] to-transparent" />

        {/* Marquee Track */}
        <div className="animate-marquee flex items-center gap-12 sm:gap-16 py-4">
          {/* First set */}
          {brands.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={`brand-1-${idx}`}
                className="flex items-center gap-3.5 px-6 py-3 rounded-full border border-[#0A0A0A10] bg-[#EAE7E1]/40 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:border-[#0A0A0A] hover:bg-[#EAE7E1] transition-all duration-300 cursor-pointer shrink-0 group"
              >
                <Icon className="w-4 h-4 text-[#0A0A0A] group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase text-[#0A0A0A]">
                  {b.name}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0A0A0A]/10 text-[#0A0A0A]/70 group-hover:bg-[#0A0A0A] group-hover:text-[#F5F3EF] transition-colors">
                  {b.tag}
                </span>
              </div>
            );
          })}

          {/* Duplicate set for seamless infinite loop */}
          {brands.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={`brand-2-${idx}`}
                className="flex items-center gap-3.5 px-6 py-3 rounded-full border border-[#0A0A0A10] bg-[#EAE7E1]/40 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:border-[#0A0A0A] hover:bg-[#EAE7E1] transition-all duration-300 cursor-pointer shrink-0 group"
              >
                <Icon className="w-4 h-4 text-[#0A0A0A] group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase text-[#0A0A0A]">
                  {b.name}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0A0A0A]/10 text-[#0A0A0A]/70 group-hover:bg-[#0A0A0A] group-hover:text-[#F5F3EF] transition-colors">
                  {b.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

function LiveApiSandbox({ onOpenContact }) {
  const [recipientPhone, setRecipientPhone] = useState('+1 (555) 019-2834');
  const [selectedTemplate, setSelectedTemplate] = useState('ai_agent');
  const [customMessage, setCustomMessage] = useState(
    'Hi Alex, your Pixzen autonomous WhatsApp instance is active. How may we assist your workflow today?'
  );
  const [activeTab, setActiveTab] = useState('curl');
  const [isDispatching, setIsDispatching] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState('idle');
  const [lastLatency, setLastLatency] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'system',
      text: 'WAPLY Cloud Gateway Connected via Meta Graph API v20.0',
      time: '12:00 PM',
    },
  ]);

  const [apiKey, setApiKey] = useState('pxz_live_89f3a9e72bc1947e09d');

  const templates = [
    {
      id: 'ai_agent',
      name: 'Autonomous AI Concierge',
      desc: 'Contextual LLM reasoning with tool calling',
      defaultMsg: 'Hi Alex, your Pixzen autonomous WhatsApp instance is active. How may we assist your workflow today?',
      category: 'COGNITIVE',
    },
    {
      id: 'otp',
      name: 'Ultra-Fast Auth OTP',
      desc: 'Tier-4 high priority bypass (<15ms)',
      defaultMsg: 'Your PIXZEN single-use verification code is 849-204. Valid for 5 minutes. Do not share.',
      category: 'SECURITY',
    },
    {
      id: 'order',
      name: 'Live Order / Logistics',
      desc: 'Rich media tracking and live map update',
      defaultMsg: '📦 Your shipment #PX-9824 is out for delivery with courier Marcus. Tap to track live.',
      category: 'TRANSACTION',
    },
    {
      id: 'interactive',
      name: 'Interactive CTA Buttons',
      desc: 'Quick reply cards with zero friction',
      defaultMsg: 'Would you like to confirm the VIP reservation for Friday 8:00 PM?',
      category: 'ENGAGEMENT',
    },
  ];

  const handleTemplateChange = (id) => {
    setSelectedTemplate(id);
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setCustomMessage(tmpl.defaultMsg);
    }
  };

  const handleExecuteDispatch = () => {
    setIsDispatching(true);
    setDispatchStatus('idle');

    // Simulate ultra-low latency dispatch
    const simulatedLatency = Math.floor(Math.random() * 12) + 14; // 14ms - 26ms

    setTimeout(() => {
      setIsDispatching(false);
      setDispatchStatus('dispatched');
      setLastLatency(simulatedLatency);

      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsgId = Date.now().toString();

      setChatMessages((prev) => [
        ...prev,
        {
          id: newMsgId,
          sender: 'bot',
          text: customMessage,
          time: currentTime,
          status: 'sent',
        },
      ]);

      // Stepwise tick to read & interactive trigger
      setTimeout(() => {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === newMsgId ? { ...m, status: 'delivered' } : m))
        );
      }, 300);

      setTimeout(() => {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === newMsgId ? { ...m, status: 'read' } : m))
        );
        try {
          confetti({
            particleCount: 25,
            spread: 40,
            origin: { y: 0.8 },
            colors: ['#0A0A0A', '#10B981', '#EAE7E1'],
          });
        } catch {
          // confetti fallback
        }
      }, 700);
    }, simulatedLatency + 200);
  };

  const getCodeSnippet = () => {
    if (activeTab === 'curl') {
      return `curl -X POST "https://api.pixzen.ai/v1/whatsapp/dispatch" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${recipientPhone.replace(/[^0-9+]/g, '')}",
    "type": "${selectedTemplate}",
    "message": "${customMessage.replace(/"/g, '\\"')}",
    "options": {
      "priority": "ultra_high",
      "enable_ai_agent": ${selectedTemplate === 'ai_agent'},
      "webhook_url": "https://your-app.com/api/webhooks/whatsapp"
    }
  }'`;
    }
    if (activeTab === 'node') {
      return `import { PixzenClient } from '@pixzen/sdk';

const pixzen = new PixzenClient({ apiKey: '${apiKey}' });

const response = await pixzen.whatsapp.send({
  to: '${recipientPhone.replace(/[^0-9+]/g, '')}',
  type: '${selectedTemplate}',
  message: '${customMessage.replace(/'/g, "\\'")}',
  options: {
    priority: 'ultra_high',
    enableAiAgent: ${selectedTemplate === 'ai_agent'},
  }
});

console.log('Dispatched message ID:', response.messageId);
console.log('Latency SLA:', response.latencyMs + 'ms');`;
    }
    if (activeTab === 'python') {
      return `from pixzen import PixzenClient

client = PixzenClient(api_key="${apiKey}")

response = client.whatsapp.dispatch(
    to="${recipientPhone.replace(/[^0-9+]/g, '')}",
    type="${selectedTemplate}",
    message="""${customMessage}""",
    priority="ultra_high",
    enable_ai_agent=${selectedTemplate === 'ai_agent' ? 'True' : 'False'}
)

print(f"Message Dispatched: {response.message_id} in {response.latency}ms")`;
    }
    return `package main

import (
  "context"
  "fmt"
  "github.com/pixzen/go-sdk/whatsapp"
)

func main() {
  client := whatsapp.NewClient("${apiKey}")
  res, _ := client.Dispatch(context.Background(), &whatsapp.Payload{
    To:      "${recipientPhone.replace(/[^0-9+]/g, '')}",
    Type:    "${selectedTemplate}",
    Message: "${customMessage}",
  })
  fmt.Println("Message ID:", res.ID)
}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const chars = '0123456789abcdef';
    let rand = '';
    for (let i = 0; i < 18; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    setApiKey(`pxz_live_${rand}`);
  };

  return (
    <section
      id="sandbox"
      className="relative w-full py-24 border-t border-[#0A0A0A15] bg-[#EAE7E1]/50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#8E8E8E]">
                02 // DEVELOPER LIVE SANDBOX
              </span>
              <span className="h-[1px] w-12 bg-[#0A0A0A15]" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0A0A0A] uppercase font-sans">
              TEST THE WHATSAPP API IN REAL TIME
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#0A0A0A]/70 leading-relaxed">
            Construct dynamic payloads, inspect cURL/SDK code snippets, and dispatch instant live messages to experience PIXZEN's ultra-low latency routing.
          </p>
        </div>

        {/* API Key Bar */}
        <div className="mb-8 p-4 rounded-xl border border-[#0A0A0A15] bg-[#F5F3EF] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0A0A0A] text-[#F5F3EF]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-[#8E8E8E] tracking-widest">
                YOUR INSTANT DEMO API KEY
              </div>
              <div className="text-sm font-mono font-bold text-[#0A0A0A]">{apiKey}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyKey}
              className="px-3 py-1.5 rounded-lg border border-[#0A0A0A15] bg-[#EAE7E1] hover:bg-[#0A0A0A] hover:text-[#F5F3EF] text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'COPIED' : 'COPY KEY'}</span>
            </button>
            <button
              onClick={handleRegenerateKey}
              className="p-2 rounded-lg border border-[#0A0A0A15] bg-[#EAE7E1] hover:bg-[#F5F3EF] text-[#0A0A0A] transition-colors cursor-pointer"
              title="Generate new token"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3-Column Studio Sandbox Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameter & Payload Builder (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#0A0A0A15] bg-[#F5F3EF] p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#0A0A0A10] pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0A0A0A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                  MESSAGE CONFIGURATION
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-bold">
                TIER-4 ACTIVE
              </span>
            </div>

            {/* Recipient Phone Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-[#8E8E8E] tracking-wider block">
                RECIPIENT WHATSAPP NUMBER
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 rounded-lg border border-[#0A0A0A15] bg-[#EAE7E1]/50 text-sm font-mono text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-[#8E8E8E] tracking-wider block">
                SELECT MESSAGE ARCHETYPE
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateChange(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTemplate === t.id
                        ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EF] shadow-md'
                        : 'border-[#0A0A0A10] bg-[#EAE7E1]/40 text-[#0A0A0A] hover:border-[#0A0A0A30] hover:bg-[#EAE7E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{t.name}</span>
                    </div>
                    <p
                      className={`text-[11px] leading-snug line-clamp-2 ${
                        selectedTemplate === t.id ? 'text-[#F5F3EF]/70' : 'text-[#8E8E8E]'
                      }`}
                    >
                      {t.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Customizer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-[#8E8E8E] tracking-wider block">
                  PAYLOAD MESSAGE CONTENT
                </label>
                <span className="text-[10px] font-mono text-[#8E8E8E]">
                  {customMessage.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#0A0A0A15] bg-[#EAE7E1]/50 text-sm font-sans text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors resize-none"
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteDispatch}
              disabled={isDispatching}
              className="w-full py-4 rounded-full bg-[#0A0A0A] hover:bg-[#202020] text-[#F5F3EF] text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-black/10"
            >
              {isDispatching ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-[#10B981]" />
                  <span>TRANSMITTING VIA META GRAPH API...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#10B981]" />
                  <span>EXECUTE DISPATCH (SEND MESSAGE)</span>
                </>
              )}
            </button>
          </div>

          {/* Center Column: SDK Code & Live JSON Response (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-[#0A0A0A15] bg-[#0A0A0A] text-[#F5F3EF] p-6 space-y-4 shadow-xl">
            {/* Code Tabs */}
            <div className="flex items-center justify-between border-b border-[#202020] pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#F5F3EF]">
                  API INTEGRATION
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded-lg">
                {(['curl', 'node', 'python', 'go']).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold transition-colors cursor-pointer ${
                      activeTab === tab
                        ? 'bg-[#F5F3EF] text-[#0A0A0A]'
                        : 'text-[#8E8E8E] hover:text-[#F5F3EF]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-[#141414] text-xs font-mono text-[#EAE7E1] overflow-x-auto leading-relaxed max-h-56">
                <code>{getCodeSnippet()}</code>
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[#252525] hover:bg-[#333] text-[#8E8E8E] hover:text-[#F5F3EF] transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Live Response Payload Inspector */}
            <div className="pt-2 border-t border-[#202020]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[11px] font-mono text-[#8E8E8E] uppercase tracking-wider">
                    GATEWAY TELEMETRY RESPONSE
                  </span>
                </div>
                {lastLatency && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold">
                    {lastLatency}ms LATENCY
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#202020] text-[11px] font-mono text-[#A0A0A0] space-y-1">
                <div className="text-[#10B981]">
                  HTTP/2 200 OK &bull; meta_id: wamid.HBgLMT...
                </div>
                <div>{`{`}</div>
                <div className="pl-4 text-[#F5F3EF]">{`"status": "${dispatchStatus === 'dispatched' ? 'dispatched' : 'ready'}",`}</div>
                <div className="pl-4">{`"recipient": "${recipientPhone.replace(/[^0-9+]/g, '')}",`}</div>
                <div className="pl-4">{`"throughput_tier": "meta_tier_4_unlimited",`}</div>
                <div className="pl-4 text-[#10B981]">{`"latency_ms": ${lastLatency || 18},`}</div>
                <div className="pl-4">{`"timestamp": "${new Date().toISOString()}"`}</div>
                <div>{`}`}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Live WhatsApp Phone Mockup (3 cols) */}
          <div className="lg:col-span-3 flex flex-col items-center">
            <div className="w-full max-w-[320px] rounded-[36px] border-[6px] border-[#0A0A0A] bg-[#0B141A] text-[#E9EDEF] shadow-2xl overflow-hidden relative">
              {/* Phone Speaker & Camera Notch */}
              <div className="pt-3 pb-2 flex justify-center items-center bg-[#0B141A]">
                <div className="w-16 h-3.5 bg-[#000] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1A1A1A] mr-2" />
                </div>
              </div>

              {/* WhatsApp App Header */}
              <div className="bg-[#202C33] px-3.5 py-3 flex items-center justify-between border-b border-[#2A3942]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center text-white font-bold text-xs">
                    PZ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Waply Engine</span>
                      <Shield className="w-3 h-3 text-[#00A884] fill-[#00A884]" />
                    </div>
                    <div className="text-[9px] text-[#8696A0]">Official Business Account</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#00A884] px-1.5 py-0.5 rounded bg-[#00A884]/15">
                  ONLINE
                </div>
              </div>

              {/* Chat Canvas Screen */}
              <div className="p-3 min-h-[320px] max-h-[340px] overflow-y-auto space-y-3 bg-[#0B141A] text-xs flex flex-col justify-end">
                {chatMessages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div
                        key={msg.id}
                        className="text-[9px] font-mono text-center text-[#8696A0] bg-[#182229] py-1 px-2 rounded-md mx-auto"
                      >
                        {msg.text}
                      </div>
                    );
                  }
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="self-start max-w-[90%] bg-[#202C33] text-[#E9EDEF] p-3 rounded-2xl rounded-tl-sm shadow-md space-y-1.5"
                    >
                      <div className="flex items-center gap-1 text-[9px] text-[#00A884] font-bold">
                        <Bot className="w-3 h-3" />
                        <span>WAPLY Autonomous Dispatch</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#D1D7DB]">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-[#8696A0]">
                        <span>{msg.time}</span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#8696A0]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-[#8696A0]" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Phone Bar */}
              <div className="bg-[#202C33] p-2.5 flex items-center gap-2 border-t border-[#2A3942]">
                <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5 text-[10px] text-[#8696A0]">
                  Type a reply...
                </div>
                <div className="w-7 h-7 rounded-full bg-[#00A884] flex items-center justify-center text-white">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <p className="text-[11px] font-mono text-[#8E8E8E] text-center mt-3">
              LIVE SIMULATION &bull; SUB-20MS DELIVERY
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

function Services() {
  const [activeIndex, setActiveIndex] = useState(0);

  const services = [
    {
      id: 's1',
      number: '01',
      title: 'AUTONOMOUS WHATSAPP AGENTS',
      subtitle: 'Cognitive Reasoning & Multi-Turn Sales Concierge',
      description:
        'Deploy production-grade LLM agents directly over WhatsApp Business Cloud. Waply agents ingest product catalogs, parse multi-modal images, manage cart state, and resolve complex enterprise customer inquiries autonomously.',
      tags: ['LLM Reasoning', 'Multi-Modal Vision', 'Zero-Hallucination Guardrails', 'Meta Cloud Tier-4'],
      metrics: [
        { label: 'Autonomous Resolution Rate', value: '88.4%' },
        { label: 'Conversion Lift', value: '+42%' },
        { label: 'Response Latency', value: '<450ms' },
      ],
      // Futuristic AI neural brain / intelligence node
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 's2',
      number: '02',
      title: 'HIGH-THROUGHPUT MESSAGING API',
      subtitle: 'Sub-Millisecond Multi-Region Event Dispatcher',
      description:
        'A battle-tested distributed gateway built for 100M+ daily events. Includes automatic phone number health warming, intelligent retry queues, rate-limit backoff, and end-to-end telemetry via webhooks.',
      tags: ['10k+ TPS', 'Automatic Warming', 'Global Edge Mesh', '99.999% SLA'],
      metrics: [
        { label: 'Global Edge Ingress', value: '<18ms' },
        { label: 'Message Delivery SLA', value: '99.999%' },
        { label: 'Concurrent Conns', value: '500,000+' },
      ],
      // High-speed server cluster / enterprise data center
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 's3',
      number: '03',
      title: 'ENTERPRISE CRM & WORKFLOW SYNC',
      subtitle: 'Bi-directional Realtime Data Pipelines',
      description:
        'Seamlessly bridge WhatsApp conversations with Salesforce, HubSpot, SAP, and custom PostgreSQL data layers. Every interaction is tokenized, vectorized, and synchronized into your central data warehouse in real time.',
      tags: ['Salesforce Native', 'HubSpot Webhooks', 'PostgreSQL Streaming', 'SOC2 Compliant'],
      metrics: [
        { label: 'Sync Propagation', value: '<80ms' },
        { label: 'Data Integrity', value: '100.0%' },
        { label: 'CRM Supported', value: '45+ platforms' },
      ],
      // Realtime analytics dashboard & data telemetry streams
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 's4',
      number: '04',
      title: 'DYNAMIC INTERACTIVE TEMPLATING',
      subtitle: 'Catalog Showcases, Instant Pay & OTP Security',
      description:
        'Construct personalized, dynamic WhatsApp message templates on the fly. Deliver rich product carousels, embedded Stripe checkout flows, multi-language localization, and cryptographically verified single-use authentication codes.',
      tags: ['WhatsApp Flows', 'Native In-Chat Pay', 'Auto-Localization', 'HSM Cryptography'],
      metrics: [
        { label: 'Payment Checkout Speed', value: '2.8 sec' },
        { label: 'Cart Recovery Rate', value: '38.2%' },
        { label: 'Template Approval', value: 'Instant' },
      ],
      // Digital security, encryption, and fintech transaction interface
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 's5',
      number: '05',
      title: 'CUSTOM AI VOICE & WHATSAPP AUDIO',
      subtitle: 'Ultra-Realistic Voice Synthesis & Voice-Note AI',
      description:
        'Accept voice messages from WhatsApp users and synthesize instant, human-grade voice replies in 35+ languages. Perfect for international markets and conversational commerce.',
      tags: ['Voice-to-Text', 'Neural Voice Clone', '35+ Dialects', 'Sub-second Audio Gen'],
      metrics: [
        { label: 'Transcription Accuracy', value: '99.1%' },
        { label: 'Speech Synthesis RTF', value: '0.12x' },
        { label: 'Supported Languages', value: '35+' },
      ],
      // Studio sound synthesis & acoustic waveform technology
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const currentService = services[activeIndex];

  return (
    <section
      id="services"
      className="relative w-full py-28 border-t border-[#0A0A0A15] bg-[#F5F3EF] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#8E8E8E]">
                03 // OUR EXPERTISE
              </span>
              <span className="h-[1px] w-12 bg-[#0A0A0A15]" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0A0A0A] uppercase font-sans">
              CORE INFRASTRUCTURE
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#0A0A0A]/70 leading-relaxed">
            We architect end-to-end conversational systems combining autonomous intelligence, raw network speed, and enterprise reliability.
          </p>
        </div>

        {/* 12-Column Grid (5 / 7 split for desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (5 Cols): Interactive List */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {services.map((service, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={service.id}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'border-[#0A0A0A] bg-[#EAE7E1] shadow-lg shadow-black/5'
                      : 'border-[#0A0A0A10] bg-transparent hover:border-[#0A0A0A30] hover:bg-[#EAE7E1]/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#8E8E8E] group-hover:text-[#0A0A0A]">
                          {service.number}
                        </span>
                        <span className="text-sm sm:text-base font-black tracking-tight uppercase text-[#0A0A0A]">
                          {service.title}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#8E8E8E] pl-7">
                        {service.subtitle}
                      </p>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        isActive
                          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F3EF]'
                          : 'border-[#0A0A0A15] text-[#8E8E8E] group-hover:text-[#0A0A0A] group-hover:border-[#0A0A0A]'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Active Indicator Bar on left */}
                  {isActive && (
                    <motion.div
                      layoutId="activeServiceBar"
                      className="absolute -left-[1px] top-4 bottom-4 w-1.5 bg-[#0A0A0A] rounded-r-full"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column (7 Cols): Sticky Media Reveal */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="relative rounded-3xl border border-[#0A0A0A15] bg-[#EAE7E1] overflow-hidden p-8 sm:p-10 shadow-xl">
              {/* Halftone texture overlay */}
              <div className="absolute inset-0 halftone-overlay opacity-30 pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentService.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 space-y-8"
                >
                  {/* Media Hero Banner */}
                  <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-[#0A0A0A15] bg-[#0A0A0A]">
                    <img
                      src={currentService.imageUrl}
                      alt={currentService.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale contrast-125 opacity-90 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[#F5F3EF]">
                      <div className="text-xs font-mono tracking-widest uppercase">
                        SPEC: {currentService.number} // ARCHITECTURE
                      </div>
                      <div className="text-xs font-mono px-2 py-1 rounded bg-[#10B981]/20 text-[#10B981] font-bold">
                        ACTIVE ENGINE
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tight">
                      {currentService.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#0A0A0A]/80 leading-relaxed font-normal">
                      {currentService.description}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {currentService.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full border border-[#0A0A0A15] bg-[#F5F3EF] text-[11px] font-mono font-medium text-[#0A0A0A] uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#0A0A0A15]">
                    {currentService.metrics.map((m, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="text-lg sm:text-2xl font-black text-[#0A0A0A] font-sans">
                          {m.value}
                        </div>
                        <div className="text-[10px] sm:text-xs font-mono text-[#8E8E8E] uppercase leading-tight">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// function FeaturedWork() {
//   const [selectedCase, setSelectedCase] = useState(null);

//   const projects = [
//     {
//       id: 'cs1',
//       number: '01',
//       title: 'AURA HEALTH // 2.4M AUTONOMOUS PATIENT TRIAGES',
//       client: 'Aura Telehealth Global',
//       category: 'HEALTHCARE AI & COMPLIANT ROUTING',
//       year: '2026',
//       summary:
//         'Architected a HIPAA-compliant WhatsApp conversational diagnostic triage engine that handles 2.4M monthly patients, scheduling appointments and delivering medication reminders with 99.8% precision.',
//       challenge:
//         'Patient drop-off on web portals was over 65%. High call center wait times led to delayed prescription renewals and missed oncology follow-ups.',
//       solution:
//         'Deployed PIXZEN autonomous reasoning agents on dedicated WhatsApp Tier-4 numbers with end-to-end encrypted medical record parsing, automated multilingual doctor matching, and sub-second OTP verification.',
//       results: [
//         { label: 'Patient Triage Speed', value: '<45 sec' },
//         { label: 'Drop-off Reduction', value: '-78%' },
//         { label: 'Monthly Active Users', value: '2.4M' },
//         { label: 'Doctor Hours Saved', value: '14,000 hrs/mo' },
//       ],
//       apiSnippet: `// Aura Health Triage Dispatch
// const triage = await pixzen.agents.dispatch({
//   phone: "+14155552671",
//   protocol: "hipaa_tier4",
//   context: { symptom_cluster: "respiratory_mild", urgency: 2 },
//   callbacks: { onDoctorMatched: "https://aura.care/api/telehealth-hook" }
// });`,
//       imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
//       badge: 'HEALTHCARE // AI DISPATCH',
//     },
//     {
//       id: 'cs2',
//       number: '02',
//       title: 'HYPERSCALE RETAIL // ZERO-FRICTION IN-CHAT COMMERCE',
//       client: 'HyperScale Commerce Group',
//       category: 'CONVERSATIONAL COMMERCE & STRIPE SYNC',
//       year: '2026',
//       summary:
//         'Created a native WhatsApp catalog checkout experience with dynamic cart recovery, automated size recommendations, and instant 1-tap WhatsApp Pay integration across 14 European markets.',
//       challenge:
//         'Cart abandonment on mobile web was 72%. Traditional email recovery generated less than 4% click-through rates.',
//       solution:
//         'Engineered an instant WhatsApp cart recovery trigger firing 12 minutes post-abandonment with high-res product video previews and a pre-filled native payment token, recovering $8.2M in annual revenue.',
//       results: [
//         { label: 'Cart Recovery Lift', value: '44.8%' },
//         { label: 'Revenue Recovered', value: '$8.2M/yr' },
//         { label: 'Checkout Time', value: '3.1 sec' },
//         { label: 'ROAS Multiplier', value: '8.4x' },
//       ],
//       apiSnippet: `// HyperScale Dynamic Checkout
// const checkout = await pixzen.templates.sendFlow({
//   recipient: "+447911123456",
//   flowId: "flow_cart_recovery_v3",
//   payload: {
//     cart_id: "crt_8920",
//     items: [{ sku: "OVR_HOODIE_BLK", qty: 1 }],
//     discount_code: "WHATSAPP15",
//   }
// });`,
//       imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
//       badge: 'ECOMMERCE // FLOWS & PAY',
//     },
//     {
//       id: 'cs3',
//       number: '03',
//       title: 'VERVE FINTECH // REAL-TIME TRANSACTION FRAUD RADAR',
//       client: 'Verve International Bank',
//       category: 'FINANCIAL SERVICES & CRYPTOGRAPHIC OTP',
//       year: '2025',
//       summary:
//         'Replaced costly legacy SMS verification with PIXZEN ultra-fast WhatsApp cryptographic authentication, slashing authentication latency to 18ms while eliminating SIM-swap fraud.',
//       challenge:
//         'Legacy SMS carrier routing incurred frequent 30-second delays, resulting in transaction timeouts and increasing telecom fraud expenses.',
//       solution:
//         'Integrated PIXZEN zero-latency WhatsApp authentication tunnels with automated biometric interactive buttons for rapid fraud dispute authorization.',
//       results: [
//         { label: 'Auth Latency', value: '18ms' },
//         { label: 'SMS Cost Savings', value: '$3.4M/yr' },
//         { label: 'Delivery Success', value: '99.998%' },
//         { label: 'Fraud Dispute Time', value: '-92%' },
//       ],
//       apiSnippet: `// Verve Fintech Security Tunnel
// const authChallenge = await pixzen.security.dispatchAuthChallenge({
//   to: "+12125550199",
//   challengeType: "biometric_or_otp",
//   transactionRef: "tx_9981a_sec",
//   amount: "$1,450.00 USD",
//   merchant: "Global Tech Inc"
// });`,
//       imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
//       badge: 'FINTECH // FRAUD SHIELD',
//     },
//     {
//       id: 'cs4',
//       number: '04',
//       title: 'NEXUS LOGISTICS // 100M+ EVENT TELEMETRY STREAM',
//       client: 'Nexus Global Freight',
//       category: 'SUPPLY CHAIN & REAL-TIME WEBHOOKS',
//       year: '2025',
//       summary:
//         'A high-throughput distributed WhatsApp dispatch infrastructure notifying 18,000 drivers and millions of consignees with live map locations, customs clearance docs, and automated gate pass barcodes.',
//       challenge:
//         'Supply chain bottlenecks at customs ports caused drivers to wait hours due to miscommunicated container release statuses.',
//       solution:
//         'Unified automated Kafka event stream into PIXZEN high-concurrency WhatsApp queue, transmitting dynamic digital PDF manifests and QR gate passes instantly upon container vessel docking.',
//       results: [
//         { label: 'Daily Event Throughput', value: '10M+ msgs' },
//         { label: 'Port Turnaround Time', value: '-35%' },
//         { label: 'Driver Adoption', value: '98.5%' },
//         { label: 'Peak Capacity', value: '18,500 TPS' },
//       ],
//       apiSnippet: `// Nexus Real-time Telemetry
// const dispatch = await pixzen.stream.publishToWhatsApp({
//   driverPhone: "+4915123456789",
//   containerId: "MSCU-892194-0",
//   qrPassUrl: "https://nexus.logistics/gate/qr/892194",
//   customsStatus: "CLEARED_GREEN_LANE"
// });`,
//       imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
//       badge: 'LOGISTICS // EVENT STREAM',
//     },
//   ];

//   return (
//     <section
//       id="work"
//       className="relative w-full py-28 border-t border-[#0A0A0A15] bg-[#EAE7E1]/60 overflow-hidden"
//     >
//       <div className="max-w-7xl mx-auto px-6 sm:px-8">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
//           <div>
//             <div className="flex items-center gap-3 mb-3">
//               <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#8E8E8E]">
//                 04 // SELECTED WORK & CASE STUDIES
//               </span>
//               <span className="h-[1px] w-12 bg-[#0A0A0A15]" />
//             </div>
//             <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0A0A0A] uppercase font-sans">
//               PROVEN DEPLOYMENTS
//             </h2>
//           </div>
//           <p className="max-w-md text-sm text-[#0A0A0A]/70 leading-relaxed">
//             Enterprise case studies showcasing massive scale, autonomous revenue generation, and mission-critical reliability.
//           </p>
//         </div>

//         {/* Sticky Stacking Cards Container */}
//         <div className="relative space-y-12 sm:space-y-16 pb-12">
//           {projects.map((project, idx) => {
//             return (
//               <div
//                 key={project.id}
//                 className="sticky top-28 sm:top-32 rounded-[28px] border border-[#0A0A0A15] bg-[#F5F3EF] overflow-hidden shadow-2xl transition-all duration-300"
//                 style={{
//                   zIndex: idx + 1,
//                 }}
//               >
//                 {/* Halftone texture */}
//                 <div className="absolute inset-0 halftone-overlay opacity-20 pointer-events-none" />

//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch p-8 sm:p-12">
//                   {/* Left Column (7 cols): Editorial info & specs */}
//                   <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
//                     <div className="space-y-4">
//                       {/* Category & Badge */}
//                       <div className="flex flex-wrap items-center gap-3">
//                         <span className="text-xs font-mono font-bold text-[#0A0A0A] px-3 py-1 rounded-full bg-[#EAE7E1] border border-[#0A0A0A10]">
//                           CASE // {project.number}
//                         </span>
//                         <span className="text-xs font-mono uppercase tracking-wider text-[#8E8E8E]">
//                           {project.category}
//                         </span>
//                       </div>

//                       {/* Main Title */}
//                       <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0A0A0A] uppercase font-sans">
//                         {project.title}
//                       </h3>

//                       {/* Summary */}
//                       <p className="text-sm sm:text-base text-[#0A0A0A]/80 leading-relaxed">
//                         {project.summary}
//                       </p>
//                     </div>

//                     {/* Metrics Grid */}
//                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[#0A0A0A10]">
//                       {project.results.map((res, rIdx) => (
//                         <div key={rIdx} className="space-y-0.5">
//                           <div className="text-lg sm:text-xl font-black text-[#0A0A0A] font-sans">
//                             {res.value}
//                           </div>
//                           <div className="text-[10px] font-mono uppercase text-[#8E8E8E] leading-tight">
//                             {res.label}
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Action Bar */}
//                     <div className="flex flex-wrap items-center gap-4 pt-2">
//                       <button
//                         onClick={() => setSelectedCase(project)}
//                         className="px-6 py-3 rounded-full bg-[#0A0A0A] hover:bg-[#202020] text-[#F5F3EF] text-xs font-bold uppercase tracking-[0.18em] flex items-center gap-2 transition-all cursor-pointer shadow-md"
//                       >
//                         <span>VIEW CASE ARCHITECTURE</span>
//                         <ArrowUpRight className="w-4 h-4" />
//                       </button>

//                       <span className="text-xs font-mono text-[#8E8E8E]">
//                         CLIENT: <strong className="text-[#0A0A0A]">{project.client}</strong>
//                       </span>
//                     </div>
//                   </div>

//                   {/* Right Column (5 cols): High-res Image & API Preview */}
//                   <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
//                     <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-[#0A0A0A15] bg-[#0A0A0A]">
//                       <img
//                         src={project.imageUrl}
//                         alt={project.title}
//                         referrerPolicy="no-referrer"
//                         className="w-full h-full object-cover grayscale contrast-125 opacity-90 transition-transform duration-700 hover:scale-105"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
//                       <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md text-[#F5F3EF] text-[10px] font-mono font-bold tracking-widest border border-white/20">
//                         {project.badge}
//                       </div>
//                     </div>

//                     {/* Micro code pill */}
//                     <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#202020] text-[#EAE7E1] text-[11px] font-mono flex items-center justify-between">
//                       <div className="flex items-center gap-2 truncate">
//                         <Terminal className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
//                         <span className="truncate text-[#8E8E8E]">SDK: pixzen.whatsapp.dispatch()</span>
//                       </div>
//                       <span className="text-[9px] text-[#10B981] font-bold shrink-0">TIER-4 VERIFIED</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Full-Screen Case Study Modal */}
//       <AnimatePresence>
//         {selectedCase && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
//             onClick={() => setSelectedCase(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.94, y: 30 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.94, y: 30 }}
//               transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
//               className="relative w-full max-w-4xl rounded-3xl border border-[#0A0A0A15] bg-[#F5F3EF] text-[#0A0A0A] p-6 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Close Button */}
//               <button
//                 onClick={() => setSelectedCase(null)}
//                 className="absolute top-6 right-6 p-2.5 rounded-full border border-[#0A0A0A15] bg-[#EAE7E1] hover:bg-[#0A0A0A] hover:text-[#F5F3EF] transition-colors cursor-pointer z-10"
//               >
//                 <X className="w-5 h-5" />
//               </button>

//               {/* Modal Content */}
//               <div className="space-y-8">
//                 {/* Meta header */}
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-3">
//                     <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-[#0A0A0A] text-[#F5F3EF]">
//                       CASE STUDY // {selectedCase.number}
//                     </span>
//                     <span className="text-xs font-mono text-[#8E8E8E] uppercase tracking-wider">
//                       {selectedCase.category}
//                     </span>
//                   </div>
//                   <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
//                     {selectedCase.title}
//                   </h3>
//                   <div className="text-xs font-mono text-[#8E8E8E]">
//                     PARTNER: <span className="text-[#0A0A0A] font-bold">{selectedCase.client}</span> &bull; YEAR: {selectedCase.year}
//                   </div>
//                 </div>

//                 {/* Hero Image */}
//                 <div className="h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#0A0A0A15] relative">
//                   <img
//                     src={selectedCase.imageUrl}
//                     alt={selectedCase.title}
//                     referrerPolicy="no-referrer"
//                     className="w-full h-full object-cover grayscale contrast-125"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 via-transparent to-transparent" />
//                   <div className="absolute bottom-4 left-4 text-white text-xs font-mono">
//                     PRODUCTION TELEMETRY: 99.999% SLA
//                   </div>
//                 </div>

//                 {/* Challenge & Solution 2-col */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="p-6 rounded-2xl bg-[#EAE7E1] border border-[#0A0A0A10] space-y-2">
//                     <div className="text-xs font-mono uppercase font-bold text-[#8E8E8E] tracking-wider">
//                       THE ARCHITECTURAL CHALLENGE
//                     </div>
//                     <p className="text-sm leading-relaxed text-[#0A0A0A]/85">
//                       {selectedCase.challenge}
//                     </p>
//                   </div>

//                   <div className="p-6 rounded-2xl bg-[#0A0A0A] text-[#F5F3EF] border border-[#202020] space-y-2">
//                     <div className="text-xs font-mono uppercase font-bold text-[#10B981] tracking-wider">
//                       PIXZEN AUTONOMOUS SOLUTION
//                     </div>
//                     <p className="text-sm leading-relaxed text-[#EAE7E1]/90">
//                       {selectedCase.solution}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Metrics Breakdown */}
//                 <div className="space-y-3">
//                   <div className="text-xs font-mono uppercase tracking-widest text-[#8E8E8E]">
//                     MEASURABLE BUSINESS IMPACT
//                   </div>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                     {selectedCase.results.map((r, i) => (
//                       <div key={i} className="p-4 rounded-xl bg-[#EAE7E1]/50 border border-[#0A0A0A10] space-y-1">
//                         <div className="text-2xl font-black text-[#0A0A0A]">{r.value}</div>
//                         <div className="text-xs font-mono text-[#8E8E8E] uppercase">{r.label}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Code snippet */}
//                 <div className="space-y-2">
//                   <div className="text-xs font-mono uppercase tracking-widest text-[#8E8E8E]">
//                     CORE API PAYLOAD & DISPATCH SPEC
//                   </div>
//                   <pre className="p-4 rounded-xl bg-[#0A0A0A] text-[#10B981] text-xs font-mono overflow-x-auto border border-[#202020]">
//                     <code>{selectedCase.apiSnippet}</code>
//                   </pre>
//                 </div>

//                 {/* Footer action */}
//                 <div className="pt-4 border-t border-[#0A0A0A15] flex flex-wrap items-center justify-between gap-4">
//                   <div className="text-xs font-mono text-[#8E8E8E]">
//                     CONFIDENTIALITY: PUBLIC ENTERPRISE RELEASE
//                   </div>
//                   <button
//                     onClick={() => setSelectedCase(null)}
//                     className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-[#F5F3EF] text-xs font-bold uppercase tracking-widest hover:bg-[#202020] transition-colors cursor-pointer"
//                   >
//                     CLOSE CASE STUDY
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </section>
//   );
// };

function About() {
  const containerRef = useRef(null);

  const textRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ['start 0.85', 'end 0.45'],
  });

  const manifestoText =
    "WE BELIEVE CONVERSATIONS ARE THE MOST POWERFUL TRANSACTIONAL MEDIUM ON EARTH. AS COMMERCE SHIFTS TO AUTONOMOUS INTELLIGENCE, THE LIMITATION IS NO LONGER MODEL DEPTH — IT IS REAL-TIME MESSAGING INFRASTRUCTURE. PIXZEN BRIDGES THE CHASM BETWEEN COGNITIVE AI AGENTS AND 3 BILLION WHATSAPP USERS WORLDWIDE.";

  const words = manifestoText.split(' ');

  const marqueeValues = [
    'AUTONOMOUS AGENT ORCHESTRATION',
    'TIER-4 WHATSAPP ROUTING',
    'SUB-20MS GLOBAL DISPATCH',
    'DYNAMIC FLOW CHECKOUTS',
    'END-TO-END CRYPTOGRAPHIC SECURITY',
    'COGNITIVE COMMERCE',
    '99.999% CARRIER SLA',
    'INSTANT TELEMETRY WEBHOOKS',
  ];

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative w-full py-28 border-t border-[#0A0A0A15] bg-[#F5F3EF] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-20">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#8E8E8E]">
            05 // THE MANIFESTO & PHILOSOPHY
          </span>
          <span className="h-[1px] w-12 bg-[#0A0A0A15]" />
        </div>

        {/* Word-by-word scroll reveal text */}
        <div ref={textRef} className="max-w-5xl">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.08] text-[#0A0A0A] font-sans">
            {words.map((word, i) => {
              // Finish all words well before the section ends so none get cut off
              const start = (i / words.length) * 0.85;
              const end = start + (1 / words.length) * 0.85;
              return (
                <WordReveal
                  key={i}
                  word={word}
                  progress={scrollYProgress}
                  range={[start, Math.min(end, 1)]}
                />
              );
            })}
          </h2>
        </div>

        {/* Sub-manifesto stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-[#0A0A0A15]">
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-[#8E8E8E] uppercase tracking-wider">
              [ 01 // PRINCIPLE ]
            </div>
            <h4 className="text-lg font-bold uppercase text-[#0A0A0A]">
              ZERO-FRICTION HUMAN INTERFACES
            </h4>
            <p className="text-xs text-[#0A0A0A]/70 leading-relaxed">
              Users don't want to download another forgotten app or verify another 8-step email link. WhatsApp is already on their home screen.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-[#8E8E8E] uppercase tracking-wider">
              [ 02 // PRINCIPLE ]
            </div>
            <h4 className="text-lg font-bold uppercase text-[#0A0A0A]">
              AUTONOMOUS COGNITION
            </h4>
            <p className="text-xs text-[#0A0A0A]/70 leading-relaxed">
              Every incoming WhatsApp ping is parsed with specialized reasoning models that execute tool calls, query private databases, and synthesize personalized responses.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-[#8E8E8E] uppercase tracking-wider">
              [ 03 // PRINCIPLE ]
            </div>
            <h4 className="text-lg font-bold uppercase text-[#0A0A0A]">
              UNCOMPROMISING INFRASTRUCTURE
            </h4>
            <p className="text-xs text-[#0A0A0A]/70 leading-relaxed">
              Engineered with Rust and distributed edge nodes across 18 cloud regions. Delivering messages in less than 20 milliseconds under extreme 20,000 TPS surges.
            </p>
          </div>
        </div>
      </div>

      {/* Massive Infinite Marquee of Brand Values */}
      <div className="relative w-full py-8 bg-[#0A0A0A] text-[#F5F3EF] overflow-hidden select-none">
        <div className="animate-marquee-slow flex items-center gap-12 text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-widest font-sans">
          {marqueeValues.map((val, idx) => (
            <div key={`marquee-val-1-${idx}`} className="flex items-center gap-12 shrink-0">
              <span className="hover:text-[#10B981] transition-colors">{val}</span>
              <span className="text-[#8E8E8E] text-2xl sm:text-4xl">&bull;</span>
            </div>
          ))}
          {/* Loop duplicate */}
          {marqueeValues.map((val, idx) => (
            <div key={`marquee-val-2-${idx}`} className="flex items-center gap-12 shrink-0">
              <span className="hover:text-[#10B981] transition-colors">{val}</span>
              <span className="text-[#8E8E8E] text-2xl sm:text-4xl">&bull;</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function WordReveal({ word, progress, range }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const y = useTransform(progress, range, [4, 0]);

  return (
    <span className="inline-block mr-[0.28em] my-[0.04em] relative">
      <motion.span style={{ opacity, y }} className="inline-block">
        {word}
      </motion.span>
    </span>
  );
};

function Insights() {
  const [hoveredArticle, setHoveredArticle] = useState(null);
  const [activeArticleModal, setActiveArticleModal] = useState(null);

  const cursorImageRef = useRef(null);
  const sectionRef = useRef(null);

  const articles = [
    {
      id: 'art-1',
      category: 'ARCHITECTURE // ZERO-LATENCY',
      title: 'HOW WE ACHIEVE <18MS WHATSAPP DISPATCH USING RUST EDGE WORKERS',
      date: 'AUG 28, 2026',
      readTime: '6 MIN READ',
      previewImage:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      snippet:
        'Bypassing traditional HTTP connection setup through persistent Meta Graph API Keep-Alive pools, speculative TLS handshakes, and distributed geographic socket routing.',
    },
    {
      id: 'art-2',
      category: 'COGNITIVE SYSTEMS // LLM',
      title: 'GUARDRAILING AUTONOMOUS AGENTS IN UNTRUSTED MESSAGING ENVIRONMENTS',
      date: 'AUG 15, 2026',
      readTime: '8 MIN READ',
      previewImage:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      snippet:
        'Strategies for preventing prompt injection, safeguarding customer PII, and enforcing deterministic tool calling when interacting with billions of consumer WhatsApp accounts.',
    },
    {
      id: 'art-3',
      category: 'CONVERSATIONAL COMMERCE',
      title: 'THE DEATH OF THE MOBILE WEB APP: WHY WHATSAPP FLOWS ARE WINNING',
      date: 'JUL 30, 2026',
      readTime: '5 MIN READ',
      previewImage:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      snippet:
        'Why enterprise retailers are observing 3.2x higher conversion rates when converting web checkout funnels into interactive WhatsApp native component flows.',
    },
    {
      id: 'art-4',
      category: 'TELECOM & CARRIER PROTOCOLS',
      title: 'NAVIGATING META TIER-4 SCALE: QUEUES, RATE LIMITS, AND WARMING',
      date: 'JUL 12, 2026',
      readTime: '10 MIN READ',
      previewImage:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      snippet:
        'Deep dive into WhatsApp Cloud API rate limits, template tier promotion algorithms, and automated health score management for enterprise volume spikes.',
    },
    {
      id: 'art-5',
      category: 'SECURITY & CIPHERS',
      title: 'CRYPTOGRAPHIC AUDITING FOR ENTERPRISE BANKING OVER WHATSAPP',
      date: 'JUN 24, 2026',
      readTime: '7 MIN READ',
      previewImage:
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      snippet:
        'Implementing zero-knowledge tokenization, hardware security module (HSM) signing, and ephemeral session disposal for SOC2/HIPAA compliance.',
    },
  ];

  // GSAP Smooth Cursor Image Follower
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cursorImageRef.current) return;

      // Animate cursor thumbnail coordinates using GSAP
      gsap.to(cursorImageRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.35,
        ease: 'power3.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      id="insights"
      ref={sectionRef}
      className="relative w-full py-28 border-t border-[#0A0A0A15] bg-[#F5F3EF] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#8E8E8E]">
                06 // RESEARCH & INSIGHTS
              </span>
              <span className="h-[1px] w-12 bg-[#0A0A0A15]" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0A0A0A] uppercase font-sans">
              ENGINEERING LOGS
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#0A0A0A]/70 leading-relaxed">
            Technical write-ups, architecture breakdowns, and whitepapers on autonomous messaging networks.
          </p>
        </div>

        {/* Editorial Table-like Rows */}
        <div className="border-t border-[#0A0A0A15] divide-y divide-[#0A0A0A15]">
          {articles.map((art, idx) => (
            <div
              key={art.id}
              onMouseEnter={() => setHoveredArticle(art)}
              onMouseLeave={() => setHoveredArticle(null)}
              onClick={() => setActiveArticleModal(art)}
              className="group py-8 sm:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer transition-colors duration-300 hover:bg-[#EAE7E1]/50 px-4 sm:px-6 -mx-4 sm:-mx-6 rounded-2xl"
            >
              {/* Left Column: Number + Category + Title */}
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-4 text-xs font-mono text-[#8E8E8E]">
                  <span className="text-[#0A0A0A] font-bold">0{idx + 1}</span>
                  <span>//</span>
                  <span className="uppercase tracking-widest">{art.category}</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black uppercase text-[#0A0A0A] group-hover:translate-x-2 transition-transform duration-300">
                  {art.title}
                </h3>
              </div>

              {/* Right Column: Date, Read Time & Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-10 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#0A0A0A]">{art.date}</div>
                  <div className="text-[10px] font-mono text-[#8E8E8E] uppercase">{art.readTime}</div>
                </div>

                <div className="w-10 h-10 rounded-full border border-[#0A0A0A15] bg-[#F5F3EF] flex items-center justify-center text-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-[#F5F3EF] group-hover:border-[#0A0A0A] transition-all duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cursor Image Reveal (Physical GSAP Follower) */}
      <div
        ref={cursorImageRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-50 -ml-36 -mt-24 transition-opacity duration-300 hidden lg:block ${
          hoveredArticle ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <div className="w-72 h-48 rounded-2xl overflow-hidden border-2 border-[#0A0A0A] bg-[#0A0A0A] shadow-2xl">
          {hoveredArticle && (
            <img
              src={hoveredArticle.previewImage}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-500"
            />
          )}
        </div>
      </div>

      {/* Read Article Modal */}
      <AnimatePresence>
        {activeArticleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setActiveArticleModal(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl rounded-3xl border border-[#0A0A0A15] bg-[#F5F3EF] text-[#0A0A0A] p-6 sm:p-10 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveArticleModal(null)}
                className="absolute top-6 right-6 p-2.5 rounded-full border border-[#0A0A0A15] bg-[#EAE7E1] hover:bg-[#0A0A0A] hover:text-[#F5F3EF] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-xs font-mono text-[#8E8E8E]">
                  <span className="px-2 py-1 rounded bg-[#0A0A0A] text-[#F5F3EF] font-bold">
                    WHITE PAPER
                  </span>
                  <span>{activeArticleModal.date}</span>
                  <span>&bull;</span>
                  <span>{activeArticleModal.readTime}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A]">
                  {activeArticleModal.title}
                </h3>

                <div className="h-64 rounded-2xl overflow-hidden border border-[#0A0A0A15]">
                  <img
                    src={activeArticleModal.previewImage}
                    alt={activeArticleModal.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                </div>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#0A0A0A]/85">
                  <p className="font-semibold text-lg text-[#0A0A0A]">
                    {activeArticleModal.snippet}
                  </p>
                  <p>
                    As enterprise customer volume migrates to instant messaging channels, conventional infrastructure architectures face catastrophic bottlenecks. Synchronous database calls and high-overhead JSON serialization introduce 200–500ms of lag per turn.
                  </p>
                  <p>
                    By implementing edge-proxied Rust workers with persistent TCP connections directly to Meta Cloud data centers, PIXZEN reduces median delivery latency to under 18ms.
                  </p>
                </div>

                <div className="pt-6 border-t border-[#0A0A0A15] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8E8E8E]">
                    PUBLISHED BY PIXZEN RESEARCH LABS
                  </span>
                  <button
                    onClick={() => setActiveArticleModal(null)}
                    className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-[#F5F3EF] text-xs font-bold uppercase tracking-widest hover:bg-[#202020] transition-colors cursor-pointer"
                  >
                    CLOSE LOG
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

function Contact({ isOpen = false, onClose }) {
  const [modalOpen, setModalOpen] = useState(isOpen);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    volume: '1M - 10M messages/mo',
    scope: '',
  });

  const buttonRef = useRef(null);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setModalOpen(false);
    if (onClose) onClose();
  };

  // Magnetic Button Effect with GSAP elastic physics
  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const handleMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      // Magnetic pull radius 120px
      if (distance < 120) {
        gsap.to(btn, {
          x: deltaX * 0.35,
          y: deltaY * 0.35,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.3)',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0A0A0A', '#10B981', '#F5F3EF'],
      });
    } catch {
      // fallback
    }
  };

  return (
    <section
      id="contact"
      className="relative w-full py-32 sm:py-44 border-t border-[#0A0A0A15] bg-[#0A0A0A] text-[#F5F3EF] overflow-hidden select-none"
    >
      {/* Halftone dot pattern overlay on dark background */}
      <div className="absolute inset-0 halftone-dark opacity-35 pointer-events-none" />

      {/* Animated Glowing Gradient Blurs in Background */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-10 right-1/4 w-[450px] h-[450px] rounded-full bg-white/5 blur-3xl animate-pulse pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 text-center flex flex-col items-center justify-center space-y-10">
        {/* Top Tag */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-mono tracking-[0.25em] text-[#A0A0A0]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="uppercase">NOW ONBOARDING ENTERPRISE COHORTS</span>
        </div>

        {/* Massive Centered Headline */}
        <h2 className="text-4xl sm:text-7xl md:text-8xl lg:text-[100px] font-black uppercase tracking-tight leading-[0.95] text-[#F5F3EF] max-w-5xl font-sans">
          LET’S BUILD <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#EAE7E1] to-[#8E8E8E]">
            THE FUTURE.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-[#8E8E8E] leading-relaxed">
          Whether you are dispatching 50,000 mission-critical OTPs or deploying autonomous multi-agent WhatsApp sales infrastructure, PIXZEN delivers unprecedented speed and reliability.
        </p>

        {/* Magnetic CTA Pill Button */}
        <div className="pt-4">
          <button
            ref={buttonRef}
            onClick={() => setModalOpen(true)}
            id="magnetic-start-project-btn"
            className="group relative inline-flex items-center gap-4 px-10 py-5 rounded-full bg-[#F5F3EF] text-[#0A0A0A] text-sm sm:text-base font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-white/20 active:scale-95 cursor-pointer"
          >
            <span>START A PROJECT</span>
            <div className="w-7 h-7 rounded-full bg-[#0A0A0A] text-[#F5F3EF] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Direct Connect Pills */}
        {/* <div className="pt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#8E8E8E]">
          <a
            href="mailto:hello@pixzen.ai"
            className="flex items-center gap-2 hover:text-[#F5F3EF] transition-colors"
          >
            <Mail className="w-4 h-4 text-[#10B981]" />
            <span>hello@pixzen.ai</span>
          </a>
          <span>&bull;</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>SOC2 TYPE II CERTIFIED</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#10B981]" />
            <span>INSTANT SLACK / DISCORD SHARED CHANNELS</span>
          </div>
        </div> */}
      </div>

      {/* Interactive Contact & API Access Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.92, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 25 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#141414] text-[#F5F3EF] p-8 sm:p-10 shadow-2xl overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Halftone texture inside modal */}
              <div className="absolute inset-0 halftone-dark opacity-15 pointer-events-none" />

              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/20 text-[#8E8E8E] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#10B981] mb-2 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>DIRECT ENTERPRISE ENGAGEMENT</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-sans">
                      INITIALIZE Waply ACCESS
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8E8E8E] mt-1">
                      Fill out your technical requirements below. We provision dedicated sandbox clusters within 4 hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                        YOUR NAME
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Elena Vance"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1E1E1E] text-sm text-white focus:outline-none focus:border-white transition-colors font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                        WORK EMAIL
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1E1E1E] text-sm text-white focus:outline-none focus:border-white transition-colors font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                        COMPANY / ORGANIZATION
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Vanguard Robotics"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1E1E1E] text-sm text-white focus:outline-none focus:border-white transition-colors font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                        ESTIMATED WHATSAPP VOLUME
                      </label>
                      <select
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1E1E1E] text-sm text-white focus:outline-none focus:border-white transition-colors font-sans cursor-pointer"
                      >
                        <option value="100k - 500k">100k - 500k messages/mo</option>
                        <option value="500k - 1M">500k - 1M messages/mo</option>
                        <option value="1M - 10M">1M - 10M messages/mo</option>
                        <option value="10M+">10M+ messages/mo (Tier-4 Unlimited)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                      PROJECT SCOPE & OBJECTIVES
                    </label>
                    <textarea
                      rows={3}
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      placeholder="We need to automate conversational customer support and dispatch real-time transactional alerts via WhatsApp API..."
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1E1E1E] text-sm text-white focus:outline-none focus:border-white transition-colors font-sans resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#F5F3EF] hover:bg-white text-[#0A0A0A] text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>TRANSMIT REQUIREMENTS</span>
                  </button>
                </form>
              ) : (
                <div className="relative z-10 py-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center mx-auto text-[#10B981]">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                      TRANSMISSION CONFIRMED
                    </h3>
                    <p className="text-sm text-[#8E8E8E] max-w-md mx-auto">
                      Thank you, <strong className="text-white">{formData.name}</strong>. Our enterprise architecture team has received your project briefing for <strong className="text-white">{formData.company || 'your team'}</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1E1E1E] border border-white/10 text-xs font-mono text-left space-y-2 max-w-md mx-auto">
                    <div className="text-[#10B981] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>PROVISIONED TEMPORARY DEVELOPER CLUSTER:</span>
                    </div>
                    <div className="p-2 rounded bg-black/60 text-[#EAE7E1] font-bold select-all">
                      pxz_live_cohort_{Math.random().toString(36).substring(2, 10)}
                    </div>
                    <div className="text-[10px] text-[#8E8E8E]">
                      Our solutions engineer will connect with you at {formData.email} within 4 hours.
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="px-8 py-3 rounded-full bg-[#F5F3EF] text-[#0A0A0A] text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
                  >
                    RETURN TO SITE
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

function Footer() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' UTC'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full border-t border-[#0A0A0A15] bg-[#F5F3EF] text-[#0A0A0A] pt-20 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Multi-column directory grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-[#0A0A0A15]">
          {/* Col 1: Brand & Thesis (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              {/* <div className="w-8 h-8 rounded-sm bg-[#0A0A0A] flex items-center justify-center text-[#F5F3EF] font-bold text-sm">
                PZ
              </div> */}
              <span className="text-2xl font-black tracking-[0.2em] uppercase text-[#0A0A0A]">
                WAPLY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#0A0A0A]/70 max-w-sm leading-relaxed">
              The world-class autonomous AI agency and high-throughput WhatsApp Cloud messaging infrastructure. Engineered for Fortune 500 enterprises and hyper-growth scaleups.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#8E8E8E]">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
                <span className="text-[#0A0A0A] font-semibold">STATUS: 100% OPERATIONAL</span>
              </div>
              <span>&bull;</span>
              <div>{currentTime || '00:00:00 UTC'}</div>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8E8E8E]">
              PLATFORM // CORE
            </div>
            <ul className="space-y-2.5 text-xs font-semibold uppercase tracking-wider text-[#0A0A0A]/80">
              <li>
                <a href="#sandbox" className="hover:text-[#0A0A0A] transition-colors flex items-center gap-1">
                  <span>WhatsApp API</span>
                  <ArrowUpRight className="w-3 h-3 text-[#8E8E8E]" />
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#0A0A0A] transition-colors">
                  Autonomous Agents
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#0A0A0A] transition-colors">
                  Flows & Dynamic Pay
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#0A0A0A] transition-colors">
                  Multi-Modal Vision
                </a>
              </li>
              <li>
                <a href="#sandbox" className="hover:text-[#0A0A0A] transition-colors">
                  Developer Sandbox
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Research */}
          <div className="space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8E8E8E]">
              STUDIO & RESEARCH
            </div>
            <ul className="space-y-2.5 text-xs font-semibold uppercase tracking-wider text-[#0A0A0A]/80">
              <li>
                <a href="#work" className="hover:text-[#0A0A0A] transition-colors">
                  Selected Work
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#0A0A0A] transition-colors">
                  Manifesto
                </a>
              </li>
              <li>
                <a href="#insights" className="hover:text-[#0A0A0A] transition-colors">
                  Engineering Logs
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#0A0A0A] transition-colors">
                  Security & SOC2
                </a>
              </li>
              <li>
                <a href="mailto:careers@pixzen.ai" className="hover:text-[#0A0A0A] transition-colors">
                  Careers (Hiring)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Direct Ingress */}
          <div className="space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8E8E8E]">
              DIRECT ACCESS
            </div>
            <ul className="space-y-2.5 text-xs font-mono text-[#0A0A0A]">
              <li>
                <a
                  href="mailto:hello@pixzen.ai"
                  className="hover:underline font-bold transition-all text-[#0A0A0A]"
                >
                  hello@pixzen.ai
                </a>
              </li>
              <li>
                <a
                  href="mailto:press@pixzen.ai"
                  className="text-[#8E8E8E] hover:text-[#0A0A0A] transition-colors"
                >
                  press@pixzen.ai
                </a>
              </li>
              <li className="text-[#8E8E8E] text-[11px] pt-2">
                LONDON &bull; SAN FRANCISCO &bull; SINGAPORE
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8E8E8E]">
          <div>
            &copy; {new Date().getFullYear()} PIXZEN AI INC. ALL RIGHTS RESERVED. META TIER-4 CERTIFIED.
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-[#0A0A0A] transition-colors">
              PRIVACY POLICY
            </a>
            <span>&bull;</span>
            <a href="#hero" className="hover:text-[#0A0A0A] transition-colors">
              TERMS OF SERVICE
            </a>
            <span>&bull;</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-[#0A0A0A] transition-colors cursor-pointer group"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Home() {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleOpenSandbox = () => {
    const el = document.getElementById('sandbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenContact = () => {
    setContactModalOpen(true);
  };

  return (
    <SmoothScroll>
      {/* Global SVG Fractal Noise / Grain Overlay */}
      <NoiseOverlay />

      <div className="relative min-h-screen bg-[#F5F3EF] text-[#0A0A0A] font-sans selection:bg-[#0A0A0A] selection:text-[#F5F3EF]">
        {/* Floating Navbar */}
        <Navbar
          onOpenContact={handleOpenContact}
          onOpenSandbox={handleOpenSandbox}
        />

        {/* Main Content Sections */}
        <main className="relative w-full">
          {/* 1. Hero Section */}
          <Hero
            onOpenSandbox={handleOpenSandbox}
            onOpenContact={handleOpenContact}
          />

          {/* 2. Trusted Brands Infinite Marquee */}
          <TrustedBrands />

          {/* 3. Developer Live WhatsApp API Sandbox */}
          <LiveApiSandbox onOpenContact={handleOpenContact} />

          {/* 4. Our Expertise / Core Infrastructure */}
          <Services />

          {/* 5. Selected Work / Sticky Stacking Cards */}
          {/* <FeaturedWork /> */}

          {/* 6. Manifesto Vision & Values Marquee */}
          <About />

          {/* 7. Research Insights & Cursor Follower */}
          <Insights />

          {/* 8. Contact & Magnetic CTA */}
          <Contact
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
          />
        </main>

        {/* 9. Minimal Directory Footer */}
        <Footer />

        {/* Floating Quick Action Pill */}
        <button
          onClick={handleOpenSandbox}
          className="fixed bottom-6 right-6 z-30 hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0A0A0A] text-[#F5F3EF] text-xs font-mono font-bold tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 cursor-pointer group"
          title="Open WhatsApp API Live Tester"
        >
          <Terminal className="w-3.5 h-3.5 text-[#10B981] group-hover:rotate-12 transition-transform" />
          <span>API SANDBOX</span>
        </button>
      </div>
    </SmoothScroll>
  );
}