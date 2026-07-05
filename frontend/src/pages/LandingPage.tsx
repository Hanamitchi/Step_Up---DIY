import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal/LoginModal";
import "./LandingPage.css";

type Feature = {
  title: string;
  description: string;
  icon: JSX.Element;
};

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#d9b54a",
  strokeWidth: 1.8
};

const FEATURES: Feature[] = [
  {
    title: "Headlines & Messages",
    description: "Drop in the words that matter — names, dates, a note to the people you're inviting.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    )
  },
  {
    title: "Photos & Galleries",
    description: "Upload the photo that started it all, or a full gallery for guests to scroll through.",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M21 17l-6-5-4 3-3-2-4 3" />
      </svg>
    )
  },
  {
    title: "Countdown Timers",
    description: "A live clock ticking down to the moment itself — no plugins, just a real timer.",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l3 2M9 2h6" />
      </svg>
    )
  },
  {
    title: "RSVP Buttons",
    description: "One tap for guests to confirm they're coming — you see the replies as they land.",
    icon: (
      <svg {...iconProps}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )
  },
  {
    title: "Celebration Effects",
    description: "Confetti, sparkle, gentle motion on scroll — the small touches that make it feel alive.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 20l3-9 9-3-3 9-9 3z" />
        <path d="M15 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
      </svg>
    )
  },
  {
    title: "Your Own Theme",
    description: "Pick colors and fonts that feel like you, or start from a theme already built for the occasion.",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 000 18" />
      </svg>
    )
  }
];

const STEPS = [
  {
    number: "01",
    title: "Design",
    description: "Drag text, photos, timers and effects onto a blank canvas until it looks like your moment."
  },
  {
    number: "02",
    title: "Customize",
    description: "Fine-tune every color, font and animation from a side panel built for people who aren't designers."
  },
  {
    number: "03",
    title: "Get Link",
    description: "One click turns your design into a real, live web page — ready to text, share, or post anywhere."
  }
];

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  function openLogin() {
    setShowLogin(true);
  }

  function handleLoginSuccess() {
    setShowLogin(false);
    navigate("/dashboard");
  }

  return (
    <div className="landing">
      <div className="landing-dust" />

      <nav className="landing-nav">
        <div className="landing-brand">
          <span className="landing-brand-step">STEP</span>
          <span className="landing-brand-up">UP</span>
          <span className="landing-brand-tag">DIY</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">What You Can Build</a>
          <a href="#how-it-works">How It Works</a>
        </div>
        <button className="landing-btn landing-btn-gold" onClick={openLogin}>Start Designing</button>
      </nav>

      <header className="landing-hero">
        <div className="landing-eyebrow">DRAG. DROP. PUBLISH.</div>
        <h1 className="landing-headline">
          Design Your Own
          <br />
          Event Page.
        </h1>
        <p className="landing-subhead">
          No code, no designer, no waiting. Build an animated invitation, greeting
          or party page yourself — and hand back a real, shareable link.
        </p>
        <div className="landing-hero-actions">
          <button className="landing-btn landing-btn-gold landing-btn-large" onClick={openLogin}>Start Designing</button>
          <button className="landing-btn landing-btn-ghost landing-btn-large">See Sample Designs</button>
        </div>
      </header>

      <section id="features" className="landing-section">
        <p className="landing-section-label">WHAT YOU CAN BUILD</p>
        <h2 className="landing-section-title">Everything an event page needs</h2>
        <div className="landing-feature-grid">
          {FEATURES.map((feature) => (
            <div className="landing-feature-card" key={feature.title}>
              <div className="landing-feature-icon">{feature.icon}</div>
              <p className="landing-feature-title">{feature.title}</p>
              <p className="landing-feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-section-alt">
        <p className="landing-section-label">HOW IT WORKS</p>
        <h2 className="landing-section-title">From blank canvas to live link</h2>
        <div className="landing-steps">
          {STEPS.map((step, index) => (
            <div className="landing-step" key={step.number}>
              <span className="landing-step-number">{step.number}</span>
              <p className="landing-step-title">{step.title}</p>
              <p className="landing-step-desc">{step.description}</p>
              {index < STEPS.length - 1 && <span className="landing-step-connector" />}
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="landing-cta-title">Ready to design something unforgettable?</h2>
        <p className="landing-cta-subhead">It takes longer to pick a template than to publish the page.</p>
        <button className="landing-btn landing-btn-gold landing-btn-large" onClick={openLogin}>Start Designing — It's Free</button>
      </section>

      <footer className="landing-footer">
        <div className="landing-brand landing-brand-small">
          <span className="landing-brand-step">STEP</span>
          <span className="landing-brand-up">UP</span>
          <span className="landing-brand-tag">DIY</span>
        </div>
        <p className="landing-footer-copy">© 2026 StepUp. Design. Customize. Celebrate.</p>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />}
    </div>
  );
}

export default LandingPage;
