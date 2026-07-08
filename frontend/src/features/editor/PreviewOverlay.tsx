import { useEffect, useState } from "react";
import { useEditor } from "../../store/EditorContext";
import "./elementAnimations.css";
import "./PreviewOverlay.css";

const SURPRISE_EMOJI: Record<string, string> = {
  confetti: "🎉",
  sparkle: "✨",
  fireworks: "🎆"
};

type Props = {
  onExit: () => void;
};

function PreviewOverlay({ onExit }: Props) {
  const { pages, currentPage, currentPageIndex, setCurrentPageId } = useEditor();
  const [countdown, setCountdown] = useState(currentPage.countdownSeconds);

  const hasNext = currentPageIndex < pages.length - 1;
  const hasPrev = currentPageIndex > 0;

  function goNext() {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageId(pages[currentPageIndex + 1].id);
    }
  }

  function goPrev() {
    if (currentPageIndex > 0) {
      setCurrentPageId(pages[currentPageIndex - 1].id);
    }
  }

  useEffect(() => {
    setCountdown(currentPage.countdownSeconds);
    if (!currentPage.countdownEnabled || currentPageIndex >= pages.length - 1) return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          goNext();
          return currentPage.countdownSeconds;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage.id]);

  return (
    <div className="preview-overlay">
      <button className="preview-exit" onClick={onExit}>
        ✕ Exit Preview
      </button>

      <div className="preview-stage">
        <div
          key={currentPage.id}
          className={`preview-artboard preview-transition-${currentPage.transition}`}
          style={{ backgroundColor: currentPage.background }}
        >
          {currentPage.dustEffect && <div className="preview-dust" />}

          {currentPage.elements.map((el) => (
            <div
              key={el.id + el.animation}
              className={`preview-el anim-${el.animation}`}
              style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
            >
              {el.type === "text" && (
                <div
                  className="preview-el-text"
                  style={{
                    fontFamily: el.style.fontFamily,
                    fontSize: el.style.fontSize,
                    color: el.style.color,
                    opacity: el.style.opacity,
                    fontWeight: el.style.bold ? 700 : 400,
                    fontStyle: el.style.italic ? "italic" : "normal",
                    textAlign: el.style.align
                  }}
                >
                  {el.content}
                </div>
              )}
              {el.type === "shape" && (
                <div
                  className="preview-el-shape"
                  style={{
                    backgroundColor: el.style.fill,
                    borderRadius: el.style.radius,
                    opacity: el.style.opacity
                  }}
                />
              )}
              {el.type === "button" && (
                <div
                  className="preview-el-button"
                  style={{
                    backgroundColor: el.style.fill,
                    color: el.style.textColor,
                    borderRadius: el.style.radius,
                    fontSize: el.style.fontSize,
                    opacity: el.style.opacity
                  }}
                >
                  {el.label}
                </div>
              )}
            </div>
          ))}

          {currentPage.surpriseEffect !== "none" && (
            <div className="preview-surprise" key={currentPage.id + "-surprise"}>
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="preview-surprise-particle"
                  style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.15}s` }}
                >
                  {SURPRISE_EMOJI[currentPage.surpriseEffect]}
                </span>
              ))}
            </div>
          )}

          {currentPage.countdownEnabled && hasNext && (
            <div className="preview-countdown">{countdown}</div>
          )}
        </div>
      </div>

      <div className="preview-controls">
        <button disabled={!hasPrev} onClick={goPrev}>
          ← Prev
        </button>
        <span className="preview-page-indicator">
          Page {currentPageIndex + 1} / {pages.length}
        </span>
        <button disabled={!hasNext} onClick={goNext}>
          Next →
        </button>
      </div>
    </div>
  );
}

export default PreviewOverlay;