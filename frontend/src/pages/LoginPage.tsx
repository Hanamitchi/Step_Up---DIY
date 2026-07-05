import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm/LoginForm";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  function handleSuccess() {
    navigate("/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-page-dust" />
      <div className="login-page-card">
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

export default LoginPage;
