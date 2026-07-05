import type { MouseEvent } from "react";
import "./NewDesignModal.css";

type Props = {
  onClose: () => void;
  onSelectGreeting: () => void;
};

function NewDesignModal({ onClose, onSelectGreeting }: Props) {
  function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="new-design-overlay" onClick={onClose}>
      <div className="new-design-panel" onClick={stopPropagation}>
        <button className="new-design-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="new-design-eyebrow">NEW DESIGN</p>
        <h2 className="new-design-title">What are you creating?</h2>

        <div className="new-design-options">
          <button className="new-design-card" onClick={onSelectGreeting}>
            <span className="new-design-card-icon">🎉</span>
            <span className="new-design-card-title">Greeting</span>
            <span className="new-design-card-desc">An invitation, card, or event page — square format.</span>
          </button>

          <div className="new-design-card new-design-card-disabled">
            <span className="new-design-card-icon">📊</span>
            <span className="new-design-card-title">Presentation</span>
            <span className="new-design-card-desc">Slide-deck style design.</span>
            <span className="new-design-card-badge">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewDesignModal;
