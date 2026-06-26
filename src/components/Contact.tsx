import { useState, useRef, FormEvent } from "react";
import { MdArrowOutward, MdCopyright, MdCheckCircle, MdError, MdSend } from "react-icons/md";
import "./styles/Contact.css";
import { config } from "../config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import emailjs from "@emailjs/browser";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "setup_warning">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const [leetcodeStats, setLeetcodeStats] = useState<{
    solvedProblem: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  } | null>(null);

  useEffect(() => {
    fetch("https://alfa-leetcode-api.onrender.com/AmishRahman/solved?t=" + Date.now(), {
      cache: "no-store"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setLeetcodeStats({
          solvedProblem: data.solvedProblem || 104,
          easySolved: data.easySolved || 82,
          mediumSolved: data.mediumSolved || 22,
          hardSolved: data.hardSolved || 0,
        });
      })
      .catch((err) => {
        console.error("Error fetching LeetCode stats:", err);
        // Fallback to static data from resume
        setLeetcodeStats({
          solvedProblem: 104,
          easySolved: 82,
          mediumSolved: 22,
          hardSolved: 0,
        });
      });
  }, []);

  useEffect(() => {
    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        end: "bottom center",
        toggleActions: "play none none none",
      },
    });

    // Animate grid elements from bottom
    contactTimeline.fromTo(
      ".contact-form-column, .contact-info-column",
      {
        opacity: 0,
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      }
    );

    return () => {
      contactTimeline.kill();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus("sending");

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Check if EmailJS environment variables are configured
    const isConfigured = 
      serviceId && serviceId !== "your_emailjs_service_id" &&
      templateId && templateId !== "your_emailjs_template_id" &&
      publicKey && publicKey !== "your_emailjs_public_key";

    if (!isConfigured) {
      console.warn("EmailJS credentials are not configured in your .env file. Simulating success state...");
      // Simulate API delay
      setTimeout(() => {
        setStatus("setup_warning");
        setName("");
        setEmail("");
        setMessage("");
      }, 1500);
      return;
    }

    try {
      await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current!,
        publicKey
      );
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("EmailJS Error:", err);
      setStatus("error");
    }
  };

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <div className="contact-main-grid">
          
          {/* Left Column: Form */}
          <div className="contact-form-column">
            <h3 className="contact-form-title">Get In Touch</h3>
            <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
              <div className="contact-input-group">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="contact-input"
                  placeholder="Your Name"
                  required
                  data-cursor="disable"
                />
              </div>

              <div className="contact-input-group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="contact-input"
                  placeholder="Your Email Address"
                  required
                  data-cursor="disable"
                />
              </div>

              <div className="contact-input-group">
                <textarea
                  name="message"
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="contact-textarea"
                  placeholder="Type your message here..."
                  rows={5}
                  required
                  data-cursor="disable"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className={`contact-submit-btn ${status === "sending" ? "loading" : ""}`}
                data-cursor="disable"
              >
                {status === "sending" ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    Send Message <MdSend className="send-icon" />
                  </>
                )}
              </button>

              {status === "success" && (
                <div className="contact-status success">
                  <MdCheckCircle className="status-icon" />
                  <p>Message sent successfully!</p>
                </div>
              )}

              {status === "setup_warning" && (
                <div className="contact-status success warning">
                  <MdCheckCircle className="status-icon" />
                  <p>Demo Mode: Message simulated successfully! (Configure `.env` to receive emails)</p>
                </div>
              )}

              {status === "error" && (
                <div className="contact-status error">
                  <MdError className="status-icon" />
                  <p>Failed to send message. Please try again.</p>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Info */}
          <div className="contact-info-column">
            <h3 className="contact-info-title">{config.developer.fullName}</h3>
            <div className="contact-info-subgrid">
              <div className="contact-box">
                <h4>Email</h4>
                <p>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.contact.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="disable"
                  >
                    {config.contact.email}
                  </a>
                </p>
                <h4>Location</h4>
                <p>
                  <span>{config.social.location}</span>
                </p>
              </div>
              <div className="contact-box">
                <h4>Social</h4>
                <a
                  href={config.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                  className="contact-social"
                >
                  Github <MdArrowOutward />
                </a>
                <a
                  href={config.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                  className="contact-social"
                >
                  Linkedin <MdArrowOutward />
                </a>
                <a
                  href={config.contact.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                  className="contact-social"
                >
                  Leetcode <MdArrowOutward />
                </a>
              </div>
              
              <a 
                href={config.contact.leetcode} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-box leetcode-card"
                data-cursor="disable"
              >
                <h4>LeetCode Stats</h4>
                <div className="leetcode-stats-container">
                  <div className="leetcode-circle-progress">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <defs>
                        <linearGradient id="leetcode-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c2a4ff" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <path
                        className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle-progress"
                        strokeDasharray={`${leetcodeStats ? Math.min(100, (leetcodeStats.solvedProblem / 300) * 100) : 0}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="leetcode-percentage">
                      <span className="solved-count">{leetcodeStats ? leetcodeStats.solvedProblem : "--"}</span>
                      <span className="solved-label">Solved</span>
                    </div>
                  </div>
                  <div className="leetcode-details-grid">
                    <div className="leetcode-stat-row easy">
                      <span className="dot"></span>
                      <span className="label">Easy</span>
                      <span className="value">{leetcodeStats ? leetcodeStats.easySolved : "--"}</span>
                    </div>
                    <div className="leetcode-stat-row medium">
                      <span className="dot"></span>
                      <span className="label">Medium</span>
                      <span className="value">{leetcodeStats ? leetcodeStats.mediumSolved : "--"}</span>
                    </div>
                    <div className="leetcode-stat-row hard">
                      <span className="dot"></span>
                      <span className="label">Hard</span>
                      <span className="value">{leetcodeStats ? leetcodeStats.hardSolved : "--"}</span>
                    </div>
                  </div>
                </div>
              </a>

              <div className="contact-box">
                <h2>
                  Designed and Developed <br /> by <span>{config.developer.fullName}</span>
                </h2>
                <h5>
                  <MdCopyright /> {new Date().getFullYear()}
                </h5>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
