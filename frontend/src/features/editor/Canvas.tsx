import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEditor } from "../../store/EditorContext";
import { makeDraw } from "./editorFactories";
import ElementNode from "./ElementNode";
import "./Canvas.css";

function Canvas() {
  const { currentPage, selectElement, pendingTool, setPendingTool, addElement, guideLines } = useEditor();
  const artboardRef = useRef<HTMLDivElement>(null);
  const isCapturing = useRef(false);
  const [livePoints, setLivePoints] = useState<{ x: number; y: number }[]>([]);

  function handleBackgroundClick() {
    selectElement(null);
  }

  function toLocalPoint(clientX: number, clientY: number) {
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function handleArtboardPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!pendingTool) {
      if (e.target === e.currentTarget) handleBackgroundClick();
      return;
    }
    if (e.target !== e.currentTarget) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    isCapturing.current = true;
    setLivePoints([toLocalPoint(e.clientX, e.clientY)]);
  }

  function handleArtboardPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!isCapturing.current || !pendingTool) return;
    const point = toLocalPoint(e.clientX, e.clientY);
    setLivePoints((prev) => (pendingTool === "draw" ? [...prev, point] : [prev[0], point]));
  }

  function handleArtboardPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (!isCapturing.current) return;
    isCapturing.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // pointer may already be released — safe to ignore
    }
    finishCapture();
  }

  function finishCapture() {
    setLivePoints((current) => {
      const points = current;
      const tool = pendingTool;
      if (!tool || points.length < 2) {
        setPendingTool(null);
        return [];
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
      return [];
    });
  }

  return (
    <div className="canvas-stage">
      <div
        ref={artboardRef}
        className={`canvas-artboard ${pendingTool ? "canvas-artboard-drawing" : ""}`}
        style={{ backgroundColor: currentPage.background, touchAction: pendingTool ? "none" : "auto" }}
        onPointerDown={handleArtboardPointerDown}
        onPointerMove={handleArtboardPointerMove}
        onPointerUp={handleArtboardPointerUp}
      >
        {currentPage.dustEffect && <div className="canvas-dust" />}

        {[...currentPage.elements]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <ElementNode key={el.id} el={el} />
          ))}

        {livePoints.length > 1 && (
          <svg className="canvas-draw-preview">
            <polyline
              points={livePoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#d9b54a"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {guideLines.vertical.map((x) => (
          <div key={`v-${x}`} className="canvas-guide-v" style={{ left: x }} />
        ))}
        {guideLines.horizontal.map((y) => (
          <div key={`h-${y}`} className="canvas-guide-h" style={{ top: y }} />
        ))}
      </div>
    </div>
  );
}

export default Canvas;