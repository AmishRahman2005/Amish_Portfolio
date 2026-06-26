import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { config } from "../config";
import "./MyWorks.css";

// Interface for project elements
interface Project {
  id: number;
  title: string;
  category: string;
  technologies: string;
  image: string;
  description: string;
  github?: string;
  demo?: string;
}

// FlipCard component handles 3D card flipping and glassmorphism styling
const FlipCard = ({
  project,
  index,
  target,
}: {
  project: Project;
  index: number;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="myworks-card-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 22,
        mass: 0.8,
      }}
    >
      <motion.div
        className="myworks-card-inner"
        animate={{ rotateY: isHovered ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 22 }}
      >
        {/* Card Front: Project Image & Title */}
        <div
          className="myworks-card-front"
          style={{ pointerEvents: isHovered ? "none" : "auto" }}
        >
          <div className="myworks-card-number">0{index + 1}</div>
          <img src={project.image} alt={project.title} className="myworks-card-img" />
          <div className="myworks-card-front-overlay">
            <div className="myworks-card-front-title-container">
              <h3>{project.title}</h3>
              <p>{project.category}</p>
            </div>
            <span className="myworks-flip-badge">Hover to Flip</span>
          </div>
        </div>

        {/* Card Back: Glassmorphic Details & Links */}
        <div
          className="myworks-card-back"
          style={{ pointerEvents: isHovered ? "auto" : "none" }}
        >
          <div className="myworks-card-back-content">
            <h4>{project.title}</h4>
            <p className="myworks-back-category">{project.category}</p>
            <p className="myworks-back-desc">{project.description}</p>
            <div className="myworks-back-tech">
              {project.technologies.split(",").slice(0, 3).map((tech, idx) => (
                <span key={idx} className="tech-pill">{tech.trim()}</span>
              ))}
            </div>
            <div className="myworks-card-links">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link github-link"
                  data-cursor="disable"
                >
                  GitHub
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link demo-link"
                  data-cursor="disable"
                >
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MyWorks = () => {
  const [phase, setPhase] = useState<"scatter" | "line" | "circle" | "arc">("scatter");
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalScrollRange = 3000;
  const scrollProgress = useMotionValue(0);
  const scrollRef = useRef(0);

  // Smooth springs for scroll mappings
  const transitionVal = useTransform(scrollProgress, [0, 600], [0, 1]);
  const rotationVal = useTransform(scrollProgress, [600, 3000], [0, 360]);
  const mouseInput = useMotionValue(0);

  const transitionSpring = useSpring(transitionVal, { stiffness: 80, damping: 25 });
  const rotationSpring = useSpring(rotationVal, { stiffness: 80, damping: 25 });
  const mouseSpring = useSpring(mouseInput, { stiffness: 50, damping: 25 });

  // Subscription state values for layout math
  const [transitionState, setTransitionState] = useState(0);
  const [rotationState, setRotationState] = useState(0);
  const [mouseXOffset, setMouseXOffset] = useState(0);

  useEffect(() => {
    const unsubTransition = transitionSpring.on("change", setTransitionState);
    const unsubRotation = rotationSpring.on("change", setRotationState);
    const unsubMouse = mouseSpring.on("change", setMouseXOffset);
    return () => {
      unsubTransition();
      unsubRotation();
      unsubMouse();
    };
  }, [transitionSpring, rotationSpring, mouseSpring]);

  // Touch and wheel capture to drive programmatic scrollProgress
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const nextScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), totalScrollRange);
      scrollRef.current = nextScroll;
      scrollProgress.set(nextScroll);
    };

    let startTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const currentTouchY = e.touches[0].clientY;
      const deltaY = (startTouchY - currentTouchY) * 2; // Touch scroll sensitivity
      startTouchY = currentTouchY;
      const nextScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), totalScrollRange);
      scrollRef.current = nextScroll;
      scrollProgress.set(nextScroll);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [scrollProgress]);

  // Parallax mouse movements
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const val = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseInput.set(val * 100);
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseInput]);

  // Visual phase changes on load
  useEffect(() => {
    const lineTimer = setTimeout(() => setPhase("line"), 500);
    const circleTimer = setTimeout(() => setPhase("circle"), 2500);
    return () => {
      clearTimeout(lineTimer);
      clearTimeout(circleTimer);
    };
  }, []);

  // Precomputed scatter offsets to prevent re-generation issues
  const scatterOffsets = useMemo(() => {
    return config.projects.map(() => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 800,
      rotation: (Math.random() - 0.5) * 120,
      scale: 0.6,
      opacity: 0,
    }));
  }, []);

  const totalProjects = config.projects.length;
  const isMobile = dimensions.width < 768;

  // Header fade-in values
  const headerOpacity = useTransform(transitionSpring, [0.8, 1], [0, 1]);
  const headerTranslateY = useTransform(transitionSpring, [0.8, 1], [20, 0]);

  const [headerOpState, setHeaderOpState] = useState(0);
  const [headerYState, setHeaderYState] = useState(20);

  useEffect(() => {
    const unsubOp = headerOpacity.on("change", setHeaderOpState);
    const unsubY = headerTranslateY.on("change", setHeaderYState);
    return () => {
      unsubOp();
      unsubY();
    };
  }, [headerOpacity, headerTranslateY]);

  // Helper linear interpolation function
  const lerp = (start: number, end: number, amt: number) => {
    return start * (1 - amt) + end * amt;
  };

  return (
    <div className="myworks-page" ref={containerRef}>
      {/* Immersive Background */}
      <div className="myworks-bg-glow"></div>

      {/* Dynamic Header */}
      <motion.div
        className="myworks-header-nav"
        style={{ opacity: headerOpState, y: headerYState }}
      >
        <Link to="/" className="back-button-nav" data-cursor="disable">
          ← Back to Home
        </Link>
        <h1>
          All <span>Works</span>
        </h1>
        <p>Hover to flip a project card, or scroll to rotate the fan.</p>
      </motion.div>

      {/* Scroll indicator & text helper */}
      <AnimatePresence>
        {phase === "circle" && transitionState < 0.5 && (
          <div className="myworks-center-text-wrapper">
            <motion.div
              className="myworks-center-text"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1 - transitionState * 2, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2>The future is built on code.</h2>
              <p>SCROLL TO EXPLORE</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Animation Viewport Container */}
      <div className="myworks-canvas-container">
        {config.projects.map((project, idx) => {
          let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

          if (phase === "scatter") {
            target = scatterOffsets[idx];
          } else if (phase === "line") {
            const step = isMobile ? 65 : 120;
            const lineSpan = totalProjects * step;
            target = {
              x: idx * step - lineSpan / 2 + step / 2,
              y: 0,
              rotation: 0,
              scale: isMobile ? 0.75 : 0.85,
              opacity: 1,
            };
          } else {
            // Circle parameters
            const minDim = Math.min(dimensions.width, dimensions.height);
            const circleRadius = Math.min(minDim * 0.32, 280);
            const degree = (idx / totalProjects) * 360;
            const radian = (degree * Math.PI) / 180;
            const circleTarget = {
              x: Math.cos(radian) * circleRadius,
              y: Math.sin(radian) * circleRadius,
              rotation: degree + 90,
            };

            // Arc fanned layout parameters
            const arcRadius = Math.min(dimensions.width, dimensions.height * 1.5) * (isMobile ? 1.3 : 1.0);
            const arcCenterY = dimensions.height * (isMobile ? 0.28 : 0.18) + arcRadius;
            const arcSpanAngle = isMobile ? 90 : 120;
            const startAngle = -90 - arcSpanAngle / 2;
            const stepAngle = arcSpanAngle / (totalProjects - 1);

            // Active rotation sweep matching scroll progression
            const rotationPercent = Math.min(Math.max(rotationState / 360, 0), 1);
            const scrollSweep = -rotationPercent * (arcSpanAngle * 0.75);

            const cardAngle = startAngle + idx * stepAngle + scrollSweep;
            const cardRadian = (cardAngle * Math.PI) / 180;
            const arcTarget = {
              x: Math.cos(cardRadian) * arcRadius + mouseXOffset,
              y: Math.sin(cardRadian) * arcRadius + arcCenterY,
              rotation: cardAngle + 90,
              scale: isMobile ? 1.0 : 1.25,
            };

            // Lerp coordinates based on scroll progress (transitionState) between Circle & Arc
            target = {
              x: lerp(circleTarget.x, arcTarget.x, transitionState),
              y: lerp(circleTarget.y, arcTarget.y, transitionState),
              rotation: lerp(circleTarget.rotation, arcTarget.rotation, transitionState),
              scale: lerp(isMobile ? 0.75 : 0.85, arcTarget.scale, transitionState),
              opacity: 1,
            };
          }

          return (
            <FlipCard
              key={project.id}
              project={project}
              index={idx}
              target={target}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MyWorks;
