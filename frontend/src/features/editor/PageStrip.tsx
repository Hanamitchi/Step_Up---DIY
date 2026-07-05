import { useEditor } from "../../store/EditorContext";
import "./PageStrip.css";

function PageStrip() {
  const { pages, currentPageId, setCurrentPageId, addPage } = useEditor();

  return (
    <div className="page-strip">
      {pages.map((page, index) => (
        <button
          key={page.id}
          className={`page-strip-thumb ${page.id === currentPageId ? "page-strip-thumb-active" : ""}`}
          style={{ backgroundColor: page.background }}
          onClick={() => setCurrentPageId(page.id)}
        >
          <span>{index + 1}</span>
        </button>
      ))}
      <button className="page-strip-add" onClick={addPage} aria-label="Add page">
        +
      </button>
    </div>
  );
}

export default PageStrip;
