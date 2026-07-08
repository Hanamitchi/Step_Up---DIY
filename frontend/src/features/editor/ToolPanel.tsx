import { useRef } from "react";
import { useEditor } from "../../store/EditorContext";
import { makeButton, makeMedia, makeShape, makeText } from "./editorFactories";
import type { ShapeKind } from "./editorTypes";
import type { ToolTab } from "./ToolRail";
import "./ToolPanel.css";

const SHAPE_ICONS: { id: ShapeKind; label: string; path: JSX.Element }[] = [
  { id: "square", label: "Square", path: <rect x="4" y="4" width="16" height="16" rx="2" /> },
  { id: "circle", label: "Circle", path: <circle cx="12" cy="12" r="8" /> },
  { id: "arrow", label: "Arrow", path: <path d="M4 12h13M12 5l7 7-7 7" /> },
  { id: "star", label: "Star", path: <path d="M12 3l2.6 5.8 6.4.6-4.8 4.3 1.4 6.3-5.6-3.3-5.6 3.3 1.4-6.3-4.8-4.3 6.4-.6z" /> },
  { id: "triangle", label: "Triangle", path: <path d="M12 4l9 16H3z" /> }
];

type Props = {
  activeTab: ToolTab;
};

function ToolPanel({ activeTab }: Props) {
  const { addElement, pendingTool, setPendingTool } = useEditor();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addElement(makeMedia(60, 60, "image", reader.result as string));
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addElement(makeMedia(60, 60, "video", url));
    e.target.value = "";
  }

  if (activeTab === "text") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Add text</p>
        <button className="tool-panel-tile" onClick={() => addElement(makeText(60, 60, "Your Heading", 26))}>
          Heading
        </button>
        <button
          className="tool-panel-tile"
          onClick={() => addElement(makeText(60, 130, "Add a little more detail here.", 14))}
        >
          Body Text
        </button>
        <p className="tool-panel-hint">
          Tip: double-click text on the canvas, then highlight any part of it to restyle just that
          selection from the Properties panel.
        </p>
      </div>
    );
  }

  if (activeTab === "shape") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Add a shape</p>
        <div className="tool-panel-icon-grid">
          {SHAPE_ICONS.map((s) => (
            <button key={s.id} className="tool-panel-icon-tile" onClick={() => addElement(makeShape(80, 80, s.id))}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#d9b54a" strokeWidth="1.8">
                {s.path}
              </svg>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "button") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Add a button</p>
        <button
          className="tool-panel-tile"
          onClick={() => addElement(makeButton(60, 60, "Celebrate", { kind: "effect", effect: "confetti" }))}
        >
          <span className="tool-panel-tile-label">Effect Button</span>
          <span className="tool-panel-tile-desc">Triggers confetti, sparkle, or fireworks when tapped.</span>
        </button>
        <button
          className="tool-panel-tile"
          onClick={() => addElement(makeButton(60, 120, "Next", { kind: "next-page" }))}
        >
          <span className="tool-panel-tile-label">Next Page Button</span>
          <span className="tool-panel-tile-desc">Takes the guest to the next page.</span>
        </button>
        <button
          className="tool-panel-tile"
          onClick={() => addElement(makeButton(60, 180, "Visit Link", { kind: "link", url: "" }))}
        >
          <span className="tool-panel-tile-label">Link Button</span>
          <span className="tool-panel-tile-desc">Opens a URL you set in Properties.</span>
        </button>
      </div>
    );
  }

  if (activeTab === "upload") {
    return (
      <div className="tool-panel">
        <p className="tool-panel-title">Upload media</p>
        <button className="tool-panel-tile" onClick={() => imageInputRef.current?.click()}>
          Upload Image
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} />
        <button className="tool-panel-tile" onClick={() => videoInputRef.current?.click()}>
          Upload Video
        </button>
        <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoFile} />
        <p className="tool-panel-hint">
          After uploading, select it to crop (zoom + pan) or flip from the Properties panel.
        </p>
      </div>
    );
  }

  // tools
  return (
    <div className="tool-panel">
      <p className="tool-panel-title">Drawing tools</p>
      <button
        className={`tool-panel-tile ${pendingTool === "draw" ? "tool-panel-tile-active" : ""}`}
        onClick={() => setPendingTool(pendingTool === "draw" ? null : "draw")}
      >
        <span className="tool-panel-tile-label">Draw</span>
        <span className="tool-panel-tile-desc">Freehand pen — click and drag on the canvas.</span>
      </button>
      <button
        className={`tool-panel-tile ${pendingTool === "line" ? "tool-panel-tile-active" : ""}`}
        onClick={() => setPendingTool(pendingTool === "line" ? null : "line")}
      >
        <span className="tool-panel-tile-label">Line</span>
        <span className="tool-panel-tile-desc">Click, drag, release to draw a straight line.</span>
      </button>
      {pendingTool && <p className="tool-panel-hint">Draw on the canvas now. Click the tool again to cancel.</p>}
    </div>
  );
}

export default ToolPanel;