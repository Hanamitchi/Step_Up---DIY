import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import ProfileMenu from "../components/ProfileMenu/ProfileMenu";
import NewDesignModal from "../components/NewDesignModal/NewDesignModal";
import "./DashboardPage.css";

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showNewDesign, setShowNewDesign] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  function handleSelectGreeting() {
    setShowNewDesign(false);
    navigate("/editor");
  }

  if (loading) {
    return <div className="dashboard-loading">Loading…</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="dashboard-brand">
          <span className="dashboard-brand-step">STEP</span>
          <span className="dashboard-brand-up">UP</span>
        </div>
        <ProfileMenu />
      </nav>

      <header className="dashboard-header">
        <p className="dashboard-eyebrow">MY PROJECTS</p>
        <h1 className="dashboard-title">Welcome back{user.email ? `, ${user.email}` : ""}.</h1>
        <p className="dashboard-subhead">You don't have any projects yet.</p>
        <button className="dashboard-cta" onClick={() => setShowNewDesign(true)}>
          + Start a New Design
        </button>
      </header>

      <div className="dashboard-empty">
        <p>Your saved projects will show up here once project storage is connected.</p>
      </div>

      {showNewDesign && (
        <NewDesignModal onClose={() => setShowNewDesign(false)} onSelectGreeting={handleSelectGreeting} />
      )}
    </div>
  );
}

export default DashboardPage;
