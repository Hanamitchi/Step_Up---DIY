import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import "./ProfileMenu.css";

function ProfileMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initial = user?.email ? user.email[0].toUpperCase() : "?";

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="profile-menu">
      <button className="profile-avatar" onClick={() => setOpen((v) => !v)}>
        {initial}
      </button>
      {open && (
        <>
          <div className="profile-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="profile-menu-dropdown">
            <p className="profile-menu-email">{user?.email}</p>
            <button className="profile-menu-logout" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileMenu;
