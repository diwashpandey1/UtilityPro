import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth, googleProvider } from "../backend/Firebase";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { toast } from "react-toastify";

function ConfirmLogin({ onSuccess }) {
  const { user } = useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // Detect login method:
  const isGoogleLogin = user.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  // --- Re-auth for Email/Password ---
  const handlePasswordReAuth = async () => {
    try {
      setLoading(true);

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      toast.success("Verification successful 🔐");
      onSuccess(); // allow delete in parent

    } catch (err) {
      console.error(err);
      toast.error("Incorrect password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Re-auth for Google Login ---
  const handleGoogleReAuth = async () => {
    try {
      setLoading(true);
      await reauthenticateWithPopup(auth.currentUser, googleProvider);
      toast.success("Google verification successful 🎉");
      onSuccess();

    } catch (err) {
      console.error(err);
      toast.error("Google verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">
        Confirm Identity
      </h2>
      <p className="text-gray-500 text-sm text-center">
        For security, please verify your account before continuing.
      </p>

      {/* If user logged in with Google */}
      {isGoogleLogin && (
        <button
          onClick={handleGoogleReAuth}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify with Google"}
        </button>
      )}

      {/* If user logged in with Email/Password */}
      {!isGoogleLogin && (
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handlePasswordReAuth}
            disabled={!password || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Confirm Password"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ConfirmLogin;
