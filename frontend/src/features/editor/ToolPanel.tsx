import { useEditor } from "../../store/EditorContext";
import { makeButton, makeShape, makeText } from "./editorFactories";
import type { AnimationPreset, TransitionPreset } from "./editorTypes";
import type { ToolTab } from "./ToolRail";
import "./ToolPanel.css";

const ANIMATIONS: { id: AnimationPreset; label: string }[] = [
  { id: "none", label: "None" },
  { id: "fade-in", label: "Fade In" },
  { id: "slide-up", label: "Slide Up" },
  { id: "zoom-in", label: "Zoom In" },
  { id: "bounce", label: "Bounce" }
];

const TRANSITIONS: { id: TransitionPreset; label: string; desc: string }[] = [
  { id: "cut", label: "Cut", desc: "Switches instantly, no motion." },
  { id: "fade", label: "Fade", desc: "Gently fades into this page." },
  { id: "slide", label: "Slide", desc: "Slides in from the right." }
];

const BACKGROUND_SWATCHES = ["#0c0b09", "#161310", "#d9b54a", "#f6f2e8", "#1b3a2f", "#3a2a1b"];

type Props = {
  activeTab: ToolTab;
};

function ToolPanel({ activeTab }: Props) {
  const { currentPage, selectedId, addElement, updateElement, updatePage } = useEditor();
  const selectedElement = currentPage.elements.find((el) => el.id === selectedId) ?? null;

  if (activeTab === "text") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Add text</p>
        <button className="tool-panel-tile" onClick={() => addElement(makeText(60, 60, "Your Heading", 32))}>
          Heading
        </button>
        <button
          className="tool-panel-tile"
          onClick={() => addElement(makeText(60, 130, "Add a little more detail here.", 16))}
        >
          Body Text
        </button>
      </div>
    );
  }

  if (activeTab === "shape") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Add a shape</p>
        <button className="tool-panel-tile" onClick={() => addElement(makeShape(80, 80, "rectangle"))}>
          Rectangle
        </button>
        <button className="tool-panel-tile" onClick={() => addElement(makeShape(80, 80, "circle"))}>
          Circle
        </button>
        <button className="tool-panel-tile" onClick={() => addElement(makeShape(60, 200, "line"))}>
          Divider Line
        </button>
      </div>
    );
  }

  if (activeTab === "button") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Add a button</p>
        <button className="tool-panel-tile" onClick={() => addElement(makeButton(60, 60, "RSVP"))}>
          RSVP Button
        </button>
        <button className="tool-panel-tile" onClick={() => addElement(makeButton(60, 120, "Learn More"))}>
          Custom Button
        </button>
      </div>
    );
  }

  if (activeTab === "animation") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Entrance animation</p>
        {selectedElement ? (
          <div className="tool-panel-list">
            {ANIMATIONS.map((a) => (
              <button
                key={a.id}
                className={`tool-panel-tile ${selectedElement.animation === a.id ? "tool-panel-tile-active" : ""}`}
                onClick={() => updateElement(selectedElement.id, { animation: a.id })}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="tool-panel-hint">Select an element on the canvas to give it an entrance animation.</p>
        )}
      </div>
    );
  }

  if (activeTab === "effects") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Page background</p>
        <div className="tool-panel-swatches">
          {BACKGROUND_SWATCHES.map((c) => (
            <button
              key={c}
              className={`tool-panel-swatch ${currentPage.background === c ? "tool-panel-swatch-on" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => updatePage({ background: c })}
            />
          ))}
        </div>

        <p className="tool-panel-title tool-panel-title-spaced">Gold dust overlay</p>
        <div className="tool-panel-toggle">
          <button
            className={currentPage.dustEffect ? "tool-panel-toggle-on" : ""}
            onClick={() => updatePage({ dustEffect: true })}
          >
            On
          </button>
          <button
            className={!currentPage.dustEffect ? "tool-panel-toggle-on" : ""}
            onClick={() => updatePage({ dustEffect: false })}
          >
            Off
          </button>
        </div>
      </div>
    );
  }

  // transition
  return (
    <div className="tool-panel">
      <p className="tool-panel-title">Page transition</p>
      <p className="tool-panel-hint">How this page enters when a guest moves onto it.</p>
      <div className="tool-panel-list">
        {TRANSITIONS.map((t) => (
          <button
            key={t.id}
            className={`tool-panel-tile ${currentPage.transition === t.id ? "tool-panel-tile-active" : ""}`}
            onClick={() => updatePage({ transition: t.id })}
          >
            <span className="tool-panel-tile-label">{t.label}</span>
            <span className="tool-panel-tile-desc">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToolPanel;
