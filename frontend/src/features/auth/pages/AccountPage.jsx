import { useEffect, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";

const AccountPage = () => {
  const { user, profile, isAdmin, signOut, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  if (!user) {
    return null;
  }

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    if (!username.trim()) {
      setStatusMessage("Username cannot be empty.");
      setStatusType("error");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        updatedAt: serverTimestamp(),
      });
      // Update local state immediately so sidebar reflects changes
      updateProfileState({ username: username.trim() });
      
      setStatusMessage("Profile updated successfully.");
      setStatusType("success");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setStatusMessage("Unable to update your profile. Please try again.");
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <button
        type="button"
        onClick={() =>
          navigate(isAdmin ? "/admin/dashboard" : "/landowner/dashboard")
        }
        className="mb-6 inline-flex items-center text-sm font-medium text-green-700 hover:text-green-900"
      >
        ← Back to dashboard
      </button>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Account settings
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage the details tied to your TreeFolks account. Usernames update the
          name shown in the sidebar and notifications. Admin flags are managed
          by TreeFolks staff.
        </p>

        <form onSubmit={handleUpdateProfile} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-700">Role</p>
            <p className="mt-1 text-sm text-gray-600">
              {isAdmin ? "Administrator" : "Landowner"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Admin access is provisioned by TreeFolks staff. Contact support if
              your access level looks incorrect.
            </p>
          </div>
          {statusMessage && (
            <p
              className={`text-sm ${
                statusType === "error"
                  ? "text-red-600"
                  : statusType === "success"
                    ? "text-green-600"
                    : "text-gray-600"
              }`}
            >
              {statusMessage}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
