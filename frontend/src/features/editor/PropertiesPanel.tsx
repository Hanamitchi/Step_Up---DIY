import { useEditor } from "../../store/EditorContext";
import type { AnimationPreset, SurpriseEffect, TransitionPreset } from "./editorTypes";
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

function PropertiesPanel() {
  const { currentPage, selectedId, updateElement, deleteElement, updatePage } = useEditor();
  const el = currentPage.elements.find((e) => e.id === selectedId);

  // ---------- No element selected: PAGE properties ----------
  if (!el) {
    return (
      <div className="properties-panel">
        <p className="properties-title">Page</p>

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
              max={60}
              value={currentPage.countdownSeconds}
              onChange={(e) => updatePage({ countdownSeconds: Number(e.target.value) })}
            />
          )}
        </div>

        <p className="properties-hint">
          Select an element on the canvas to edit its text, color, size or position.
        </p>
      </div>
    );
  }

  // ---------- Element selected ----------
  return (
    <div className="properties-panel">
      {el.type === "text" && (
        <>
          <p className="properties-title">Text</p>

          <div className="properties-field">
            <label>Content</label>
            <textarea
              className="properties-textarea"
              value={el.content}
              onChange={(e) => updateElement(el.id, { content: e.target.value })}
              rows={3}
            />
          </div>

          <div className="properties-field">
            <label>Font</label>
            <select
              className="properties-select"
              value={el.style.fontFamily}
              onChange={(e) => updateElement(el.id, { style: { ...el.style, fontFamily: e.target.value } })}
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="properties-field">
            <label>Size (1–30)</label>
            <input
              type="number"
              className="properties-number-input"
              min={1}
              max={30}
              value={el.style.fontSize}
              onChange={(e) =>
                updateElement(el.id, { style: { ...el.style, fontSize: Number(e.target.value) } })
              }
            />
          </div>

          <div className="properties-field">
            <label>Color</label>
            <ColorControl
              value={el.style.color}
              onChange={(c) => updateElement(el.id, { style: { ...el.style, color: c } })}
            />
          </div>

          <div className="properties-field">
            <label>Opacity</label>
            <input
              type="range"
              min={10}
              max={100}
              value={el.style.opacity * 100}
              onChange={(e) =>
                updateElement(el.id, { style: { ...el.style, opacity: Number(e.target.value) / 100 } })
              }
            />
          </div>

          <div className="properties-field">
            <label>Style</label>
            <div className="properties-toggle-group">
              <button
                className={el.style.bold ? "on" : ""}
                onClick={() => updateElement(el.id, { style: { ...el.style, bold: !el.style.bold } })}
              >
                <b>B</b>
              </button>
              <button
                className={el.style.italic ? "on" : ""}
                onClick={() => updateElement(el.id, { style: { ...el.style, italic: !el.style.italic } })}
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
                  onClick={() => updateElement(el.id, { style: { ...el.style, align: a } })}
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
          <p className="properties-title">Shape</p>
          <div className="properties-field">
            <label>Fill color</label>
            <ColorControl
              value={el.style.fill}
              onChange={(c) => updateElement(el.id, { style: { ...el.style, fill: c } })}
            />
          </div>
          <div className="properties-field">
            <label>Corner radius</label>
            <input
              type="range"
              min={0}
              max={200}
              value={el.style.radius}
              onChange={(e) => updateElement(el.id, { style: { ...el.style, radius: Number(e.target.value) } })}
            />
          </div>
          <div className="properties-field">
            <label>Opacity</label>
            <input
              type="range"
              min={10}
              max={100}
              value={el.style.opacity * 100}
              onChange={(e) =>
                updateElement(el.id, { style: { ...el.style, opacity: Number(e.target.value) / 100 } })
              }
            />
          </div>
        </>
      )}

      {el.type === "button" && (
        <>
          <p className="properties-title">Button</p>
          <div className="properties-field">
            <label>Label</label>
            <input
              type="text"
              className="properties-text-input"
              value={el.label}
              onChange={(e) => updateElement(el.id, { label: e.target.value })}
            />
          </div>
          <div className="properties-field">
            <label>Fill color</label>
            <ColorControl
              value={el.style.fill}
              onChange={(c) => updateElement(el.id, { style: { ...el.style, fill: c } })}
            />
          </div>
          <div className="properties-field">
            <label>Corner radius</label>
            <input
              type="range"
              min={0}
              max={40}
              value={el.style.radius}
              onChange={(e) => updateElement(el.id, { style: { ...el.style, radius: Number(e.target.value) } })}
            />
          </div>
          <div className="properties-field">
            <label>Opacity</label>
            <input
              type="range"
              min={10}
              max={100}
              value={el.style.opacity * 100}
              onChange={(e) =>
                updateElement(el.id, { style: { ...el.style, opacity: Number(e.target.value) / 100 } })
              }
            />
          </div>
        </>
      )}

      <div className="properties-field">
        <label>Animation</label>
        <select
          className="properties-select"
          value={el.animation}
          onChange={(e) => updateElement(el.id, { animation: e.target.value as AnimationPreset })}
        >
          {ANIMATIONS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className="properties-field">
        <label>Page Transition</label>
        <select
          className="properties-select"
          value={currentPage.transition}
          onChange={(e) => updatePage({ transition: e.target.value as TransitionPreset })}
        >
          {TRANSITIONS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="properties-divider" />
      <button className="properties-delete" onClick={() => deleteElement(el.id)}>
        Delete element
      </button>
    </div>
  );
}

export default PropertiesPanel;