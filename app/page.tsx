"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import {
  ChevronRight,
  ExternalLink,
  Share2,
  Calendar,
  Award,
  TrendingUp,
  ChevronLeft,
  Flame,
  Heart,
} from "lucide-react"
import Image from "next/image"

// Fonction utilitaire globale pour les liens tracker sheets apps
const trackClick = (type: string, source = "prototype") => {
  const url = `https://script.google.com/macros/s/AKfycbymhXrSqPAwEelDgp1jEZcDD2Tl4yxHmCryUQ4gErBOeU--VsUTJ13BtdtvjEoYvDmZRA/exec?type=${encodeURIComponent(type)}&source=${encodeURIComponent(source)}`

  fetch(url, {
    method: "GET",
    mode: "no-cors",
  }).catch((error) => {
    console.error("Erreur lors de l'appel au webhook :", error)
  })
}

// Composant pour les formes ondulées
const WavyShapes = ({ topColor = "#FFB347", bottomColor = "#7DE3A0", className = "", inverted = false }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ transform: inverted ? "rotate(180deg)" : "none" }}
      >
        <path
          d="M0,30 C20,50 40,0 60,20 C80,40 100,10 100,30 L100,100 L0,100 Z"
          fill="black"
          className="transition-all duration-1000"
        />
      </svg>
    </div>
  )
}

// Composant pour animer un compteur avec décimales
const AnimatedCounter = ({ value, duration = 2, delay = 0.5, decimals = 0 }) => {
  const nodeRef = useRef(null)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    let startTime
    let requestId

    const startValue = 0
    const endValue = value

    const updateCounter = (timestamp) => {
      if (!startTime) startTime = timestamp

      const elapsedTime = timestamp - startTime
      const progress = Math.min(elapsedTime / (duration * 1000), 1)

      // Fonction d'easing pour ralentir vers la fin
      const easeOutQuad = (t) => t * (2 - t)
      const easedProgress = easeOutQuad(progress)

      const currentValue = startValue + easedProgress * (endValue - startValue)

      // Formater avec le bon nombre de décimales
      if (decimals > 0) {
        node.textContent = currentValue.toFixed(decimals)
      } else {
        node.textContent = Math.floor(currentValue)
      }

      if (progress < 1) {
        requestId = requestAnimationFrame(updateCounter)
      } else {
        // Assurer que la valeur finale est exactement celle demandée
        node.textContent = typeof value === "number" && decimals > 0 ? value.toFixed(decimals) : value
      }
    }

    // Attendre le délai avant de commencer l'animation
    const timeoutId = setTimeout(() => {
      requestId = requestAnimationFrame(updateCounter)
    }, delay * 1000)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(requestId)
    }
  }, [value, duration, delay, decimals])

  return <span ref={nodeRef}>0</span>
}

export default function GyltWrapped() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [previousSlide, setPreviousSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward
  const [toneChoice, setToneChoice] = useState<"roast" | "gentle" | null>(null)
  const [bypassAutoAdvance, setBypassAutoAdvance] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const progress = useMotionValue(0)
  const opacity = useTransform(progress, [0, 100], [0, 1])

  const totalSlides = 13

  // Set images as loaded after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesLoaded(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const nextSlide = () => {
    if (showShareOptions) {
      setShowShareOptions(false)
      return
    }

    // If we're on the tone choice slide and no choice has been made, don't proceed
    if (currentSlide === 1 && toneChoice === null) {
      return
    }

    if (!isAnimating && imagesLoaded) {
      // Track click on first slide to go to second slide
      if (currentSlide === 0) {
        trackClick("first-page", "prototype")
      }

      setIsAnimating(true)
      setPreviousSlide(currentSlide)
      setDirection(1)

      // Si on est sur la slide des économies simplifiées (index 6) et qu'on n'a pas cliqué sur le bouton
      // "Voir comment économiser", on saute directement à la slide finale (index 8)
      if ([7, 8, 9].includes(currentSlide) && !bypassAutoAdvance) {
        setCurrentSlide(11)
      } else {
        setBypassAutoAdvance(false) // Reset pour la suite
        setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
      }

      // Special transition for scrolling from expenses to savings
      if (currentSlide === 5) {
        const scrollTransition = () => {
          const container = containerRef.current
          if (container) {
            container.style.transition = "transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)"
            container.style.transform = "translateY(-100%)"

            setTimeout(() => {
              container.style.transition = "none"
              container.style.transform = "translateY(0)"
            }, 800)
          }
        }

        // Only apply this special transition when moving forward from slide 5 to 6
        scrollTransition()
      }

      // Animate progress for transition effects
      const animateProgress = () => {
        const startTime = Date.now()
        const duration = 1000 // Increased duration for smoother transitions
        const animate = () => {
          const elapsed = Date.now() - startTime
          const newProgress = Math.min(100, (elapsed / duration) * 100)
          progress.set(newProgress)

          if (newProgress < 100) {
            requestAnimationFrame(animate)
          } else {
            setTimeout(() => {
              setIsAnimating(false)
            }, 100) // Small delay to ensure animations complete
          }
        }
        requestAnimationFrame(animate)
      }

      animateProgress()
    }
  }

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!isAnimating && imagesLoaded && currentSlide > 0) {
      setIsAnimating(true)
      setPreviousSlide(currentSlide)
      setDirection(-1)
      setCurrentSlide((prev) => prev - 1)

      // Animate progress for transition effects
      const animateProgress = () => {
        const startTime = Date.now()
        const duration = 1000 // Increased duration for smoother transitions
        const animate = () => {
          const elapsed = Date.now() - startTime
          const newProgress = Math.min(100, (elapsed / duration) * 100)
          progress.set(newProgress)

          if (newProgress < 100) {
            requestAnimationFrame(animate)
          } else {
            setTimeout(() => {
              setIsAnimating(false)
            }, 100) // Small delay to ensure animations complete
          }
        }
        requestAnimationFrame(animate)
      }

      animateProgress()
    }
  }

  const showDetails = (e: React.MouseEvent) => {
    e.stopPropagation()

    trackClick("cta-principal", "prototype") // ✅ PHASE 1

    // Passer à la slide détaillée des économies (nouvelle slide à l'index 7)
    setBypassAutoAdvance(true)
    setIsAnimating(true)
    setPreviousSlide(currentSlide)
    setDirection(1)
    setCurrentSlide(7) // Nouvelle position pour la slide détaillée

    // Animation de transition
    const animateProgress = () => {
      const startTime = Date.now()
      const duration = 1000
      const animate = () => {
        const elapsed = Date.now() - startTime
        const newProgress = Math.min(100, (elapsed / duration) * 100)
        progress.set(newProgress)

        if (newProgress < 100) {
          requestAnimationFrame(animate)
        } else {
          setTimeout(() => {
            setIsAnimating(false)
          }, 100)
        }
      }
      requestAnimationFrame(animate)
    }

    animateProgress()
  }

  const goToPartnerOffer = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentSlide(9) // Aller à la slide partenaire
  }

  const goToConfirmation = (e: React.MouseEvent) => {
    e.stopPropagation()
    trackClick("je-change", "prototype")
    setBypassAutoAdvance(true)
    setCurrentSlide(10) // Aller à la page de confirmation
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowShareOptions(true)
  }

  const chooseTone = (choice: "roast" | "gentle", e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the nextSlide
    setToneChoice(choice)
    // Proceed to next slide after a short delay
    setTimeout(() => {
      nextSlide()
    }, 500)
  }

  // Enhanced transition variants based on slide index
  const getSlideTransition = (index: number, direction: number) => {
    // Advanced transitions with 3D effects
    const transitions = [
      // Intro slide - 3D perspective fade with rotation and glow
      {
        initial: {
          opacity: 0,
          scale: direction > 0 ? 0.8 : 1.2,
          rotateY: direction > 0 ? -25 : 25,
          z: -300,
          filter: "blur(8px) brightness(0.8)",
        },
        animate: {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          z: 0,
          filter: "blur(0px) brightness(1)",
        },
        exit: {
          opacity: 0,
          scale: direction > 0 ? 1.2 : 0.8,
          rotateY: direction > 0 ? 25 : -25,
          z: -300,
          filter: "blur(8px) brightness(0.8)",
        },
        transition: {
          duration: 1,
          type: "spring",
          stiffness: 80,
          damping: 15,
        },
      },
      // Tone choice slide - Fade with scale and 3D rotation
      {
        initial: {
          opacity: 0,
          scale: 0.85,
          y: direction > 0 ? 80 : -80,
          rotateX: direction > 0 ? 10 : -10,
          filter: "blur(5px)",
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
        },
        exit: {
          opacity: 0,
          scale: 0.85,
          y: direction > 0 ? -80 : 80,
          rotateX: direction > 0 ? -10 : 10,
          filter: "blur(5px)",
        },
        transition: {
          duration: 0.8,
          type: "spring",
          stiffness: 70,
          damping: 15,
        },
      },
      // Total spent slide - 3D cube rotation with perspective
      {
        initial: {
          opacity: 0,
          rotateY: direction > 0 ? 90 : -90,
          x: direction > 0 ? "100%" : "-100%",
          z: -200,
          filter: "blur(10px) contrast(0.8)",
        },
        animate: {
          opacity: 1,
          rotateY: 0,
          x: 0,
          z: 0,
          filter: "blur(0px) contrast(1)",
        },
        exit: {
          opacity: 0,
          rotateY: direction > 0 ? -90 : 90,
          x: direction > 0 ? "-100%" : "100%",
          z: -200,
          filter: "blur(10px) contrast(0.8)",
        },
        transition: {
          duration: 1,
          type: "spring",
          stiffness: 60,
          damping: 12,
        },
      },
      // Top category slide - Elastic bounce with 3D perspective and glow
      {
        initial: {
          opacity: 0,
          scale: 0.6,
          y: direction > 0 ? 400 : -400,
          rotateX: direction > 0 ? 40 : -40,
          filter: "blur(15px) brightness(1.2)",
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px) brightness(1)",
        },
        exit: {
          opacity: 0,
          scale: 0.6,
          y: direction > 0 ? -400 : 400,
          rotateX: direction > 0 ? -40 : 40,
          filter: "blur(15px) brightness(1.2)",
        },
        transition: {
          duration: 1,
          type: "spring",
          stiffness: 70,
          damping: 10,
        },
      },
      // Personality slide - 3D card flip with perspective and glow
      {
        initial: {
          opacity: 0,
          rotateY: direction > 0 ? 180 : -180,
          scale: 0.7,
          z: -300,
          filter: "blur(10px) saturate(1.5)",
        },
        animate: {
          opacity: 1,
          rotateY: 0,
          scale: 1,
          z: 0,
          filter: "blur(0px) saturate(1)",
        },
        exit: {
          opacity: 0,
          rotateY: direction > 0 ? -180 : 180,
          scale: 0.7,
          z: -300,
          filter: "blur(10px) saturate(1.5)",
        },
        transition: {
          duration: 1.1,
          type: "spring",
          stiffness: 60,
          damping: 12,
        },
      },
      // Top expenses slide - Staggered reveal with 3D depth and glow
      {
        initial: {
          opacity: 0,
          y: direction > 0 ? "60%" : "-60%",
          scale: 0.85,
          rotateX: direction > 0 ? 15 : -15,
          z: -150,
          filter: "blur(8px) brightness(0.7)",
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          z: 0,
          filter: "blur(0px) brightness(1)",
        },
        exit: {
          opacity: 0,
          y: direction > 0 ? "-60%" : "60%",
          scale: 0.85,
          rotateX: direction > 0 ? -15 : 15,
          z: -150,
          filter: "blur(8px) brightness(0.7)",
        },
        transition: {
          duration: 0.9,
          type: "spring",
          stiffness: 70,
          damping: 12,
        },
      },
      // Savings slide - Vertical scroll transition from expenses slide with glow
      {
        initial: {
          opacity: direction > 0 && previousSlide === 5 ? 1 : 0,
          y: direction > 0 && previousSlide === 5 ? "100%" : direction > 0 ? "60%" : "-60%",
          filter: "blur(5px) brightness(1.2)",
        },
        animate: {
          opacity: 1,
          y: 0,
          filter: "blur(0px) brightness(1)",
        },
        exit: {
          opacity: direction < 0 && currentSlide === 5 ? 1 : 0,
          y: direction < 0 && currentSlide === 5 ? "-100%" : direction > 0 ? "-60%" : "60%",
          filter: "blur(5px) brightness(1.2)",
        },
        transition: {
          duration: 0.8,
          ease: [0.25, 1, 0.5, 1], // Custom cubic-bezier for smooth motion
        },
      },
      // Final slide - 3D carousel rotation with glow and depth
      {
        initial: {
          opacity: 0,
          rotateY: direction > 0 ? 70 : -70,
          scale: 0.75,
          x: direction > 0 ? "60%" : "-60%",
          filter: "blur(12px) brightness(1.5) contrast(0.8)",
          z: -250,
        },
        animate: {
          opacity: 1,
          rotateY: 0,
          scale: 1,
          x: 0,
          filter: "blur(0px) brightness(1) contrast(1)",
          z: 0,
        },
        exit: {
          opacity: 0,
          rotateY: direction > 0 ? -70 : 70,
          scale: 0.75,
          x: direction > 0 ? "-60%" : "60%",
          filter: "blur(12px) brightness(1.5) contrast(0.8)",
          z: -250,
        },
        transition: {
          duration: 1.2,
          type: "spring",
          stiffness: 60,
          damping: 12,
        },
      },
    ]

    return transitions[index]
  }

  // Enhanced particle effect for transitions with more variety and glow
  const ParticleEffect = ({ active }: { active: boolean }) => {
    const particles = Array.from({ length: 60 }, (_, i) => i) // Increased number of particles

    return (
      <div className={`absolute inset-0 pointer-events-none z-20 ${active ? "opacity-100" : "opacity-0"}`}>
        {particles.map((i) => {
          const size = Math.random() * 16 + 4 // Larger size range
          const duration = Math.random() * 2 + 1 // Longer duration
          const delay = Math.random() * 0.5
          const color = [
            "#7DE3A0",
            "#4ECDC4",
            "#FFD166",
            "#FF9966",
            "#F9E79F",
            "rgba(255, 255, 255, 0.9)",
            "rgba(255, 255, 255, 0.7)",
            "rgba(125, 227, 160, 0.8)",
          ][Math.floor(Math.random() * 8)]

          // Different particle shapes
          const isSquare = Math.random() > 0.7
          const isTriangle = !isSquare && Math.random() > 0.7
          const isStar = !isSquare && !isTriangle && Math.random() > 0.7

          return (
            <motion.div
              key={i}
              className={`absolute ${isSquare ? "rounded-sm" : isTriangle ? "triangle" : isStar ? "star" : "rounded-full"}`}
              style={{
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: !isTriangle && !isStar ? color : "transparent",
                boxShadow: `0 0 ${size / 1.5}px ${color}`,
                clipPath: isTriangle
                  ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                  : isStar
                    ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                    : "none",
                border: isTriangle || isStar ? `2px solid ${color}` : "none",
                zIndex: Math.floor(Math.random() * 10) + 20,
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={
                active
                  ? {
                      opacity: [0, 1, 0.8, 0],
                      scale: [0, 1, 0.8, 0],
                      x: [0, (Math.random() - 0.5) * 400], // Wider movement range
                      y: [0, (Math.random() - 0.5) * 400],
                      rotate: [0, Math.random() * 720 - 360], // More rotation
                    }
                  : {}
              }
              transition={{
                duration,
                delay,
                ease: "easeOut",
              }}
            />
          )
        })}
      </div>
    )
  }

  // 3D perspective wrapper for slides with enhanced depth
  const Perspective = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        perspective: "1500px", // Increased perspective for more dramatic 3D
        transformStyle: "preserve-3d",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  )

  const data = {
    totalSpent: 1234.78,
    topCategory: "Livraisons",
    topCategoryAmount: 245.9,
    topVendor: "Uber Eats",
    topVendorAmount: 110,
    potentialSavings: 85,
    gyltScore: 72,
    nextMonthGoal: "Réduire les livraisons de 20 €",
    categories: [
      { name: "Loyer", value: 650, color: "#6A0572", percentage: 59 },
      { name: "Livraisons", value: 245.9, color: "#FF6B6B", percentage: 22 },
      { name: "Achats", value: 159, color: "#FFD166", percentage: 14 },
      { name: "Forfait Téléphone/ Internet", value: 47.99, color: "#4ECDC4", percentage: 4 },
    ],
    vendors: [
      { name: "Uber Eats", value: 110, category: "Livraisons" },
      { name: "Domino's Pizza", value: 45.9, category: "Livraisons" },
      { name: "Sushi Shop", value: 90, category: "Livraisons" },
      { name: "Netflix", value: 17.99, category: "Abonnement" },
      { name: "Spotify", value: 9.99, category: "Abonnement" },
    ],
    spendingPersonality: "Carpe Diem",
    month: "mars",
    year: "2025",
    savingsDetails: [
      {
        category: "Forfait Téléphone/ Internet",
        amount: 20,
        difficulty: "Facile",
        items: [
          { name: "Changer d'opérateur mobile", amount: 12 },
          { name: "Optimiser l'offre internet", amount: 8 },
        ],
      },
      {
        category: "Abonnement divers",
        amount: 15,
        difficulty: "Facile",
        items: [
          { name: "Partager Netflix/ Spotify", amount: 10 },
          { name: "Annuler un abonnement inutilisé", amount: 5 },
        ],
      },
      {
        category: "Assurances",
        amount: 25,
        difficulty: "Moyen",
        items: [{ name: "Renégocier assurance auto/habitation", amount: 25 }],
      },
      {
        category: "Énergie (Électricité/Gaz)",
        amount: 25,
        difficulty: "Difficile",
        items: [{ name: "Changer de fournisseur d'énergie", amount: 25 }],
      },
    ],
    savingsSummary: [
      { difficulty: "Facile", amount: 35.0, percentage: 3.0, newTotal: 1199.78 },
      { difficulty: "Moyen", amount: 60.0, percentage: 5.0, newTotal: 1174.78 },
      { difficulty: "Difficile", amount: 85, percentage: 7, newTotal: 1149.78 },
    ],
  }

  // Financial personality descriptions based on tone choice
  const getPersonalityDesc = () => {
    if (toneChoice === "roast") {
      return "Un Epicurien... ou juste un flambeur ? Tu vis dans l'instant sans penser à demain. Livraison, streaming, petits plaisirs... Ton compte en banque pleure en silence."
    } else {
      return "Un Epicurien qui sait profiter de la vie ! Tu vis dans l'instant avec joie. Livraison, streaming, petits plaisirs... Tu sais te faire plaisir, et c'est important aussi non ?"
    }
  }

  // Get text content based on tone choice
  const getToneContent = (section: string) => {
    const content = {
      totalSpentRoast: "C'est ce que tu as cramé en mars. Ton compte en banque mérite des excuses...",
      totalSpentGentle: "C'est ce que tu as dépensé en mars. Un mois bien rempli !",
      topCategoryRoast: "T'as encore cramé 20% de ton fric là-dedans. Pas besoin de cuisine apparament...",
      topCategoryGentle: "Tu as consacré 20% de ton budget aux livraisons. Une préférence marquée !",
      economiesRoast: "Voilà ce que tu aurais pu économiser si tu faisais attention. Mais bon...",
      economiesGentle: "Voici ton potentiel d'économies pour les mois à venir !",
      nextGoalRoast: "Ton défi",
      nextGoalGentle: "Ton objectif pour avril",
      tapToContinueRoast: "Tape pour voir la suite",
      tapToContinueGentle: "Tape pour continuer",
    }

    return toneChoice === "roast"
      ? content[`${section}Roast` as keyof typeof content]
      : content[`${section}Gentle` as keyof typeof content]
  }

  // Brand footer component with subtle animation
  const BrandFooter = ({ color = "white", useBrightLogo = false }: { color?: string; useBrightLogo?: boolean }) => (
    <motion.div
      className="absolute bottom-4 right-4 z-20 flex items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div className="h-6 w-6 relative" whileHover={{ rotate: [0, 10, -10, 0], transition: { duration: 0.5 } }}>
        <Image src="/images/gylt-logo.png" alt="GYLT Logo" width={24} height={24} className="object-contain" priority />
      </motion.div>
      <div className="w-[60px] relative ml-1">
        <Image
          src={useBrightLogo ? "/images/gylt-name-bright.png" : "/images/gylt-name.png"}
          alt="GYLT"
          width={60}
          height={30}
          className="object-contain"
          priority
        />
      </div>
    </motion.div>
  )

  // Difficulty badge component with enhanced styling
  const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
    const bgColor = difficulty === "Facile" ? "bg-[#4ECDC4]" : difficulty === "Moyen" ? "bg-[#FFD166]" : "bg-[#A9A9A9]"

    return (
      <motion.span
        className={`${bgColor} text-black text-xs px-3 py-1 rounded-full font-medium`}
        whileHover={{ scale: 1.1, boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)" }}
      >
        {difficulty}
      </motion.span>
    )
  }

  // Share options modal with enhanced animations
  const ShareOptionsModal = () => (
    <motion.div
      className="absolute inset-0 bg-black/90 z-30 flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
    >
      <motion.div
        className="bg-white rounded-lg p-6 w-full max-w-xs"
        initial={{ y: 80, opacity: 0, rotateX: 30, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
        exit={{ y: 80, opacity: 0, rotateX: -30, scale: 0.8 }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
          delay: 0.2,
        }}
      >
        <h2 className="text-xl font-bold text-black mb-4 text-center">Partager mon Wrapped</h2>

        <div className="space-y-4">
          <motion.button
            className="w-full bg-[#4ECDC4] text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(78, 205, 196, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={18} className="mr-2" />
            Partager comme image
          </motion.button>

          <motion.button
            className="w-full bg-[#FFD166] text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(255, 209, 102, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar size={18} className="mr-2" />
            Ajouter à mon calendrier
          </motion.button>

          <motion.div
            className="pt-4 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-gray-600 text-center">
              Titre suggéré: "Voici mon mois de {data.month} sur GYLT"
            </p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-4 z-20 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="h-6 w-6 relative">
          <Image
            src="/images/gylt-logo.png"
            alt="GYLT Logo"
            width={24}
            height={24}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center">
          <div className="w-[60px] relative ml-1">
            <Image src="/images/gylt-name.png" alt="GYLT" width={60} height={30} className="object-contain" priority />
          </div>
        </div>
      </motion.div>

      <motion.p
        className="text-white text-sm mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        Tape n'importe où pour fermer
      </motion.p>
    </motion.div>
  )

  // Detailed savings slide - Intégré dans la timeline principale
  const DetailedSavingsSlide = () => (
    <motion.div
      key="detailedSavings"
      className="h-full w-full flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FFB347 0%, #7DE3A0 100%)",
        transformStyle: "preserve-3d",
      }}
      {...getSlideTransition(6, direction)}
    >
      {/* Formes décoratives en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cercles lumineux */}
        <motion.div
          className="absolute rounded-full bg-white/10"
          style={{
            width: 300,
            height: 300,
            right: "-100px",
            top: "20%",
            filter: "blur(60px)",
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute rounded-full bg-white/10"
          style={{
            width: 250,
            height: 250,
            left: "-100px",
            bottom: "10%",
            filter: "blur(60px)",
          }}
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 1,
          }}
        />

        {/* Formes géométriques flottantes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5"
            style={{
              width: 40 + Math.random() * 60,
              height: 40 + Math.random() * 60,
              borderRadius: Math.random() > 0.5 ? "50%" : "8px",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 45}deg)`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              rotate: [`${Math.random() * 45}deg`, `${Math.random() * 45 + 20}deg`],
              y: [0, Math.random() * 20 - 10],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.div
        className="p-6 pt-12 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2 px-2 w-full">
          Comment arrêter de jeter ton argent par les fenêtres
        </h2>
        <p className="text-white/80">Économise jusqu'à {data.potentialSavings}€ par mois</p>
      </motion.div>

      <div className="flex-1 overflow-auto px-4 pb-4 z-10 hide-scrollbar">
        <div className="space-y-4">
          {data.savingsDetails.map((category, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-lg p-4 shadow-lg"
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: idx * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-black">
                  {category.category} — {category.amount} €
                </h3>
                <DifficultyBadge difficulty={category.difficulty} />
              </div>

              <ul className="space-y-2 mb-4">
                {category.items.map((item, itemIdx) => (
                  <motion.li
                    key={itemIdx}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + itemIdx * 0.05 + 0.3 }}
                  >
                    <span className="text-black mr-2">•</span>
                    <span className="text-black flex-1">
                      {item.name} — {item.amount} €
                    </span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <span className="bg-[#4ECDC4] text-black text-xs px-2 py-0.5 rounded-full font-medium mr-2">
                    {category.category === "Forfait téléphone/ Internet" || category.category === "Énergie / forfaits"
                      ? "Changement en 2 clics"
                      : category.category === "Livraisons"
                        ? "Sans engagement"
                        : "Processus 1 min"}
                  </span>
                  Des offres plus avantageuses existent. On t'en propose une adaptée à tes dépenses.
                </p>
                <motion.button
                  className="w-full bg-[#4ECDC4] text-black font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(78, 205, 196, 0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    trackClick("detail", "prototype") // ✅ PHASE 2
                    setBypassAutoAdvance(true)
                    setCurrentSlide(7)
                  }}
                >
                  {category.category === "Forfait téléphone/ Internet"
                    ? `Économiser ${category.amount}€ maintenant`
                    : category.category === "Livraisons"
                      ? "Réduire mes livraisons"
                      : "Changer maintenant"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {data.savingsSummary.map((summary, idx) => {
            const bgColor =
              summary.difficulty === "Facile"
                ? "bg-[#4ECDC4]"
                : summary.difficulty === "Moyen"
                  ? "bg-[#FFD166]"
                  : "bg-[#A9A9A9]"

            return (
              <motion.div
                key={idx}
                className={`${bgColor} rounded-lg p-3 text-center`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.7 + idx * 0.15,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                whileHover={{
                  scale: 1.08,
                  y: -8,
                  boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
                }}
              >
                <p className="font-bold text-black">
                  {summary.difficulty} : {summary.amount} €
                </p>
                <p className="text-xs text-black mt-1">➔ Total après économie :</p>
                <p className="font-bold text-black">{summary.newTotal} €</p>
                <p className="text-xs text-black">({summary.percentage}% de ton budget)</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      <motion.div
        className="p-4 text-white z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-sm opacity-80">Tape pour continuer</p>
      </motion.div>
    </motion.div>
  )

  // Slides content with enhanced animations and repositioned titles
  const slides = [
    // Intro slide - Design moderne avec dégradé et formes géométriques
    <Perspective key="intro-perspective">
      <motion.div
        key="intro"
        className="h-full w-full flex flex-col justify-center items-center p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFB347 0%, #FFCC70 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(0, direction)}
      >
        {/* Formes géométriques flottantes */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              zIndex: 1,
            }}
            animate={{
              y: [0, Math.random() * 30 - 15],
              x: [0, Math.random() * 30 - 15],
              scale: [1, Math.random() * 0.3 + 0.9],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}

        {/* Cercle décoratif */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-white/5"
          style={{ top: "-250px", right: "-250px", zIndex: 1 }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />

        <div className="flex flex-col items-center mb-8 z-10 relative">
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Stylized name and logo */}
            <div className="flex items-center">
              <div className="w-[120px] relative">
                <Image
                  src="/images/gylt-name.png"
                  alt="GYLT"
                  width={120}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>

              <motion.div
                className="w-20 h-20 relative ml-2"
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                  filter: [
                    "drop-shadow(0 0 0px rgba(255, 255, 255, 0))",
                    "drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))",
                    "drop-shadow(0 0 0px rgba(255, 255, 255, 0))",
                  ],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              >
                <Image src="/images/gylt-logo.png" alt="GYLT Logo" fill className="object-contain" priority />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl font-bold text-white mb-2"
              animate={{
                textShadow: [
                  "0 0 0px rgba(255, 255, 255, 0)",
                  "0 0 10px rgba(255, 255, 255, 0.5)",
                  "0 0 0px rgba(255, 255, 255, 0)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              Ton bilan financier
            </motion.h1>
            <p className="text-2xl font-medium text-white">
              {data.month} {data.year}
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 self-center z-10 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            y: [0, 10, 0],
          }}
          transition={{
            delay: 1,
            y: {
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            },
          }}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
        >
          <p className="text-white font-medium">Tape pour commencer</p>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
          >
            <ChevronRight size={24} className="mx-auto mt-2 text-white" />
          </motion.div>
        </motion.div>

        {/* Ligne décorative en bas */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1.5 }}
        />
      </motion.div>
    </Perspective>,

    // Tone choice slide - Design moderne avec fond sombre et cartes contrastées
    <Perspective key="tone-choice-perspective">
      <motion.div
        key="toneChoice"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #1A1A2E 0%, #16213E 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(1, direction)}
      >
        {/* Éléments décoratifs */}
        <motion.div
          className="absolute top-0 left-0 w-full h-40 opacity-30"
          style={{
            background: "radial-gradient(circle at 30% 0%, rgba(255, 179, 71, 0.5) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <motion.div
          className="absolute bottom-0 right-0 w-full h-40 opacity-30"
          style={{
            background: "radial-gradient(circle at 70% 100%, rgba(78, 205, 196, 0.5) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 1 }}
        />

        {/* Lignes décoratives */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-white/10"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                right: 0,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scaleX: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 5 + i,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <motion.div
          className="p-6 pt-12 text-center z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-2 px-2 w-full">Comment veux-tu ton bilan ?</h2>
          <p className="text-white/70 text-lg">Choisis ton style de feedback</p>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 gap-8 z-10">
          <motion.div
            className={`w-full max-w-xs backdrop-blur-sm p-6 rounded-xl shadow-lg cursor-pointer ${
              toneChoice === "roast" ? "ring-2 ring-white" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, #FFB347 0%, #FFCC70 100%)",
              boxShadow: "0 10px 30px rgba(255, 179, 71, 0.3)",
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={(e) => chooseTone("roast", e)}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 30px rgba(255, 179, 71, 0.5)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center mb-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
              >
                <Flame className="w-8 h-8 text-white mr-3" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Mode Roast</h3>
            </div>
            <p className="text-white text-lg mb-4">
              Cash, direct et sans filtre. On te dit la vérité, même si ça pique un peu.
            </p>
          </motion.div>

          <motion.div
            className={`w-full max-w-xs backdrop-blur-sm p-6 rounded-xl shadow-lg cursor-pointer ${
              toneChoice === "gentle" ? "ring-2 ring-white" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, #7DE3A0 0%, #4ECDC4 100%)",
              boxShadow: "0 10px 30px rgba(125, 227, 160, 0.3)",
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            onClick={(e) => chooseTone("gentle", e)}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 30px rgba(125, 227, 160, 0.5)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
              >
                <Heart className="w-8 h-8 text-white mr-3" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Mode Doux</h3>
            </div>
            <p className="text-white text-lg mb-4">
              Bienveillant et encourageant. On t'accompagne avec empathie vers tes objectifs.
            </p>
          </motion.div>
        </div>

        <div className="p-6 text-white text-center z-10">
          <motion.p
            className="text-sm opacity-80"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Choisis un mode pour continuer
          </motion.p>
        </div>
      </motion.div>
    </Perspective>,

    // Total spent slide - Style Spotify Wrapped avec fond dégradé et formes ondulées
    <Perspective key="total-perspective">
      <motion.div
        key="total"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #FFB347 0%, black 50%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(2, direction)}
      >
        {/* Forme ondulée noire comme dans l'image de référence */}
        <WavyShapes topColor="#FFB347" bottomColor="#000000" />

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 z-10">
          <motion.p
            className="text-white text-xl mb-4 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {toneChoice === "roast" ? "Bah alors ? T'as Flambé ?" : "Tes dépenses totales"}
          </motion.p>

          <motion.div
            className="text-[80px] font-extrabold text-white leading-none tracking-tighter mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              textShadow: [
                "0px 0px 0px rgba(255,255,255,0)",
                "0px 0px 20px rgba(255,255,255,0.5)",
                "0px 0px 0px rgba(255,255,255,0)",
              ],
            }}
            transition={{
              delay: 0.7,
              duration: 0.8,
              textShadow: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                repeatType: "reverse",
              },
            }}
          >
            <AnimatedCounter value={data.totalSpent} duration={2.5} delay={0.7} decimals={2} />€
          </motion.div>

          <motion.p
            className="text-white text-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Jour le plus dépensier: 15 {data.month}
          </motion.p>

          <motion.p
            className="text-white text-xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Top {toneChoice === "roast" ? "20% des flambeurs" : "20% des dépensiers"}
          </motion.p>
        </div>

        {/* Texte explicatif en bas */}
        <motion.div
          className="p-6 text-white relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-center text-sm opacity-80">{getToneContent("tapToContinue")}</p>
        </motion.div>

        {/* Logo GYLT bright en bas à droite pour les fonds sombres */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center">
          <div className="h-6 w-6 relative">
            <Image
              src="/images/gylt-logo.png"
              alt="GYLT Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <div className="w-[60px] relative ml-1">
            <Image
              src="/images/gylt-name-bright.png"
              alt="GYLT"
              width={60}
              height={30}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </motion.div>
    </Perspective>,

    // Top category slide - Design avec motif géométrique et cercle central

    <Perspective key="category-perspective">
      <motion.div
        key="topCategory"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFD166 0%, #FFCC70 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(3, direction)}
      >
        {/* Motif géométrique en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/5"
              style={{
                width: 40 + Math.random() * 60,
                height: 40 + Math.random() * 60,
                borderRadius: "8px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 45}deg)`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                rotate: [`${Math.random() * 45}deg`, `${Math.random() * 45 + 20}deg`],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <motion.div
          className="p-6 pt-12 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white px-2 w-full">
            {toneChoice === "roast" ? "Ton péché mignon" : "Ta catégorie préférée"}
          </h2>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
          <motion.div
            className="relative w-64 h-64 mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              type: "spring",
              stiffness: 80,
              damping: 12,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #FF6B6B 0%, #FF9966 100%)",
                boxShadow: "0 10px 30px rgba(255, 107, 107, 0.3)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 15px 40px rgba(255, 107, 107, 0.5)",
              }}
              animate={{
                boxShadow: [
                  "0 10px 30px rgba(255, 107, 107, 0.3)",
                  "0 15px 40px rgba(255, 107, 107, 0.5)",
                  "0 10px 30px rgba(255, 107, 107, 0.3)",
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                },
              }}
            >
              <motion.div
                className="text-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              >
                <span className="text-8xl font-bold">🍕</span>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-6xl font-extrabold text-white mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
          >
            {data.topCategory}
          </motion.h1>

          {/* Texte explicatif repositionné au centre */}
          <motion.p
            className="text-white text-lg text-center max-w-xs mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {getToneContent("topCategory")}
          </motion.p>
        </div>

        {/* Texte "Tape pour continuer" en bas */}
        <motion.div
          className="p-6 text-white z-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm opacity-80">{getToneContent("tapToContinue")}</p>
        </motion.div>
      </motion.div>
    </Perspective>,

    // Personality slide - Design avec carte flottante et arrière-plan dynamique
    <Perspective key="personality-perspective">
      <motion.div
        key="personality"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #A8E6CF 0%, #7FDBDA 50%, #88CDFF 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(4, direction)}
      >
        {/* Cercles décoratifs */}
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 209, 102, 0.3) 0%, transparent 70%)",
            top: "10%",
            right: "-150px",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 179, 71, 0.2) 0%, transparent 70%)",
            bottom: "20%",
            left: "-100px",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 1 }}
        />

        <motion.div
          className="p-6 pt-12 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl font-bold text-white px-2 w-full">Ta personnalité financière</h2>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 z-10">
          <motion.div
            className="w-full max-w-xs backdrop-blur-sm p-8 rounded-xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, #FFD166 0%, #F9A826 100%)",
              boxShadow: "0 20px 40px rgba(249, 168, 38, 0.3)",
            }}
            initial={{ opacity: 0, y: 50, rotateX: 30 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 30px 60px rgba(249, 168, 38, 0.4)",
              rotateY: 5,
            }}
          >
            <motion.h1
              className="text-4xl font-extrabold text-black mb-4"
              animate={{
                textShadow: ["0 0 0px rgba(0, 0, 0, 0)", "0 0 5px rgba(0, 0, 0, 0.3)", "0 0 0px rgba(0, 0, 0, 0)"],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            >
              {data.spendingPersonality}
            </motion.h1>
            <p className="text-black text-lg">{getPersonalityDesc()}</p>

            <motion.div
              className={`mt-6 inline-block text-white text-sm px-4 py-1.5 rounded-full ${
                toneChoice === "roast" ? "bg-red-500" : "bg-green-500"
              }`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              {toneChoice === "roast" ? "Profil à risque !" : "Profil équilibré !"}
            </motion.div>
          </motion.div>
        </div>

        {/* Cercle décoratif */}
        <motion.div
          className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255, 209, 102, 0.8) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <motion.p
          className="p-6 text-white/70 text-center z-10"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {getToneContent("tapToContinue")}
        </motion.p>
      </motion.div>
    </Perspective>,

    // Top expenses slide - Conservé tel quel comme demandé

    <Perspective key="expenses-perspective">
      <motion.div
        key="topExpenses"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #0088b9 0%, #00b99b 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(5, direction)}
      >
        {/* Formes ondulées noires */}
        <div className="absolute inset-0 overflow-hidden">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path
              d="M0,35 C10,25 30,45 50,30 C70,15 90,25 100,20 L100,100 L0,100 Z"
              fill="black"
              className="transition-all duration-1000"
            />
          </svg>
        </div>

        <motion.div
          className="p-6 pt-12 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-[#7DE3A0] px-2 w-full">
            {toneChoice === "roast" ? "Où part ton argent" : "Ton Top Dépenses"}
          </h2>
        </motion.div>
        <div className="flex-1 flex flex-col justify-center p-6 z-10">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <motion.h3
                className="text-xl text-[#7DE3A0] font-medium mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Top Catégories
              </motion.h3>
              {data.categories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  className="mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + idx * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{
                    x: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    transition: { duration: 0.2 },
                  }}
                >
                  <p className="text-white text-lg">
                    <span className="font-bold">{idx + 1}</span> {cat.name}
                  </p>
                  <p className="text-white/70">
                    {cat.value} € ({cat.percentage}%)
                  </p>
                </motion.div>
              ))}
            </div>
            <div>
              <motion.h3
                className="text-xl text-[#7DE3A0] font-medium mb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Top Commerçants
              </motion.h3>
              {data.vendors.map((vendor, idx) => (
                <motion.div
                  key={idx}
                  className="mb-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + idx * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{
                    x: -8,
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    transition: { duration: 0.2 },
                  }}
                >
                  <p className="text-white text-lg">
                    <span className="font-bold">{idx + 1}</span> {vendor.name}
                  </p>
                  <p className="text-white/70">{vendor.value} €</p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-xl text-[#7DE3A0] font-medium">Ce que tu peux économiser:</p>
            <motion.p
              className="text-5xl font-bold text-white"
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 0px rgba(125, 227, 160, 0)",
                  "0 0 15px rgba(125, 227, 160, 0.7)",
                  "0 0 0px rgba(125, 227, 160, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            >
              {data.potentialSavings} €
            </motion.p>
          </motion.div>
        </div>
        <div className="p-6 text-white z-10">
          <motion.p
            className="text-sm opacity-80"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            {toneChoice === "roast"
              ? "Tape pour voir comment arrêter l'hémorragie"
              : "Tape pour voir comment économiser"}
          </motion.p>
        </div>

        {/* Logo GYLT en bas à droite */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center">
          <div className="h-6 w-6 relative">
            <Image
              src="/images/gylt-logo.png"
              alt="GYLT Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <div className="w-[60px] relative ml-1">
            <Image src="/images/gylt-name.png" alt="GYLT" width={60} height={30} className="object-contain" priority />
          </div>
        </div>
      </motion.div>
    </Perspective>,

    // Savings slide - Design avec formes géométriques et dégradé
    <Perspective key="savings-perspective">
      <motion.div
        key="savingsSimplified"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFB347 0%, #FFCC70 100%)",
          transformStyle: "preserve-3d",
          backgroundColor: "#FFA94D",
        }}
        {...getSlideTransition(6, direction)}
      >
        {/* Effet léger en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Cercles lumineux subtils */}
          <motion.div
            className="absolute rounded-full bg-white/10"
            style={{
              width: 300,
              height: 300,
              right: "-100px",
              bottom: "20%",
              filter: "blur(80px)",
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute rounded-full bg-white/5"
            style={{
              width: 200,
              height: 200,
              left: "10%",
              top: "15%",
              filter: "blur(60px)",
            }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        </div>

        <motion.div
          className="p-6 pt-12 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white px-2 w-full">
            {toneChoice === "roast" ? "Évite de perdre" : "Économise jusqu'à"}
          </h2>
        </motion.div>

        <div className="flex-1 flex flex-col justify-start items-center z-10">
          {/* Big savings number */}
          <div className="text-center mb-6">
            <motion.div
              className="text-7xl font-extrabold text-white mb-2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                textShadow: [
                  "0 0 0px rgba(255, 255, 255, 0)",
                  "0 0 30px rgba(255, 255, 255, 0.8)",
                  "0 0 0px rgba(255, 255, 255, 0)",
                ],
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                textShadow: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                },
              }}
            >
              {data.potentialSavings} €
            </motion.div>
            <motion.p
              className="text-xl text-white font-medium mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              par mois
            </motion.p>
            <motion.p
              className="text-white text-center max-w-xs mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <span className="bg-[#4ECDC4] text-black text-xs px-3 py-1 rounded-full font-medium inline-block mb-2">
                Actions disponibles dès aujourd'hui
              </span>
              <br />
              💡 Des solutions concrètes t'attendent. Clique pour les découvrir !
            </motion.p>
          </div>

          {/* View details button */}
          <motion.button
            className="backdrop-blur-sm text-black font-bold px-8 py-6 rounded-2xl flex flex-col items-center text-xl shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #4ECDC4 0%, #7DE3A0 100%)",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
              minWidth: "280px",
            }}
            onClick={showDetails}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            whileHover={{
              scale: 1.08,
              backgroundColor: "rgba(255, 255, 255, 1)",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
              y: -5,
            }}
            whileTap={{ scale: 0.95 }}
          >
            Voir comment économiser {data.potentialSavings} € <ExternalLink size={16} className="ml-2" />
            <span className="block text-xs font-normal mt-1">Offres immédiates et actions simples</span>
          </motion.button>
        </div>

        <div className="p-6 text-white z-10">
          <motion.p
            className="text-sm opacity-80"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            {getToneContent("tapToContinue")}
          </motion.p>
        </div>
      </motion.div>
    </Perspective>,
    // Insérer la nouvelle slide DetailedSavingsSlide à l'index 7 (après la slide des économies)
    // Dans le tableau slides, ajouter après la slide "savings-perspective" et avant "final-perspective":
    <Perspective key="detailed-savings-perspective">
      <DetailedSavingsSlide />
    </Perspective>,

    // Page partenaire
    <Perspective key="partner-perspective">
      <motion.div
        key="partnerPage"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0088b9 0%, #00b99b 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(7, direction)}
      >
        <motion.div
          className="p-6 pt-12 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white px-2 w-full">Offre partenaire</h2>
          <motion.p
            className="text-white text-xl px-2 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            La meilleure offre pour toi
          </motion.p>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 z-10">
          <motion.div
            className="w-full max-w-xs bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xs">SFR</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">SFR</h3>
              </div>
              <div className="bg-[#4ECDC4] text-black text-xs px-3 py-1 rounded-full">-40%</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#FFB347] flex items-center justify-center mr-3">
                  <span className="text-white font-bold">✓</span>
                </div>
                <p className="text-gray-700">100 Go de data 5G</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#FFB347] flex items-center justify-center mr-3">
                  <span className="text-white font-bold">✓</span>
                </div>
                <p className="text-gray-700">Appels & SMS illimités</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#FFB347] flex items-center justify-center mr-3">
                  <span className="text-white font-bold">✓</span>
                </div>
                <p className="text-gray-700">Sans engagement</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-500 text-sm line-through">29,99€/mois</p>
                <p className="text-3xl font-bold text-gray-800">
                  17,99€<span className="text-sm font-normal">/mois</span>
                </p>
              </div>
              <div className="bg-[#FFD166] text-black text-xs px-3 py-1 rounded-full font-medium">
                Économie: 12€/mois
              </div>
            </div>

            <motion.button
              className="w-full bg-[#4ECDC4] text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(78, 205, 196, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => goToConfirmation(e)}
            >
              Je change et j'économise 12€/mois
            </motion.button>
            {/* Nouveau lien "Voir d'autres options" */}
            <motion.button
              className="w-full mt-3 bg-slate-300 text-black font-medium py-2 px-4 rounded-lg border border-slate-400 hover:bg-slate-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                trackClick("autres-options", "prototype")
                setBypassAutoAdvance(true)
                setIsAnimating(true)
                setPreviousSlide(currentSlide)
                setDirection(1)
                setCurrentSlide(9) // Aller à la nouvelle slide des alternatives

                const animateProgress = () => {
                  const startTime = Date.now()
                  const duration = 1000
                  const animate = () => {
                    const elapsed = Date.now() - startTime
                    const newProgress = Math.min(100, (elapsed / duration) * 100)
                    progress.set(newProgress)

                    if (newProgress < 100) {
                      requestAnimationFrame(animate)
                    } else {
                      setTimeout(() => {
                        setIsAnimating(false)
                      }, 100)
                    }
                  }
                  requestAnimationFrame(animate)
                }
                animateProgress()
              }}
              whileHover={{ scale: 1.02, backgroundColor: "rgb(203 213 225)" }}
              whileTap={{ scale: 0.98 }}
            >
              Voir d'autres options
            </motion.button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Offre négociée via gYlt – Disponible maintenant</p>
              <p className="text-xs text-gray-500 underline mt-1 cursor-pointer">Voir les conditions</p>
              <p className="text-xs text-gray-700 mt-2 font-medium">Déjà 17 utilisateurs ont cliqué</p>
            </div>
          </motion.div>
        </div>

        <div className="p-6 text-white z-10">
          <motion.p
            className="text-sm opacity-80 text-center"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Tape pour continuer
          </motion.p>
        </div>
      </motion.div>
    </Perspective>,
    // Nouvelle slide des alternatives - index 9
    <Perspective key="alternatives-perspective">
      <motion.div
        key="alternativesPage"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0088b9 0%, #00b99b 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(7, direction)}
      >
        <motion.div
          className="p-6 pt-12 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white px-2 w-full">Autres offres disponibles</h2>
        </motion.div>

        <div className="flex-1 overflow-auto px-4 pb-4 z-10 hide-scrollbar">
          <div className="space-y-4">
            {/* Offre 1 - Forfait Énergie */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">ORG</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Orange</h3>
                </div>
                <div className="bg-[#4ECDC4] text-black text-xs px-3 py-1 rounded-full">-25%</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#FFB347] flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 text-sm">150 Go de data 5G</p>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#FFB347] flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 text-sm">Appels & SMS illimités</p>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#FFB347] flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 text-sm">Avec Engagement (25,99 après 1 an)</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-500 text-sm line-through">29.99€/mois</p>
                  <p className="text-2xl font-bold text-gray-800">
                    15.99€<span className="text-sm">/mois</span>
                  </p>
                </div>
                <div className="bg-[#FFD166] text-black text-xs px-2 py-1 rounded-full">-14€/mois</div>
              </div>

              <motion.button
                className="w-full bg-[#4ECDC4] text-black font-bold py-2 px-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation()
                  trackClick("choix-energie", "prototype")
                }}
              >
                Je choisis cette offre
              </motion.button>
            </motion.div>

            {/* Offre 2 - Assurance Auto */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">FRE</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Free</h3>
                </div>
                <div className="bg-[#4ECDC4] text-black text-xs px-3 py-1 rounded-full">-30%</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#FFB347] flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 text-sm">100 Go de data 4G/5G</p>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#FFB347] flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 text-sm">Appels & SMS illimités</p>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-[#FFB347] flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 text-sm">Sans engagement</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-500 text-sm line-through">29.99€/mois</p>
                  <p className="text-2xl font-bold text-gray-800">
                    18.99€<span className="text-sm">/mois</span>
                  </p>
                </div>
                <div className="bg-[#FFD166] text-black text-xs px-2 py-1 rounded-full">-11€/mois</div>
              </div>

              <motion.button
                className="w-full bg-[#4ECDC4] text-black font-bold py-2 px-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation()
                  trackClick("choix-assurance", "prototype")
                }}
              >
                Je choisis cette offre
              </motion.button>
            </motion.div>
          </div>
        </div>

        <div className="p-6 text-white z-10">
          <motion.p
            className="text-sm opacity-80 text-center"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Tape pour continuer
          </motion.p>
        </div>
      </motion.div>
    </Perspective>,
    // Page de confirmation et infos personnelles
    <Perspective key="confirmation-perspective">
      <motion.div
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0088b9 0%, #00b99b 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(7, direction)}
      >
        <motion.div
          className="p-6 pt-8 z-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white px-2 w-full">Finalisez votre changement en 1 minute</h2>
          <p className="text-white/70 mt-1">Toutes vos infos sont déjà pré-remplies.</p>
        </motion.div>

        <div className="flex-1 flex flex-col justify-start items-center p-4 z-10 overflow-auto hide-scrollbar">
          <motion.div
            className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl">👤</span>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                  <input
                    type="text"
                    defaultValue="Dupont"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl">👤</span>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Prénom</label>
                  <input
                    type="text"
                    defaultValue="Marie"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl">📍</span>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Adresse postale</label>
                  <input
                    type="text"
                    defaultValue="123 rue de Paris"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] mb-2"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      defaultValue="75001"
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                      placeholder="Code postal"
                    />
                    <input
                      type="text"
                      defaultValue="Paris"
                      className="w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                      placeholder="Ville"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl">📞</span>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Numéro de téléphone</label>
                  <input
                    type="tel"
                    defaultValue="06 12 34 56 78"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl">📧</span>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Adresse e-mail</label>
                  <input
                    type="email"
                    defaultValue="marie.dupont@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl">💳</span>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Moyen de paiement</label>
                  <div className="flex justify-between bg-gray-100 rounded-lg p-1 mb-3">
                    <button className="flex-1 py-2 px-3 rounded-md bg-white shadow-sm font-medium text-sm">
                      Carte bancaire
                    </button>
                    <button className="flex-1 py-2 px-3 rounded-md text-gray-700 font-medium text-sm">PayPal</button>
                  </div>
                  <input
                    type="text"
                    placeholder="IBAN ou scan de carte"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 flex items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-xl mr-3">🔒</span>
            <p className="text-white text-sm">
              Toutes vos données sont sécurisées et utilisées uniquement pour la souscription à cette offre.
            </p>
          </motion.div>

          <motion.div
            className="w-full max-w-sm flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              className="w-full bg-[#4ECDC4] text-black font-bold py-4 px-6 rounded-lg flex items-center justify-center text-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(78, 205, 196, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                trackClick("je-confirme", "prototype")
                setBypassAutoAdvance(true)
                setCurrentSlide(8) // Aller au formulaire de feedback après confirmation
              }}
            >
              Je confirme et je change
            </motion.button>
            <p className="text-white/70 text-sm mt-2 text-center">Sans engagement. Modifiable à tout moment.</p>
          </motion.div>
        </div>

        <motion.div
          className="p-4 text-white z-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm">Besoin d'aide ? Notre équipe peut finaliser avec vous.</p>
          <button className="text-[#FFD166] text-sm font-medium mt-1 underline">👉 Demander à être rappelé</button>
        </motion.div>

        <div className="absolute bottom-4 right-4 z-20 flex items-center">
          <div className="h-6 w-6 relative">
            <Image
              src="/images/gylt-logo.png"
              alt="GYLT Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center">
            <div className="w-[60px] relative ml-1">
              <Image
                src="/images/gylt-name.png"
                alt="GYLT"
                width={60}
                height={30}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Perspective>,
    // Formulaire de feedback
    <Perspective key="feedback-perspective">
      <motion.div
        key="feedbackForm"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFD166 0%, #FFCC70 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(7, direction)}
      >
        <motion.div
          className="p-6 pt-12 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white px-2 w-full">Ton avis nous intéresse</h2>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 z-10">
          <motion.div
            className="w-full max-w-xs bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tu cliques, tu notes, c’est tout</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">On ajuste gYlt grâce à toi</label>
              </div>

            <motion.button
              className="w-full bg-[#4ECDC4] text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(78, 205, 196, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                window.open(
                  "https://docs.google.com/forms/d/e/1FAIpQLScHZSn4CfSWs1SvFl7keAA-zOn-kcfUwzMzO4cKEhUNuiXC9w/viewform?usp=dialog",
                  "_blank"
                )
              }
            >
              Envoyer mon feedback
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="p-4 text-white z-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm opacity-80">Tape pour passer</p>
        </motion.div>

        <div className="absolute bottom-4 right-4 z-20 flex items-center">
          <div className="h-6 w-6 relative">
            <Image
              src="/images/gylt-logo.png"
              alt="GYLT Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center">
            <div className="w-[60px] relative ml-1">
              <Image
                src="/images/gylt-name.png"
                alt="GYLT"
                width={60}
                height={30}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Perspective>,
    // Final slide - Design avec motif géométrique et score central
    <Perspective key="final-perspective">
      <motion.div
        key="finalSlide"
        className="h-full w-full flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7DE3A0 0%, #4ECDC4 100%)",
          transformStyle: "preserve-3d",
        }}
        {...getSlideTransition(7, direction)}
      >
        {/* Motif géométrique en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 20 + i * 5,
                height: 100 + i * 10,
                borderRadius: "8px",
                background: `rgba(255, 255, 255, ${0.05 + i * 0.01})`,
                left: `${10 + i * 8}%`,
                top: "50%",
                transform: "translateY(-50%) rotate(30deg)",
              }}
              animate={{
                y: [0, i % 2 === 0 ? 20 : -20, 0],
                opacity: [0.1 + i * 0.02, 0.2 + i * 0.02, 0.1 + i * 0.02],
              }}
              transition={{
                duration: 5 + i,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <motion.div
          className="p-6 pt-12 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white px-2 w-full">Ton bilan</h2>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center p-6 z-10">
          {/* GYLT Score avec compteur animé et jauge semi-circulaire */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xl font-medium text-white mb-4">Score GYLT</p>

            {/* Jauge semi-circulaire */}
            <div className="relative w-48 h-24 mx-auto mb-4">
              {/* Fond de la jauge */}
              <div className="absolute w-full h-full rounded-t-full border-8 border-white/30 border-b-0"></div>

              {/* Jauge qui se remplit */}
              <motion.div
                className="absolute w-full h-full rounded-t-full border-8 border-white border-b-0 origin-bottom"
                initial={{ scaleX: 0, scaleY: 0 }}
                animate={{ scaleX: data.gyltScore / 100, scaleY: data.gyltScore / 100 }}
                transition={{
                  delay: 0.5,
                  duration: 2,
                  type: "spring",
                  stiffness: 50,
                  damping: 15,
                }}
              ></motion.div>

              {/* Cercle central avec le score */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-36 -mb-16">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#7DE3A0] to-[#4ECDC4] flex items-center justify-center border-8 border-white shadow-lg">
                  <motion.span
                    className="text-5xl font-extrabold text-white"
                    initial={{ opacity: 1 }}
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(255, 255, 255, 0)",
                        "0 0 10px rgba(255, 255, 255, 0.8)",
                        "0 0 0px rgba(255, 255, 255, 0)",
                      ],
                    }}
                    transition={{
                      textShadow: {
                        duration: 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                        delay: 2.5,
                      },
                    }}
                  >
                    <AnimatedCounter value={data.gyltScore} duration={2} delay={0.5} />
                  </motion.span>
                </div>

                {/* Badge trophée */}
                <motion.div
                  className="absolute -top-2 -right-2 bg-[#FFD166] rounded-full w-12 h-12 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 2.5,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: 15,
                    boxShadow: "0 0 20px rgba(255, 209, 102, 0.9)",
                  }}
                >
                  <Award className="text-black w-6 h-6" />
                </motion.div>
              </div>
            </div>

            <motion.p
              className="text-white mt-16 text-center max-w-xs mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.7 }}
            >
              Basé sur ton équilibre, évolution et potentiel d'économies
            </motion.p>
          </motion.div>

          {/* Next month goal */}
          <motion.div
            className="mb-8 backdrop-blur-sm border border-white/10 rounded-lg p-6 w-full max-w-xs"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.1)",
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
              borderColor: "white",
            }}
          >
            <div className="flex items-start mb-2">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
              >
                <TrendingUp className="text-white mr-3 mt-1" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">{getToneContent("nextGoal")}</h3>
                <p className="text-white text-lg">{data.nextMonthGoal}</p>
              </div>
            </div>
            <p className="text-white opacity-80 text-sm mt-2">
              {toneChoice === "roast"
                ? "On se retrouve dans 30 jours pour voir si tu as réussi"
                : "Reviens dans 30 jours pour ton prochain GYLT Wrapped"}
            </p>
          </motion.div>

          {/* Share button */}
          <motion.button
            className="backdrop-blur-sm text-black font-bold py-3 px-6 rounded-full flex items-center"
            style={{
              background: "linear-gradient(135deg, #FFD166 0%, #FFB347 100%)",
              boxShadow: "0 10px 30px rgba(255, 209, 102, 0.3)",
            }}
            onClick={handleShare}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{
              scale: 1.08,
              boxShadow: "0 15px 40px rgba(255, 209, 102, 0.5)",
              y: -5,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={18} className="mr-2" />
            Partager mon Wrapped
          </motion.button>
        </div>

        <div className="absolute bottom-4 right-4 z-20 flex items-center">
          <div className="h-6 w-6 relative">
            <Image
              src="/images/gylt-logo.png"
              alt="GYLT Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center">
            <div className="w-[60px] relative ml-1">
              <Image
                src="/images/gylt-name.png"
                alt="GYLT"
                width={60}
                height={30}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Perspective>,
  ]

  if (!imagesLoaded) {
    return (
      <div
        className="h-screen w-full max-w-md mx-auto flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FFB347 0%, #FFCC70 100%)" }}
      >
        {/* Éléments décoratifs */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-30 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255, 153, 102, 0.4) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(125, 227, 160, 0.4) 0%, transparent 40%)",
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <motion.div
          className="flex flex-col items-center z-10"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <motion.div
            className="w-16 h-16 relative mb-4"
            animate={{
              rotate: [0, 10, 0, -10, 0],
              filter: [
                "drop-shadow(0 0 0px rgba(125, 227, 160, 0))",
                "drop-shadow(0 0 15px rgba(125, 227, 160, 0.8))",
                "drop-shadow(0 0 0px rgba(125, 227, 160, 0))",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Image src="/images/gylt-logo.png" alt="GYLT Logo" fill className="object-contain" priority />
          </motion.div>
          <p className="text-white text-xl">Chargement...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="h-screen w-full max-w-md mx-auto overflow-hidden bg-black relative"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const width = rect.width

        // Si le clic est dans le quart gauche de l'écran
        if (x < width * 0.25) {
          if (currentSlide > 0) {
            e.stopPropagation()
            prevSlide(e)
          }
        } else {
          // Sinon, avancer
          nextSlide()
        }
      }}
    >
      {/* Back button */}
      {currentSlide > 0 && !showShareOptions && (
        <motion.button
          className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-sm rounded-full p-2"
          onClick={prevSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.15, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={20} className="text-white" />
        </motion.button>
      )}

      {/* Particle effect during transitions */}
      <ParticleEffect active={isAnimating} />

      {/* Content */}
      <div className="h-full w-full overflow-hidden" ref={containerRef}>
        <AnimatePresence mode="wait">{showShareOptions ? <ShareOptionsModal /> : slides[currentSlide]}</AnimatePresence>
        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* GYLT branding */}
      {currentSlide > 0 && currentSlide < 7 && !showShareOptions && currentSlide !== 1 && (
        <BrandFooter
          color={currentSlide === 5 || currentSlide === 6 ? "white" : "black"}
          useBrightLogo={currentSlide === 2 || currentSlide === 5}
        />
      )}

      {/* Instagram-style progress indicator */}
      {!showShareOptions && (
        <div className="absolute top-2 left-2 right-2 flex justify-between gap-1 z-30 px-2 pt-1">
          {[...Array(totalSlides)].map((_, i) => (
            <motion.div
              key={i}
              className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                if (!isAnimating && imagesLoaded) {
                  // Si on est sur la slide de choix de ton et qu'aucun choix n'a été fait
                  if (i > 1 && currentSlide === 1 && toneChoice === null) {
                    return
                  }
                  setIsAnimating(true)
                  setPreviousSlide(currentSlide)
                  setDirection(i > currentSlide ? 1 : -1)
                  setCurrentSlide(i)

                  // Animation de progression
                  const animateProgress = () => {
                    const startTime = Date.now()
                    const duration = 1000
                    const animate = () => {
                      const elapsed = Date.now() - startTime
                      const newProgress = Math.min(100, (elapsed / duration) * 100)
                      progress.set(newProgress)

                      if (newProgress < 100) {
                        requestAnimationFrame(animate)
                      } else {
                        setTimeout(() => {
                          setIsAnimating(false)
                        }, 100)
                      }
                    }
                    requestAnimationFrame(animate)
                  }

                  animateProgress()
                }
              }}
            >
              {i === currentSlide && (
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: i === 1 && toneChoice === null ? 0 : 5,
                    ease: "linear",
                  }}
                />
              )}
              {i < currentSlide && <div className="h-full bg-white w-full" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
