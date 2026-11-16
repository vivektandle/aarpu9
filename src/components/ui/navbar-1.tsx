"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Products", path: "/products" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Contact", path: "/contact" },
]

export interface Navbar1Props {
  onOpenQuoteModal?: () => void
  bgColor?: "white" | "black" | "transparent" | string
  className?: string
}

const isProjectOrLightRoute = (pathname: string) => {
  if (!pathname) return false
  const cleanPath = pathname.toLowerCase().split('?')[0].replace(/\/+$/, '') || '/'
  
  // Any product/project detail subpage e.g. /products/ap-38-swing-ecoshield, /products/ap-20-slide-rollup
  if (cleanPath.startsWith('/products/') || cleanPath.startsWith('/product/')) {
    return true
  }
  const parts = cleanPath.split('/').filter(Boolean)
  if (parts.length >= 2 && (parts[0] === 'products' || parts[0] === 'product' || parts[0] === 'portfolio' || parts[0] === 'projects')) {
    return true
  }
  if (cleanPath === '/404') {
    return true
  }
  return false
}

export function Navbar1({ onOpenQuoteModal, bgColor, className = "" }: Navbar1Props) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Immediately check if current route is a product/project detail page or explicit light page
  const isCurrentRouteLight = isProjectOrLightRoute(location.pathname) || bgColor === "white" || bgColor === "light"

  // Initialize isDarkBg to false on project/white pages so there is never white text on white background
  const [isDarkBg, setIsDarkBg] = useState(() => {
    if (isCurrentRouteLight) return false
    if (typeof window !== "undefined") {
      const scrollY = window.scrollY || window.pageYOffset || 0
      return scrollY < 60
    }
    return true
  })

  const toggleMenu = () => setIsOpen(!isOpen)

  // Close mobile dropdown on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Determine if background is black/dark or white/light
  useEffect(() => {
    const evaluateBackground = () => {
      // 1. Explicit prop check
      if (bgColor === "black" || bgColor === "dark") {
        setIsDarkBg(true)
        return
      }
      if (bgColor === "white" || bgColor === "light") {
        setIsDarkBg(false)
        return
      }

      // 2. Individual product/project detail pages have a white background at top and throughout
      if (isProjectOrLightRoute(location.pathname)) {
        setIsDarkBg(false)
        return
      }

      // 3. Hero slider pages (Home, About, Products catalogue, Portfolio, Contact):
      // At top of page over dark hero slider -> isDarkBg is true (text white).
      // Scrolled down (scrollY >= 60) over light/white body content -> isDarkBg is false (text black).
      const scrollY = window.scrollY || window.pageYOffset || 0
      setIsDarkBg(scrollY < 60)
    }

    evaluateBackground()
    window.addEventListener("scroll", evaluateBackground, { passive: true })
    window.addEventListener("resize", evaluateBackground, { passive: true })

    return () => {
      window.removeEventListener("scroll", evaluateBackground)
      window.removeEventListener("resize", evaluateBackground)
    }
  }, [bgColor, location.pathname])

  // Determine if navbar is currently over a light background
  const isLight = isCurrentRouteLight || !isDarkBg

  // Determine dynamic background class for container:
  // When over white/light background, provide frosted white pill (bg-white/95) with shadow
  // When over dark hero slider, maintain sleek transparent background
  const containerBgClass = isLight
    ? "bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
    : bgColor === "black" || bgColor === "dark"
    ? "bg-black/90 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    : "bg-transparent shadow-[0_8px_32px_rgba(0,0,0,0.06)]"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pt-safe pt-2.5 sm:pt-3.5 lg:pt-2 px-3 sm:px-5 lg:px-6 pointer-events-none">
      {/* Header Container - Exact original pill layout on laptop, transparent on mobile hero */}
      <div
        ref={containerRef}
        className={`flex items-center justify-between px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 py-1.5 lg:py-2 ${
          // On mobile when over dark hero slider, keep navigation transparent without pill box
          !isLight
            ? "max-lg:bg-transparent max-lg:shadow-none " + containerBgClass
            : containerBgClass
        } ${className} backdrop-blur-md rounded-full max-w-7xl w-full relative z-10 pointer-events-auto transition-colors duration-300 border-none`}
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {/* Left: Aarpu Logo */}
        <div className="flex items-center">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center group py-0.5 shrink-0" aria-label="Aarpu Home">
              {/* Previous Aarpu Logo */}
              <img
                src="/aarpu-logo.png"
                alt="Aarpu Architectural Aluminium"
                className="h-[52px] xs:h-[58px] sm:h-[68px] md:h-[78px] lg:h-[86px] w-auto object-contain block"
              />
            </Link>
          </motion.div>
        </div>

        {/* Middle: Desktop Navigation Links (Exact original laptop view) */}
        <nav className="hidden lg:flex items-center space-x-5 lg:space-x-8 overflow-x-auto no-scrollbar scrollbar-none py-1.5 shrink min-w-0">
          {NAV_LINKS.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path))

            // Dynamic text color based on background: high contrast on both white and dark
            const textColorClass = !isLight
              ? isActive
                ? "text-[#FF393B] font-bold"
                : "text-white font-semibold hover:text-[#FF393B]"
              : isActive
                ? "text-[#FF393B] font-bold"
                : "text-neutral-950 font-bold hover:text-[#FF393B]"

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="shrink-0"
              >
                <NavLink
                  to={item.path}
                  className={`text-[14.5px] tracking-wide transition-all font-semibold relative py-1.5 whitespace-nowrap block ${textColorClass}`}
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeTopNavIndicator"
                      className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[#FF393B] shadow-[0_0_8px_rgba(255,57,59,0.8)] rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </NavLink>
              </motion.div>
            )
          })}
        </nav>

        {/* Right: Enquiry Button (Desktop - Exact original) */}
        <div className="hidden lg:block shrink-0">
          <button
            type="button"
            onClick={onOpenQuoteModal}
            className="inline-flex items-center justify-center px-[22px] py-[9px] text-[12.5px] font-display font-bold uppercase tracking-wider text-white bg-[#FF393B] rounded-full cursor-pointer shadow-sm whitespace-nowrap hover:bg-[#e02e30] transition-colors"
          >
            <span>Enquiry</span>
          </button>
        </div>

        {/* Mobile & Tablet Clean Hamburger Menu Button */}
        <motion.button
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className={`lg:hidden flex items-center justify-center p-2 rounded-full transition-colors shrink-0 ${
            !isLight
              ? "text-white hover:bg-white/10 active:bg-white/20"
              : "text-neutral-950 hover:bg-black/10 active:bg-black/20"
          }`}
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? (
            <X className={`h-6 w-6 stroke-[1.8] ${!isLight ? "text-white" : "text-neutral-950"}`} />
          ) : (
            <Menu className={`h-6 w-6 stroke-[1.8] ${!isLight ? "text-white" : "text-neutral-950"}`} />
          )}
        </motion.button>
      </div>

      {/* Mobile & Tablet View: Menu Dropdown Bar - ALWAYS Blurred White Background */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-outside backdrop */}
            <motion.div
              key="topheader-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-40 pointer-events-auto lg:hidden"
              onClick={toggleMenu}
              aria-label="Close menu backdrop"
            />

            {/* Dropdown Bar: ONLY blurred white background, same design as laptop view, no border */}
            <motion.div
              key="topheader-dropdown-bar"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-[62px] sm:top-[74px] md:top-[84px] left-3 right-3 sm:left-6 sm:right-6 max-w-5xl mx-auto z-50 pointer-events-auto bg-white/95 text-neutral-950 backdrop-blur-md rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 sm:py-3.5 border-none shadow-[0_16px_40px_rgba(0,0,0,0.16)] lg:hidden"
              style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
                {/* Nav Links on blurred white background */}
                <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-4 w-full sm:w-auto">
                  {NAV_LINKS.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== "/" && location.pathname.startsWith(item.path))
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={toggleMenu}
                        className={`text-sm tracking-wide font-semibold px-3.5 py-1.5 rounded-full transition-all relative ${
                          isActive
                            ? "text-[#FF393B] font-bold bg-[#FF393B]/10 filter brightness-110"
                            : "text-neutral-900 font-semibold hover:text-[#FF393B] hover:bg-neutral-100/80"
                        }`}
                      >
                        {item.name}
                        {isActive && (
                          <span className="block mx-auto mt-0.5 h-0.5 w-4 bg-[#FF393B] shadow-[0_0_6px_rgba(255,57,59,0.8)] rounded-full" />
                        )}
                      </NavLink>
                    )
                  })}
                </nav>

                {/* Enquiry CTA Button matching laptop view */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
                  <button
                    type="button"
                    onClick={() => {
                      toggleMenu()
                      onOpenQuoteModal?.()
                    }}
                    className="inline-flex items-center justify-center px-5 py-2 text-xs font-display font-bold uppercase tracking-wider text-white bg-[#FF393B] rounded-full cursor-pointer shadow-sm hover:bg-[#e02e30] transition-colors"
                  >
                    <span>Enquiry</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar1
