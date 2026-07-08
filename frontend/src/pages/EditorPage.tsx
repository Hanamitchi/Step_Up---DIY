import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { EditorProvider } from "../store/EditorContext";
import ToolRail from "../features/editor/ToolRail";
import type { ToolTab } from "../features/editor/ToolRail";
import ToolPanel from "../features/editor/ToolPanel";
import Canvas from "../features/editor/Canvas";
import PropertiesPanel from "../features/editor/PropertiesPanel";
import PageStrip from "../features/editor/PageStrip";
import PreviewOverlay from "../features/editor/PreviewOverlay";
import "./EditorPage.css";

function EditorPageInner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ToolTab>("text");
  const [projectName, setProjectName] = useState("Untitled Greeting");
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <button className="editor-back" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
        <input
          className="editor-project-name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className="editor-topbar-spacer" />
        <button className="editor-preview-btn" onClick={() => setPreviewMode(true)}>
          ▶ Preview
        </button>
      </div>

      <div className="editor-main">
        <ToolRail active={activeTab} onChange={setActiveTab} />
        <ToolPanel activeTab={activeTab} />
        <Canvas />
        <PropertiesPanel />
      </div>

      <PageStrip />

      {previewMode && <PreviewOverlay onExit={() => setPreviewMode(false)} />}
    </div>
  );
}

function EditorPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return null;
  }

  return (
    <EditorProvider>
      <EditorPageInner />
    </EditorProvider>
  );
}

export default EditorPage;