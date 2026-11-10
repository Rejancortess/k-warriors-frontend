import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { authService } from "../../services/auth.service";
import { userService, type AccountUser } from "../../services/user.service";
import { useAuthStore } from "../../stores/useAuthStore";

function roleLabel(role: "ADMIN" | "STAFF") {
  return role === "ADMIN" ? "Administrator" : "Staff";
}

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function Profile() {
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const email = useAuthStore((state) => state.user?.email);
  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? "");
  }, [profile?.name]);

  const trimmed = name.trim();
  const unchanged = trimmed === (profile?.name ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);

    if (!trimmed) {
      setError("Enter your name.");
      return;
    }

    setSaving(true);

    try {
      const next = await authService.updateName(trimmed);
      setProfile(next);
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err, "Couldn't update your name."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-950">My Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line"
      >
        <label htmlFor="profile-name" className="text-sm font-semibold text-slate-800">
          Name
        </label>
        <input
          id="profile-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          maxLength={100}
          required
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <p className="mt-5 text-sm text-slate-500">Role</p>
        <p className="mt-1 text-base font-semibold text-slate-800">
          {profile ? roleLabel(profile.role) : "—"}
        </p>
        <p className="mt-5 text-sm text-slate-500">Email</p>
        <p className="mt-1 text-base font-semibold text-slate-800">
          {profile?.email || email || "—"}
        </p>

        {error ? (
          <p className="mt-4 text-sm text-warning" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="mt-4 text-sm font-medium text-success" role="status">
            Name updated.
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link to="/account/security" className="text-sm font-semibold text-link">
            Change password
          </Link>
          <button
            type="submit"
            disabled={saving || !trimmed || unchanged}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save name"}
          </button>
        </div>
      </form>

      {profile?.role === "ADMIN" ? <AccountList currentUserId={profile.id} /> : null}
    </section>
  );
}

function AccountList({ currentUserId }: { currentUserId: string }) {
  const [accounts, setAccounts] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    let active = true;

    userService
      .getAll()
      .then((response) => {
        if (!active) return;
        setAccounts(response.data ?? []);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(errorMessage(err, "Couldn't load accounts."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function changeRole(account: AccountUser, role: AccountUser["role"]) {
    if (role === account.role || savingId) return;

    setSavingId(account.id);
    setError("");

    try {
      const response = await userService.updateRole(account.id, role);
      setAccounts((current) =>
        current.map((item) => (item.id === account.id ? response.data : item)),
      );
    } catch (err) {
      setError(errorMessage(err, "Couldn't update that role."));
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="mt-6 max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
      <h2 className="text-lg font-bold text-slate-950">Accounts</h2>
      <p className="mt-1 text-sm text-slate-500">
        Change a user between Administrator and Staff.
      </p>

      {loading ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={14} className="animate-spin" />
          Loading accounts...
        </p>
      ) : accounts.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No accounts yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {accounts.map((account) => {
            const isYou = account.id === currentUserId;

            return (
              <li key={account.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {account.name}
                    {isYou ? (
                      <span className="ml-2 text-xs font-medium text-slate-400">You</span>
                    ) : null}
                  </p>
                  <p className="truncate text-sm text-slate-500">{account.email}</p>
                  {!account.isActive ? (
                    <p className="text-xs font-medium text-slate-400">Inactive</p>
                  ) : null}
                </div>
                <label className="sr-only" htmlFor={`role-${account.id}`}>
                  Role for {account.name}
                </label>
                <select
                  id={`role-${account.id}`}
                  value={account.role}
                  disabled={isYou || savingId === account.id}
                  onChange={(event) =>
                    void changeRole(account, event.target.value as AccountUser["role"])
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-primary disabled:opacity-60 sm:w-auto"
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="STAFF">Staff</option>
                </select>
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <p className="mt-4 text-sm text-warning" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
