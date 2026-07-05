import type { MouseEvent } from "react";
import LoginForm from "../LoginForm/LoginForm";
import "./LoginModal.css";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

function LoginModal({ onClose, onSuccess }: Props) {
  function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-panel" onClick={stopPropagation}>
        <button className="login-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <LoginForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}

export default LoginModal;
