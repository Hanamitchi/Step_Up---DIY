import { useEffect, useState } from "react";
import { useEditor } from "../../store/EditorContext";
import { ShapeIcon } from "./ElementNode";
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
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [burstEffect, setBurstEffect] = useState<string | null>(null);

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

  function handleButtonClick(action: { kind: string; effect?: string; url?: string }) {
    if (action.kind === "next-page") goNext();
    if (action.kind === "effect" && action.effect) {
      setBurstEffect(null);
      requestAnimationFrame(() => setBurstEffect(action.effect as string));
    }
    if (action.kind === "link" && action.url) {
      const url = /^https?:\/\//i.test(action.url) ? action.url : `https://${action.url}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  // reset per-page state (page-load countdown + element appear timers) whenever the page changes
  useEffect(() => {
    setCountdown(currentPage.countdownSeconds);
    setVisibleIds(new Set());
    setBurstEffect(currentPage.surpriseEffect !== "none" ? currentPage.surpriseEffect : null);

    const timers = currentPage.elements.map((el) =>
      setTimeout(() => {
        setVisibleIds((prev) => new Set(prev).add(el.id));
      }, el.appearDelay * 1000)
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage.id]);

  useEffect(() => {
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

          {[...currentPage.elements]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
              const isVisible = visibleIds.has(el.id);
              return (
                <div
                  key={el.id + el.animation + isVisible}
                  className={`preview-el ${isVisible ? `anim-${el.animation}` : "preview-el-hidden"}`}
                  style={{ left: el.x, top: el.y, width: el.w, height: el.h, zIndex: el.zIndex, transform: `rotate(${el.rotation}deg)` }}
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
                        textAlign: el.style.align,
                        letterSpacing: el.style.letterSpacing
                      }}
                      dangerouslySetInnerHTML={{ __html: el.content }}
                    />
                  )}
                  {el.type === "shape" && (
                    <svg viewBox="0 0 24 24" preserveAspectRatio="none" className="preview-el-shape" style={{ opacity: el.style.opacity }}>
                      <ShapeIcon kind={el.shape} fill={el.style.fill} />
                    </svg>
                  )}
                  {el.type === "button" && (
                    <button
                      className="preview-el-button"
                      style={{
                        backgroundColor: el.style.fill,
                        color: el.style.textColor,
                        borderRadius: el.style.radius,
                        fontSize: el.style.fontSize,
                        opacity: el.style.opacity
                      }}
                      onClick={() => handleButtonClick(el.action)}
                    >
                      {el.label}
                    </button>
                  )}
                  {el.type === "media" && el.kind === "image" && (
                    <img
                      src={el.src}
                      className="preview-el-media"
                      style={{
                        borderRadius: el.style.radius,
                        opacity: el.style.opacity,
                        objectPosition: `${el.style.panX}% ${el.style.panY}%`,
                        transform: `scaleX(${el.style.flipH ? -1 : 1}) scaleY(${el.style.flipV ? -1 : 1}) scale(${el.style.zoom})`
                      }}
                    />
                  )}
                  {el.type === "media" && el.kind === "video" && (
                    <video
                      src={el.src}
                      className="preview-el-media"
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        borderRadius: el.style.radius,
                        opacity: el.style.opacity,
                        objectPosition: `${el.style.panX}% ${el.style.panY}%`,
                        transform: `scaleX(${el.style.flipH ? -1 : 1}) scaleY(${el.style.flipV ? -1 : 1}) scale(${el.style.zoom})`
                      }}
                    />
                  )}
                  {el.type === "draw" && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="preview-el-draw" style={{ opacity: el.style.opacity }}>
                      <polyline
                        points={el.points.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke={el.style.strokeColor}
                        strokeWidth={el.style.strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )}
                </div>
              );
            })}

          {burstEffect && (
            <div className="preview-surprise" key={currentPage.id + "-surprise-" + burstEffect}>
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="preview-surprise-particle"
                  style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.15}s` }}
                >
                  {SURPRISE_EMOJI[burstEffect]}
                </span>
              ))}
            </div>
          )}

          {currentPage.countdownEnabled && hasNext && <div className="preview-countdown">{countdown}</div>}
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