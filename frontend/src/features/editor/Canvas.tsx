import { useEditor } from "../../store/EditorContext";
import ElementNode from "./ElementNode";
import "./Canvas.css";

function Canvas() {
  const { currentPage, selectElement } = useEditor();

  function handleBackgroundClick() {
    selectElement(null);
  }

  return (
    <div className="canvas-stage">
      <div
        className="canvas-artboard"
        style={{ backgroundColor: currentPage.background }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) handleBackgroundClick();
        }}
      >
        {currentPage.dustEffect && <div className="canvas-dust" />}
        {currentPage.elements.map((el) => (
          <ElementNode key={el.id} el={el} />
        ))}
      </div>
    </div>
  );
}

export default Canvas;
