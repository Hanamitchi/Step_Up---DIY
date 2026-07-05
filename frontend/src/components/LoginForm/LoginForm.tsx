import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../store/AuthContext";
import "./LoginForm.css";

type Mode = "sign-in" | "sign-up";

type Props = {
  onSuccess: () => void;
};

function LoginForm({ onSuccess }: Props) {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = mode === "sign-in" ? await signIn(email, password) : await signUp(email, password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <div className="login-form">
      <p className="login-form-eyebrow">{mode === "sign-in" ? "WELCOME BACK" : "CREATE YOUR ACCOUNT"}</p>
      <h2 className="login-form-title">{mode === "sign-in" ? "Sign in to StepUp" : "Start designing for free"}</h2>

      {!isConfigured && (
        <p className="login-form-warning">
          Supabase isn't connected yet. Add <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env.local</code> file to enable real accounts.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label className="login-form-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          className="login-form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label className="login-form-label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          className="login-form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={6}
          required
        />

        {error && <p className="login-form-error">{error}</p>}

        <button type="submit" className="login-form-submit" disabled={submitting}>
          {submitting ? "Please wait…" : mode === "sign-in" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="login-form-switch">
        {mode === "sign-in" ? (
          <>
            Don't have an account?{" "}
            <button type="button" onClick={() => setMode("sign-up")}>
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" onClick={() => setMode("sign-in")}>
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default LoginForm;
