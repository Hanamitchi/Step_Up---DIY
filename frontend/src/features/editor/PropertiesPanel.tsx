import { useEditor } from "../../store/EditorContext";
import type {
  AnimationPreset,
  ButtonAction,
  CanvasElement,
  SurpriseEffect,
  TransitionPreset
} from "./editorTypes";
import "./PropertiesPanel.css";

const COLORS = ["#d9b54a", "#f6f2e8", "#0c0b09", "#c96a4a", "#8a9a6b", "#5a7a8a"];

const FONTS = [
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Trebuchet", value: '"Trebuchet MS", sans-serif' },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: '"Courier New", monospace' }
];

const ANIMATIONS: { id: AnimationPreset; label: string }[] = [
  { id: "none", label: "None" },
  { id: "fade-in", label: "Fade In" },
  { id: "slide-up", label: "Slide Up" },
  { id: "zoom-in", label: "Zoom In" },
  { id: "bounce", label: "Bounce" }
];

const TRANSITIONS: { id: TransitionPreset; label: string }[] = [
  { id: "cut", label: "Cut" },
  { id: "fade", label: "Fade" },
  { id: "slide", label: "Slide" }
];

const SURPRISES: { id: SurpriseEffect; label: string; emoji: string }[] = [
  { id: "none", label: "None", emoji: "—" },
  { id: "confetti", label: "Confetti", emoji: "🎉" },
  { id: "sparkle", label: "Sparkle", emoji: "✨" },
  { id: "fireworks", label: "Fireworks", emoji: "🎆" }
];

function ColorControl({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="properties-swatches">
      {COLORS.map((c) => (
        <button
          key={c}
          className={`properties-swatch ${value === c ? "properties-swatch-on" : ""}`}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
        />
      ))}
      <label className="properties-color-custom" title="Pick any color">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="properties-section-title">{children}</p>;
}

function PropertiesPanel() {
  const { currentPage, selectedId, updateElement, deleteElement, updatePage, reorderElement, activeSelection, setActiveSelection } =
    useEditor();
  const el = currentPage.elements.find((e) => e.id === selectedId);

  // ---------- No element selected: PAGE properties ----------
  if (!el) {
    return (
      <div className="properties-panel">
        <SectionTitle>Page</SectionTitle>

        <div className="properties-field">
          <label>Page Color</label>
          <ColorControl value={currentPage.background} onChange={(c) => updatePage({ background: c })} />
        </div>

        <div className="properties-field">
          <label>Gold Dust Overlay</label>
          <div className="properties-toggle-group">
            <button className={currentPage.dustEffect ? "on" : ""} onClick={() => updatePage({ dustEffect: true })}>
              On
            </button>
            <button className={!currentPage.dustEffect ? "on" : ""} onClick={() => updatePage({ dustEffect: false })}>
              Off
            </button>
          </div>
        </div>

        <div className="properties-field">
          <label>Transition</label>
          <div className="properties-toggle-group">
            {TRANSITIONS.map((t) => (
              <button
                key={t.id}
                className={currentPage.transition === t.id ? "on" : ""}
                onClick={() => updatePage({ transition: t.id })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="properties-field">
          <label>Surprise Effect</label>
          <div className="properties-surprise-grid">
            {SURPRISES.map((s) => (
              <button
                key={s.id}
                className={`properties-surprise-tile ${currentPage.surpriseEffect === s.id ? "on" : ""}`}
                onClick={() => updatePage({ surpriseEffect: s.id })}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="properties-field">
          <label>Countdown to Next Page</label>
          <div className="properties-toggle-group">
            <button
              className={currentPage.countdownEnabled ? "on" : ""}
              onClick={() => updatePage({ countdownEnabled: true })}
            >
              On
            </button>
            <button
              className={!currentPage.countdownEnabled ? "on" : ""}
              onClick={() => updatePage({ countdownEnabled: false })}
            >
              Off
            </button>
          </div>
          {currentPage.countdownEnabled && (
            <input
              type="number"
              className="properties-number-input"
              min={1}
              max={15}
              value={currentPage.countdownSeconds}
              onChange={(e) =>
                updatePage({ countdownSeconds: Math.min(15, Math.max(1, Number(e.target.value))) })
              }
            />
          )}
        </div>

        <p className="properties-hint">
          Select an element on the canvas to edit its text, color, size or position.
        </p>
      </div>
    );
  }

  // ---------- Helpers for the selected element ----------
  function patch(p: Partial<CanvasElement>) {
    updateElement(el!.id, p);
  }

  function applyTextStyle(prop: "fontSize" | "color" | "fontFamily" | "letterSpacing", value: string | number) {
    if (el!.type !== "text") return;
    const sel = activeSelection;
    if (sel && sel.elementId === el!.id && sel.range && !sel.range.collapsed) {
      const span = document.createElement("span");
      if (prop === "fontSize") span.style.fontSize = `${value}px`;
      if (prop === "color") span.style.color = String(value);
      if (prop === "fontFamily") span.style.fontFamily = String(value);
      if (prop === "letterSpacing") span.style.letterSpacing = `${value}px`;
      try {
        sel.range.surroundContents(span);
      } catch {
        const frag = sel.range.extractContents();
        span.appendChild(frag);
        sel.range.insertNode(span);
      }
      updateElement(el!.id, { content: sel.container.innerHTML });
      setActiveSelection(null);
    } else if (el!.type === "text") {
      updateElement(el!.id, { style: { ...el!.style, [prop]: value } });
    }
  }

  const hasSelectionInThisText = el.type === "text" && activeSelection?.elementId === el.id;

  function setOpacity(value: number) {
    if (el!.type === "text") updateElement(el!.id, { style: { ...el!.style, opacity: value } });
    else if (el!.type === "shape") updateElement(el!.id, { style: { ...el!.style, opacity: value } });
    else if (el!.type === "button") updateElement(el!.id, { style: { ...el!.style, opacity: value } });
    else if (el!.type === "media") updateElement(el!.id, { style: { ...el!.style, opacity: value } });
    else if (el!.type === "draw") updateElement(el!.id, { style: { ...el!.style, opacity: value } });
  }

  return (
    <div className="properties-panel">
      {/* ---------- POSITION ---------- */}
      <SectionTitle>Position</SectionTitle>
      <div className="properties-grid-2">
        <div className="properties-field">
          <label>X</label>
          <input
            type="number"
            className="properties-number-input"
            value={Math.round(el.x)}
            onChange={(e) => patch({ x: Number(e.target.value) })}
          />
        </div>
        <div className="properties-field">
          <label>Y</label>
          <input
            type="number"
            className="properties-number-input"
            value={Math.round(el.y)}
            onChange={(e) => patch({ y: Number(e.target.value) })}
          />
        </div>
        <div className="properties-field">
          <label>Width</label>
          <input
            type="number"
            className="properties-number-input"
            value={Math.round(el.w)}
            onChange={(e) => patch({ w: Math.max(4, Number(e.target.value)) })}
          />
        </div>
        <div className="properties-field">
          <label>Height</label>
          <input
            type="number"
            className="properties-number-input"
            value={Math.round(el.h)}
            onChange={(e) => patch({ h: Math.max(4, Number(e.target.value)) })}
          />
        </div>
      </div>
      <div className="properties-field">
        <label>Layer</label>
        <div className="properties-layer-buttons">
          <button onClick={() => reorderElement(el.id, "back")} title="Send to back">
            ⤓
          </button>
          <button onClick={() => reorderElement(el.id, "backward")} title="Send backward">
            ↓
          </button>
          <button onClick={() => reorderElement(el.id, "forward")} title="Bring forward">
            ↑
          </button>
          <button onClick={() => reorderElement(el.id, "front")} title="Bring to front">
            ⤒
          </button>
        </div>
      </div>

      {/* ---------- CONTENT (type-specific) ---------- */}
      {el.type === "text" && (
        <>
          <SectionTitle>Text</SectionTitle>
          {hasSelectionInThisText && (
            <p className="properties-selection-note">Styling your highlighted text only.</p>
          )}
          <div className="properties-field">
            <label>Font</label>
            <select
              className="properties-select"
              value={el.style.fontFamily}
              onChange={(e) => applyTextStyle("fontFamily", e.target.value)}
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="properties-grid-2">
            <div className="properties-field">
              <label>Size (1–30)</label>
              <input
                type="number"
                className="properties-number-input"
                min={1}
                max={30}
                value={el.style.fontSize}
                onChange={(e) => applyTextStyle("fontSize", Math.min(30, Math.max(1, Number(e.target.value))))}
              />
            </div>
            <div className="properties-field">
              <label>Letter Spacing</label>
              <input
                type="number"
                className="properties-number-input"
                min={-2}
                max={20}
                value={el.style.letterSpacing}
                onChange={(e) => applyTextStyle("letterSpacing", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="properties-field">
            <label>Color</label>
            <ColorControl value={el.style.color} onChange={(c) => applyTextStyle("color", c)} />
          </div>
          <div className="properties-field">
            <label>Style</label>
            <div className="properties-toggle-group">
              <button
                className={el.style.bold ? "on" : ""}
                onClick={() => patch({ style: { ...el.style, bold: !el.style.bold } })}
              >
                <b>B</b>
              </button>
              <button
                className={el.style.italic ? "on" : ""}
                onClick={() => patch({ style: { ...el.style, italic: !el.style.italic } })}
              >
                <i>I</i>
              </button>
            </div>
          </div>
          <div className="properties-field">
            <label>Align</label>
            <div className="properties-toggle-group">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  className={el.style.align === a ? "on" : ""}
                  onClick={() => patch({ style: { ...el.style, align: a } })}
                >
                  {a === "left" ? "⟸" : a === "center" ? "≡" : "⟹"}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {el.type === "shape" && (
        <>
          <SectionTitle>Shape</SectionTitle>
          {el.shape === "square" && (
            <div className="properties-field">
              <label>Corner radius</label>
              <input
                type="range"
                min={0}
                max={200}
                value={el.style.radius}
                onChange={(e) => patch({ style: { ...el.style, radius: Number(e.target.value) } })}
              />
            </div>
          )}
        </>
      )}

      {el.type === "button" && (
        <>
          <SectionTitle>Button</SectionTitle>
          <div className="properties-field">
            <label>Label</label>
            <input
              type="text"
              className="properties-text-input"
              value={el.label}
              onChange={(e) => patch({ label: e.target.value })}
            />
          </div>
          <div className="properties-field">
            <label>Action</label>
            <select
              className="properties-select"
              value={el.action.kind}
              onChange={(e) => {
                const kind = e.target.value as ButtonAction["kind"];
                const action: ButtonAction =
                  kind === "effect" ? { kind: "effect", effect: "confetti" } : kind === "next-page" ? { kind: "next-page" } : { kind: "link", url: "" };
                patch({ action });
              }}
            >
              <option value="effect">Trigger Effect</option>
              <option value="next-page">Go to Next Page</option>
              <option value="link">Open Link</option>
            </select>
          </div>
          {el.action.kind === "effect" && (
            <div className="properties-field">
              <label>Effect</label>
              <select
                className="properties-select"
                value={el.action.effect}
                onChange={(e) => patch({ action: { kind: "effect", effect: e.target.value as SurpriseEffect } })}
              >
                {SURPRISES.filter((s) => s.id !== "none").map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {el.action.kind === "link" && (
            <div className="properties-field">
              <label>URL</label>
              <input
                type="text"
                className="properties-text-input"
                placeholder="https://example.com"
                value={el.action.url}
                onChange={(e) => patch({ action: { kind: "link", url: e.target.value } })}
              />
            </div>
          )}
          <div className="properties-field">
            <label>Fill color</label>
            <ColorControl value={el.style.fill} onChange={(c) => patch({ style: { ...el.style, fill: c } })} />
          </div>
          <div className="properties-field">
            <label>Corner radius</label>
            <input
              type="range"
              min={0}
              max={40}
              value={el.style.radius}
              onChange={(e) => patch({ style: { ...el.style, radius: Number(e.target.value) } })}
            />
          </div>
        </>
      )}

      {el.type === "media" && (
        <>
          <SectionTitle>{el.kind === "image" ? "Image" : "Video"}</SectionTitle>
          <div className="properties-field">
            <label>Flip</label>
            <div className="properties-toggle-group">
              <button
                className={el.style.flipH ? "on" : ""}
                onClick={() => patch({ style: { ...el.style, flipH: !el.style.flipH } })}
              >
                Horizontal
              </button>
              <button
                className={el.style.flipV ? "on" : ""}
                onClick={() => patch({ style: { ...el.style, flipV: !el.style.flipV } })}
              >
                Vertical
              </button>
            </div>
          </div>
          <div className="properties-field">
            <label>Zoom (crop)</label>
            <input
              type="range"
              min={100}
              max={300}
              value={el.style.zoom * 100}
              onChange={(e) => patch({ style: { ...el.style, zoom: Number(e.target.value) / 100 } })}
            />
          </div>
          <div className="properties-grid-2">
            <div className="properties-field">
              <label>Pan X</label>
              <input
                type="range"
                min={0}
                max={100}
                value={el.style.panX}
                onChange={(e) => patch({ style: { ...el.style, panX: Number(e.target.value) } })}
              />
            </div>
            <div className="properties-field">
              <label>Pan Y</label>
              <input
                type="range"
                min={0}
                max={100}
                value={el.style.panY}
                onChange={(e) => patch({ style: { ...el.style, panY: Number(e.target.value) } })}
              />
            </div>
          </div>
        </>
      )}

      {el.type === "draw" && (
        <>
          <SectionTitle>{el.toolKind === "draw" ? "Drawing" : "Line"}</SectionTitle>
          <div className="properties-field">
            <label>Stroke color</label>
            <ColorControl
              value={el.style.strokeColor}
              onChange={(c) => patch({ style: { ...el.style, strokeColor: c } })}
            />
          </div>
          <div className="properties-field">
            <label>Stroke width</label>
            <input
              type="range"
              min={1}
              max={20}
              value={el.style.strokeWidth}
              onChange={(e) => patch({ style: { ...el.style, strokeWidth: Number(e.target.value) } })}
            />
          </div>
        </>
      )}

      {/* ---------- EFFECT ---------- */}
      <SectionTitle>Effect</SectionTitle>
      <div className="properties-field">
        <label>Opacity</label>
        <input
          type="range"
          min={10}
          max={100}
          value={el.style.opacity * 100}
          onChange={(e) => setOpacity(Number(e.target.value) / 100)}
        />
      </div>

      {/* ---------- ANIMATION ---------- */}
      <SectionTitle>Animation</SectionTitle>
      <div className="properties-field">
        <label>Entrance</label>
        <select
          className="properties-select"
          value={el.animation}
          onChange={(e) => patch({ animation: e.target.value as AnimationPreset })}
        >
          {ANIMATIONS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div className="properties-field">
        <label>Appear After (0–5 sec)</label>
        <input
          type="number"
          className="properties-number-input"
          min={0}
          max={5}
          value={el.appearDelay}
          onChange={(e) => patch({ appearDelay: Math.min(5, Math.max(0, Number(e.target.value))) })}
        />
      </div>

      <div className="properties-divider" />
      <button className="properties-delete" onClick={() => deleteElement(el.id)}>
        Delete element
      </button>
    </div>
  );
}

export default PropertiesPanel;