import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/auth.service";

function messageFor(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-login-credentials"
  ) {
    return "Current password is incorrect.";
  }

  if (code === "auth/weak-password") {
    return "Use at least 8 characters.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Try again in a moment.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Couldn't change the password. Try again.";
}

export default function Security() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);

    if (nextPassword.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (nextPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    if (nextPassword === currentPassword) {
      setError("Choose a password that's different from the current one.");
      return;
    }

    setSaving(true);

    try {
      await authService.changePassword(currentPassword, nextPassword);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setSaved(true);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-950">Change password</h1>
      <p className="mt-2 text-sm text-slate-500">
        Enter your current password, then choose a new one.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line"
      >
        <PasswordField
          id="current-password"
          label="Current password"
          value={currentPassword}
          shown={showCurrent}
          autoComplete="current-password"
          onChange={setCurrentPassword}
          onToggle={() => setShowCurrent((shown) => !shown)}
        />
        <PasswordField
          id="new-password"
          label="New password"
          value={nextPassword}
          shown={showNext}
          autoComplete="new-password"
          onChange={setNextPassword}
          onToggle={() => setShowNext((shown) => !shown)}
        />
        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          value={confirmPassword}
          shown={showConfirm}
          autoComplete="new-password"
          onChange={setConfirmPassword}
          onToggle={() => setShowConfirm((shown) => !shown)}
        />

        {error ? (
          <p className="mt-4 text-sm text-warning" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="mt-4 text-sm font-medium text-success" role="status">
            Password updated.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {saving ? "Saving..." : "Update password"}
        </button>
      </form>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  shown,
  autoComplete,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  shown: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-slate-200 py-3 pr-11 pl-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="button"
          aria-label={shown ? `Hide ${label}` : `Show ${label}`}
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {shown ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
