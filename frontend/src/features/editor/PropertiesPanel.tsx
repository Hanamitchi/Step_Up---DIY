import { useEditor } from "../../store/EditorContext";
import "./PropertiesPanel.css";

const TEXT_COLORS = ["#d9b54a", "#f6f2e8", "#0c0b09", "#c96a4a", "#8a9a6b", "#5a7a8a"];

function PropertiesPanel() {
  const { currentPage, selectedId, updateElement, deleteElement } = useEditor();
  const el = currentPage.elements.find((e) => e.id === selectedId);

  if (!el) {
    return (
      <div className="properties-panel">
        <p className="properties-title">Design</p>
        <p className="properties-hint">
          Select an element on the canvas to edit its text, color, size or position.
        </p>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      {el.type === "text" && (
        <>
          <p className="properties-title">Text</p>
          <div className="properties-field">
            <label>Size</label>
            <input
              type="range"
              min={10}
              max={64}
              value={el.style.fontSize}
              onChange={(e) => updateElement(el.id, { style: { ...el.style, fontSize: Number(e.target.value) } })}
            />
          </div>
          <div className="properties-field">
            <label>Color</label>
            <div className="properties-swatches">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  className={`properties-swatch ${el.style.color === c ? "properties-swatch-on" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => updateElement(el.id, { style: { ...el.style, color: c } })}
                />
              ))}
            </div>
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
            <div className="properties-swatches">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  className={`properties-swatch ${el.style.fill === c ? "properties-swatch-on" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => updateElement(el.id, { style: { ...el.style, fill: c } })}
                />
              ))}
            </div>
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
            <div className="properties-swatches">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  className={`properties-swatch ${el.style.fill === c ? "properties-swatch-on" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => updateElement(el.id, { style: { ...el.style, fill: c } })}
                />
              ))}
            </div>
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
        </>
      )}

      <div className="properties-divider" />
      <button className="properties-delete" onClick={() => deleteElement(el.id)}>
        Delete element
      </button>
    </div>
  );
}

export default PropertiesPanel;
