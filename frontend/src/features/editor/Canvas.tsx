import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEditor } from "../../store/EditorContext";
import { makeDraw } from "./editorFactories";
import ElementNode from "./ElementNode";
import "./Canvas.css";

function Canvas() {
  const { currentPage, selectElement, pendingTool, setPendingTool, addElement } = useEditor();
  const artboardRef = useRef<HTMLDivElement>(null);
  const capturedPoints = useRef<{ x: number; y: number }[]>([]);
  const isCapturing = useRef(false);

  function handleBackgroundClick() {
    selectElement(null);
  }

  function toLocalPoint(e: PointerEvent | ReactPointerEvent<HTMLDivElement>) {
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleArtboardPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!pendingTool) {
      if (e.target === e.currentTarget) handleBackgroundClick();
      return;
    }
    if (e.target !== e.currentTarget) return;

    isCapturing.current = true;
    const start = toLocalPoint(e);
    capturedPoints.current = [start];

    function onMove(ev: PointerEvent) {
      if (!isCapturing.current) return;
      const point = toLocalPoint(ev);
      if (pendingTool === "draw") {
        capturedPoints.current.push(point);
      } else {
        // line tool: only keep the start and the live end point
        capturedPoints.current = [capturedPoints.current[0], point];
      }
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      isCapturing.current = false;
      finishCapture();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function finishCapture() {
    const points = capturedPoints.current;
    const tool = pendingTool;
    capturedPoints.current = [];
    if (!tool || points.length < 2) {
      setPendingTool(null);
      return;
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const width = Math.max(Math.max(...xs) - minX, 4);
    const height = Math.max(Math.max(...ys) - minY, 4);

    const relativePoints = points.map((p) => ({
      x: ((p.x - minX) / width) * 100,
      y: ((p.y - minY) / height) * 100
    }));

    addElement(makeDraw(minX, minY, width, height, tool, relativePoints));
    setPendingTool(null);
  }

  return (
    <div className="canvas-stage">
      <div
        ref={artboardRef}
        className={`canvas-artboard ${pendingTool ? "canvas-artboard-drawing" : ""}`}
        style={{ backgroundColor: currentPage.background }}
        onPointerDown={handleArtboardPointerDown}
      >
        {currentPage.dustEffect && <div className="canvas-dust" />}
        {[...currentPage.elements]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <ElementNode key={el.id} el={el} />
          ))}
      </div>
    </div>
  );
}

export default Canvas;