import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { CanvasElement, Page, ToolKind } from "../features/editor/editorTypes";

let pageCounter = 1;
function nextPageId() {
  return `page-${Date.now()}-${pageCounter++}`;
}

let cloneCounter = 1;
function nextCloneId() {
  return `clone-${Date.now()}-${cloneCounter++}`;
}

function createBlankPage(): Page {
  return {
    id: nextPageId(),
    background: "#0c0b09",
    dustEffect: true,
    transition: "fade",
    surpriseEffect: "none",
    countdownEnabled: false,
    countdownSeconds: 5,
    elements: []
  };
}

export type ActiveTextSelection = {
  elementId: string;
  range: Range;
  container: HTMLElement;
};

export type GuideLines = {
  vertical: number[];
  horizontal: number[];
};

const NO_GUIDES: GuideLines = { vertical: [], horizontal: [] };

type EditorContextValue = {
  pages: Page[];
  currentPageId: string;
  currentPage: Page;
  currentPageIndex: number;
  selectedId: string | null;
  pendingTool: ToolKind | null;
  activeSelection: ActiveTextSelection | null;
  guideLines: GuideLines;
  setCurrentPageId: (id: string) => void;
  addPage: () => void;
  selectElement: (id: string | null) => void;
  addElement: (el: CanvasElement) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  updatePage: (patch: Partial<Page>) => void;
  setPendingTool: (tool: ToolKind | null) => void;
  setActiveSelection: (selection: ActiveTextSelection | null) => void;
  reorderElement: (id: string, action: "front" | "forward" | "backward" | "back") => void;
  setGuideLines: (guides: GuideLines) => void;
  clearGuideLines: () => void;
};

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>(() => [createBlankPage()]);
  const [currentPageId, setCurrentPageId] = useState(() => pages[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingTool, setPendingTool] = useState<ToolKind | null>(null);
  const [activeSelection, setActiveSelection] = useState<ActiveTextSelection | null>(null);
  const [guideLines, setGuideLinesState] = useState<GuideLines>(NO_GUIDES);

  const currentPageIndex = Math.max(
    0,
    pages.findIndex((p) => p.id === currentPageId)
  );
  const currentPage = pages[currentPageIndex] ?? pages[0];

  function addPage() {
    const page = createBlankPage();
    setPages((prev) => [...prev, page]);
    setCurrentPageId(page.id);
    setSelectedId(null);
  }

  function selectElement(id: string | null) {
    setSelectedId(id);
    setActiveSelection(null);
  }

  function addElement(el: CanvasElement) {
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPageId
          ? { ...p, elements: [...p.elements, { ...el, zIndex: p.elements.length + 1 }] }
          : p
      )
    );
    setSelectedId(el.id);
  }

  function updateElement(id: string, patch: Partial<CanvasElement>) {
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPageId
          ? {
              ...p,
              elements: p.elements.map((el) =>
                el.id === id ? ({ ...el, ...patch } as CanvasElement) : el
              )
            }
          : p
      )
    );
  }

  function deleteElement(id: string) {
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPageId ? { ...p, elements: p.elements.filter((el) => el.id !== id) } : p
      )
    );
    setSelectedId((prev) => (prev === id ? null : prev));
  }

  function duplicateElement(id: string) {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== currentPageId) return p;
        const source = p.elements.find((el) => el.id === id);
        if (!source) return p;
        const clone: CanvasElement = {
          ...source,
          id: nextCloneId(),
          x: source.x + 16,
          y: source.y + 16,
          zIndex: p.elements.length + 1
        };
        setSelectedId(clone.id);
        return { ...p, elements: [...p.elements, clone] };
      })
    );
  }

  function updatePage(patch: Partial<Page>) {
    setPages((prev) => prev.map((p) => (p.id === currentPageId ? { ...p, ...patch } : p)));
  }

  function reorderElement(id: string, action: "front" | "forward" | "backward" | "back") {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== currentPageId) return p;
        const sorted = [...p.elements].sort((a, b) => a.zIndex - b.zIndex);
        const index = sorted.findIndex((el) => el.id === id);
        if (index === -1) return p;

        const [item] = sorted.splice(index, 1);
        if (action === "front") sorted.push(item);
        else if (action === "back") sorted.unshift(item);
        else if (action === "forward") sorted.splice(Math.min(index + 1, sorted.length), 0, item);
        else if (action === "backward") sorted.splice(Math.max(index - 1, 0), 0, item);

        const restamped = sorted.map((el, i) => ({ ...el, zIndex: i + 1 }));
        return { ...p, elements: restamped };
      })
    );
  }

  function setGuideLines(guides: GuideLines) {
    setGuideLinesState(guides);
  }

  function clearGuideLines() {
    setGuideLinesState(NO_GUIDES);
  }

  const value: EditorContextValue = {
    pages,
    currentPageId,
    currentPage,
    currentPageIndex,
    selectedId,
    pendingTool,
    activeSelection,
    guideLines,
    setCurrentPageId,
    addPage,
    selectElement,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    updatePage,
    setPendingTool,
    setActiveSelection,
    reorderElement,
    setGuideLines,
    clearGuideLines
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return ctx;
}