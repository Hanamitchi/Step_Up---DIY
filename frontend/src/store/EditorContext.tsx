import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { CanvasElement, Page } from "../features/editor/editorTypes";

let pageCounter = 1;
function nextPageId() {
  return `page-${Date.now()}-${pageCounter++}`;
}

function createBlankPage(): Page {
  return {
    id: nextPageId(),
    background: "#0c0b09",
    dustEffect: true,
    transition: "fade",
    elements: []
  };
}

type EditorContextValue = {
  pages: Page[];
  currentPageId: string;
  currentPage: Page;
  currentPageIndex: number;
  selectedId: string | null;
  setCurrentPageId: (id: string) => void;
  addPage: () => void;
  selectElement: (id: string | null) => void;
  addElement: (el: CanvasElement) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  updatePage: (patch: Partial<Page>) => void;
};

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>(() => [createBlankPage()]);
  const [currentPageId, setCurrentPageId] = useState(() => pages[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  }

  function addElement(el: CanvasElement) {
    setPages((prev) =>
      prev.map((p) => (p.id === currentPageId ? { ...p, elements: [...p.elements, el] } : p))
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

  function updatePage(patch: Partial<Page>) {
    setPages((prev) => prev.map((p) => (p.id === currentPageId ? { ...p, ...patch } : p)));
  }

  const value: EditorContextValue = {
    pages,
    currentPageId,
    currentPage,
    currentPageIndex,
    selectedId,
    setCurrentPageId,
    addPage,
    selectElement,
    addElement,
    updateElement,
    deleteElement,
    updatePage
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
