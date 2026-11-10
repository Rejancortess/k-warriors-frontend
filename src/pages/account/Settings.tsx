import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

export default function AccountSettings() {
  const profile = useAuthStore((state) => state.profile);
  const email = useAuthStore((state) => state.user?.email);

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-slate-950">Account Settings</h1>
      <p className="mt-2 text-sm text-slate-500">
        Update the preferences for this account.
      </p>
      <div className="mt-6 max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
        <p className="text-sm font-semibold text-slate-800">Work email</p>
        <p className="mt-2 rounded-lg bg-canvas px-4 py-3 text-sm text-slate-700">
          {profile?.email || email || "—"}
        </p>
        <p className="mt-6 text-sm font-semibold text-slate-800">Password</p>
        <p className="mt-1 text-sm text-slate-500">
          Choose a new password for signing in.
        </p>
        <Link
          to="/account/security"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          Change password
        </Link>
      </div>
    </section>
  );
}
