import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { config } from "../config";
import { gsap } from "gsap";
import "./Certifications.css";

type Category = "all" | "dev" | "ai_cloud" | "hackathon" | "security_other";

const vf = 7;
const e_ = 3;
const ug = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1, x: 0, y: 0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 }
];

function getResponsiveMultiplier(width: number): number {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1;
}

function getHeightMultiplier(width: number): number {
  let a;
  if (width < 480) {
    a = 22 * 16;
  } else if (width < 640) {
    a = 26 * 16;
  } else if (width < 768) {
    a = 28 * 16;
  } else if (width < 1024) {
    a = 34 * 16;
  } else {
    a = 38 * 16;
  }
  const c = window.innerHeight * 0.7;
  return c >= a ? 1 : c / a;
}

function getSlotConfig(v: number, a: number) {
  if (v >= vf) return ug[a];
  const c = v >> 1;
  const i = v > 1 ? (a - c) / c : 0;
  const r = Math.abs(i);
  return {
    rot: i * 21,
    scale: 1 - 0.2244 * r * r,
    x: i * 30,
    y: r * r * 7.3,
    zIndex: 10 - Math.abs(a - c)
  };
}

const getIssuerColorClass = (issuer: string) => {
  const name = issuer.toLowerCase();
  if (name.includes("hackerrank")) return "issuer-hackerrank";
  if (name.includes("microsoft") || name.includes("azure")) return "issuer-microsoft";
  if (name.includes("aws") || name.includes("amazon")) return "issuer-aws";
  if (name.includes("hp life") || name.includes("hp")) return "issuer-hp";
  if (name.includes("linkedin")) return "issuer-linkedin";
  if (name.includes("scaler")) return "issuer-scaler";
  if (name.includes("infosys")) return "issuer-infosys";
  if (name.includes("coursera") || name.includes("google")) return "issuer-google";
  return "issuer-default";
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "dev":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cat-svg">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      );
    case "ai_cloud":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cat-svg">
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
      );
    case "hackathon":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cat-svg">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
          <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z"></path>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cat-svg">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      );
  }
};

const Certifications = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const directionRef = useRef<"left" | "right" | null>(null);
  const prevActiveCardIndices = useRef<Set<number>>(new Set());

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Certifications" },
    { id: "dev", label: "Software Development" },
    { id: "ai_cloud", label: "AI & Cloud" },
    { id: "hackathon", label: "Hackathons & Competitions" },
    { id: "security_other", label: "Security & Professional" },
  ];

  const filteredCertifications = selectedCategory === "all"
    ? config.certifications
    : config.certifications.filter(cert => cert.category === selectedCategory);

  const h = filteredCertifications.length;
  const isCarousel = h > vf;

  const [activeIdx, setActiveIdx] = useState(isCarousel ? e_ : h >> 1);

  // Reset active index and transitions when list content changes
  useEffect(() => {
    setActiveIdx(isCarousel ? e_ : h >> 1);
    hasEnteredRef.current = false;
    isAnimatingRef.current = false;
    directionRef.current = null;
    prevActiveCardIndices.current = new Set();
  }, [selectedCategory, h, isCarousel]);

  const getActiveSlots = useCallback((activeIndex: number) => {
    const slotsMap = new Map<number, number>();
    if (!isCarousel) {
      filteredCertifications.forEach((_, idx) => slotsMap.set(idx, idx));
      return slotsMap;
    }
    for (let slotIdx = 0; slotIdx < vf; slotIdx++) {
      const cardIdx = ((activeIndex + slotIdx - e_) % h + h) % h;
      slotsMap.set(cardIdx, slotIdx);
    }
    return slotsMap;
  }, [h, isCarousel, filteredCertifications]);

  const handleNavigate = useCallback((dir: "left" | "right") => {
    if (isAnimatingRef.current || !isCarousel) return;
    isAnimatingRef.current = true;
    directionRef.current = dir;
    setActiveIdx(prev => (dir === "right" ? (prev + 1) % h : (prev - 1 + h) % h));
  }, [h, isCarousel]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !h) return;

    const cardElements = Array.from(container.querySelectorAll(".fan-card"));
    if (!cardElements.length) return;

    const activeSlots = getActiveSlots(activeIdx);
    const prevSlots = prevActiveCardIndices.current;
    const direction = directionRef.current;
    const isInitial = !hasEnteredRef.current;

    const multiplierW = getResponsiveMultiplier(window.innerWidth);
    const multiplierH = getHeightMultiplier(window.innerWidth);

    const totalSlots = isCarousel ? vf : h;
    const getSlot = (slotIdx: number) => getSlotConfig(totalSlots, slotIdx);

    if (isInitial) {
      isAnimatingRef.current = true;
    }

    let completedCount = 0;
    const totalToAnimate = activeSlots.size;
    const onCardDone = () => {
      completedCount++;
      if (completedCount >= totalToAnimate) {
        isAnimatingRef.current = false;
        if (isInitial) {
          hasEnteredRef.current = true;
        }
      }
    };

    cardElements.forEach((el, cardIdx) => {
      const slotIdx = activeSlots.get(cardIdx);
      const wasVisible = prevSlots.has(cardIdx);

      if (slotIdx !== undefined) {
        const { x, y, rot, scale, zIndex } = getSlot(slotIdx);
        const targetVars = {
          x: `${x * multiplierW}rem`,
          y: `${y * multiplierH}rem`,
          rotation: rot,
          scale: scale,
          opacity: 1,
          zIndex: zIndex
        };

        if (isInitial) {
          gsap.set(el, {
            x: 0,
            y: `${12 * multiplierH}rem`,
            rotation: 0,
            scale: 0.5,
            opacity: 0
          });
          gsap.to(el, {
            ...targetVars,
            duration: 1.2,
            ease: "elastic.out(1.05, 0.78)",
            delay: 0.2 + slotIdx * 0.06,
            onComplete: onCardDone
          });
        } else if (wasVisible) {
          gsap.to(el, {
            ...targetVars,
            duration: 0.5,
            ease: "power2.out",
            onComplete: onCardDone
          });
        } else {
          const startXValue = direction === "right" ? 40 : -40;
          gsap.set(el, {
            x: `${startXValue}rem`,
            y: `${y * multiplierH}rem`,
            rotation: direction === "right" ? 30 : -30,
            scale: 0.5,
            opacity: 0
          });
          gsap.to(el, {
            ...targetVars,
            duration: 0.6,
            ease: "power2.out",
            onComplete: onCardDone
          });
        }
      } else if (wasVisible) {
        const targetXValue = direction === "right" ? -40 : 40;
        gsap.to(el, {
          x: `${targetXValue}rem`,
          opacity: 0,
          scale: 0.5,
          rotation: direction === "right" ? -30 : 30,
          duration: 0.4,
          ease: "power2.in",
          zIndex: 0
        });
      } else {
        gsap.set(el, {
          opacity: 0,
          scale: 0.3,
          x: 0,
          y: 0,
          zIndex: 0
        });
      }
    });

    prevActiveCardIndices.current = new Set(activeSlots.keys());

    const activeElements: { el: Element; slot: number }[] = [];
    cardElements.forEach((el, cardIdx) => {
      const slotIdx = activeSlots.get(cardIdx);
      if (slotIdx !== undefined) {
        activeElements.push({ el, slot: slotIdx });
      }
    });

    activeElements.sort((a, b) => a.slot - b.slot);

    let activeHoverSlot: number | null = null;
    let leaveTimeout: any = null;
    const numActive = activeElements.length;
    const centerSlotIdx = numActive >> 1;

    const updateHoverLayout = (hoveredSlot: number | null) => {
      const multW = getResponsiveMultiplier(window.innerWidth);
      const multH = getHeightMultiplier(window.innerWidth);

      activeElements.forEach(({ el: cardEl, slot }) => {
        const slotConf = getSlot(slot);
        let posX = slotConf.x * multW;
        let posY = slotConf.y * multH;
        let rotDeg = slotConf.rot;
        let scaleVal = slotConf.scale;
        let delayVal = 0;

        const isHovered = slot === hoveredSlot;

        if (hoveredSlot !== null) {
          const diff = Math.abs(slot - hoveredSlot);
          delayVal = diff * 0.02;

          if (isHovered) {
            posY -= 2.5 * multH;
            scaleVal *= 1.08;
          } else {
            const scaleFactor = centerSlotIdx > 0 ? (slot - centerSlotIdx) / centerSlotIdx : 0;
            const spreadOffset = 8 * (1 - Math.abs(scaleFactor)) * (1 + 0.2 * Math.max(0, 3 - diff));

            if (slot < hoveredSlot) {
              posX -= spreadOffset * multW;
              rotDeg -= 3 / (diff + 1);
            } else {
              posX += spreadOffset * multW;
              rotDeg += 3 / (diff + 1);
            }

            if (slot === activeElements.length - 1 && hoveredSlot < centerSlotIdx) {
              posY -= 1 * multH;
            }
            if (slot === 0 && hoveredSlot > centerSlotIdx) {
              posY -= 1 * multH;
            }
          }
        } else {
          delayVal = Math.abs(slot - centerSlotIdx) * 0.02;
        }

        gsap.to(cardEl, {
          x: `${posX}rem`,
          y: `${posY}rem`,
          rotation: rotDeg,
          scale: scaleVal,
          duration: 0.5,
          delay: delayVal,
          ease: "elastic.out(1, 0.75)",
          overwrite: "auto"
        });

        gsap.set(cardEl, { zIndex: isHovered ? 50 : slotConf.zIndex });
      });
    };

    const mouseListeners = activeElements.map(({ el: cardEl, slot }) => {
      const handleMouseEnter = () => {
        if (isAnimatingRef.current) return;
        if (leaveTimeout) {
          clearTimeout(leaveTimeout);
          leaveTimeout = null;
        }
        if (activeHoverSlot !== slot) {
          activeHoverSlot = slot;
          updateHoverLayout(slot);
        }
      };
      cardEl.addEventListener("mouseenter", handleMouseEnter);
      return { el: cardEl, handler: handleMouseEnter };
    });

    const handleMouseLeave = () => {
      if (isAnimatingRef.current) return;
      if (leaveTimeout) clearTimeout(leaveTimeout);
      leaveTimeout = setTimeout(() => {
        activeHoverSlot = null;
        updateHoverLayout(null);
      }, 50);
    };

    container.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (isAnimatingRef.current) return;
      updateHoverLayout(activeHoverSlot);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mouseListeners.forEach(({ el: cardEl, handler }) => cardEl.removeEventListener("mouseenter", handler));
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      if (leaveTimeout) clearTimeout(leaveTimeout);
    };
  }, [activeIdx, h, getActiveSlots, isCarousel, filteredCertifications]);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const renderChevron = (dir: "left" | "right") => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
      <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}></polyline>
    </svg>
  );

  return (
    <div className="certifications-page">
      <div className="certifications-header">
        <Link to="/" className="back-button" data-cursor="disable">
          ← Back to Home
        </Link>
        <h1>
          My <span>Certifications</span>
        </h1>
        <p>A categorized collection of my credentials, course completions, and hackathon achievements</p>
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`tab-btn ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.id as Category)}
            data-cursor="disable"
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="carousel-wrapper">
        <div ref={containerRef} className="fan-layout">
          {filteredCertifications.map((cert, index) => {
            const issuerClass = getIssuerColorClass(cert.issuer);
            const isCopyActive = copiedId === cert.credentialId;

            return (
              <div className={`fan-card ${issuerClass}`} key={index} data-cursor="disable">
                <div className="card-glow-layer"></div>
                <div className="cert-card-header">
                  <span className="cert-badge">{cert.issuer}</span>
                  <span className="cert-date">{cert.date}</span>
                </div>

                <div className="cert-card-body">
                  <div className="cat-icon-container">
                    {getCategoryIcon(cert.category)}
                  </div>
                  <h3>{cert.title}</h3>

                  {cert.credentialId && (
                    <div
                      className={`credential-id-badge ${isCopyActive ? "copied" : ""}`}
                      onClick={(e) => handleCopyId(e, cert.credentialId!)}
                      title="Click to copy Credential ID"
                    >
                      <span className="id-label">ID:</span>
                      <span className="id-value">{cert.credentialId}</span>
                      <span className="copy-action-text">{isCopyActive ? "Copied!" : "Copy"}</span>
                    </div>
                  )}
                </div>

                {cert.skills && cert.skills.length > 0 && (
                  <div className="cert-card-footer">
                    <div className="cert-skills">
                      {cert.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isCarousel && (
        <div className="carousel-controls">
          <button
            className="carousel-control-btn"
            onClick={() => handleNavigate("left")}
            aria-label="Previous"
            data-cursor="disable"
          >
            {renderChevron("left")}
          </button>
          <div className="carousel-dots">
            {filteredCertifications.map((_, index) => (
              <span
                key={index}
                className={`carousel-dot ${index === activeIdx ? "active" : ""}`}
              ></span>
            ))}
          </div>
          <button
            className="carousel-control-btn"
            onClick={() => handleNavigate("right")}
            aria-label="Next"
            data-cursor="disable"
          >
            {renderChevron("right")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Certifications;
