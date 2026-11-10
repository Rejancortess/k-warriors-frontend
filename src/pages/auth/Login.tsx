import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import axios from "axios";

import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../stores/useAuthStore";

function messageFor(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-email"
  ) {
    return "Those credentials don't match an account.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Try again in a moment.";
  }

  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return typeof message === "string"
      ? message
      : "Signed in, but the account could not be saved.";
  }

  return "Couldn't sign in. Check your connection and try again.";
}

function resetMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  if (code === "auth/invalid-email") {
    return "Enter a valid work email.";
  }

  if (code === "auth/user-not-found") {
    return "No account uses that email.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Try again in a moment.";
  }

  return "Couldn't send the reset email. Try again.";
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetError("");
    setResetSent(false);
    setResetting(true);

    try {
      await authService.requestPasswordReset(email.trim());
      setResetSent(true);
    } catch (err) {
      setResetError(resetMessage(err));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-slate-950">
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-10 lg:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,460px)] lg:gap-16">
          <section>
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt=""
                className="h-11 w-11 rounded-lg object-cover"
              />
              <div className="leading-tight">
                <p className="text-[15px] font-extrabold tracking-wide">
                  K-WARRIORS
                </p>
                <p className="text-xs text-slate-500">Inventory System</p>
              </div>
            </div>

            <h1 className="mt-10 text-4xl font-extrabold leading-[1.1] tracking-tight lg:text-[2.35rem] xl:text-[2.6rem]">
              Simple inventory
              <br />
              management, <span className="text-primary">made easier.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-[15px]">
              Manage your inventory with ease. K-Warriors makes it simple to
              scan, track, and manage your stock all in one place.
            </p>

            <div className="mt-8 hidden lg:block">
              <img
                src="/hero.png"
                alt="Person scanning a package beside stacked inventory boxes"
                className="h-auto w-full"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white px-7 py-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] ring-1 ring-line sm:px-9 sm:py-10">
            <h2 className="text-[28px] font-extrabold tracking-tight">
              {showReset ? "Reset password" : "Welcome back"}
            </h2>
            <p className="mt-1.5 text-[13px] text-slate-500">
              {showReset
                ? "Enter your work email and we'll send a link to choose a new password."
                : "Enter your credentials to access your inventory workspace."}
            </p>

            {showReset ? (
              <form className="mt-7" onSubmit={handleReset}>
                <label
                  htmlFor="reset-email"
                  className="text-sm font-semibold text-slate-800"
                >
                  Work email
                </label>
                <div className="relative mt-2">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setResetSent(false);
                    }}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-slate-200 py-3 pr-3 pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>

                {resetError ? (
                  <p className="mt-4 text-sm text-warning" role="alert">
                    {resetError}
                  </p>
                ) : null}
                {resetSent ? (
                  <p
                    className="mt-4 text-sm font-medium text-success"
                    role="status"
                  >
                    Check your email and use the link to choose a new password.
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={resetting}
                  className="mt-6 w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {resetting ? "Sending..." : "Send reset link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(false);
                    setResetError("");
                    setResetSent(false);
                  }}
                  className="mt-4 w-full text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Back to sign in
                </button>
              </form>
            ) : (
              <form className="mt-7" onSubmit={handleSubmit}>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-800"
                >
                  Work email
                </label>
                <div className="relative mt-2">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-slate-200 py-3 pr-3 pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(true);
                      setError("");
                    }}
                    className="text-sm font-medium text-link hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-2">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 py-3 pr-11 pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error ? (
                  <p className="mt-4 text-sm text-warning" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Signing in..." : "Sign in →"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have access?{" "}
              <button
                type="button"
                onClick={() => setShowRequest(true)}
                className="font-semibold text-link hover:underline"
              >
                Request account
              </button>
            </p>
          </section>
        </div>
      </main>

      {showRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-labelledby="request-account-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="request-account-title" className="text-lg font-bold text-slate-950">
              Request account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              To request an account for the K-Warriors Inventory System, please
              contact your system administrator.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRequest(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-end gap-3 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:gap-6 lg:px-10">
          <div className="flex gap-6">
            <button type="button" className="hover:text-slate-700">
              Privacy
            </button>
            <button type="button" className="hover:text-slate-700">
              Terms
            </button>
            <button type="button" className="hover:text-slate-700">
              Help
            </button>
          </div>
          <p>© 2026 K-Warriors Operations Ltd.</p>
        </div>
      </footer>
    </div>
  );
}
