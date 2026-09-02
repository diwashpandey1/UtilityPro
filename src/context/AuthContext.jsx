// AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { auth, googleProvider, fireDb } from "../backend/Firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return await signOut(auth);
  };

  // ✅ Delete Account
  const deleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No authenticated user");

    try {
      const uid = currentUser.uid;

      // 1️⃣ Delete Firestore document
      await deleteDoc(doc(fireDb, "user", uid));

      // 2️⃣ Delete Firebase Auth user
      await deleteUser(currentUser);

      return { success: true };
    } catch (error) {
      console.error("Delete account error:", error);

      if (error.code === "auth/requires-recent-login") {
        // throw a simple recognizable error object
        throw { code: "auth/requires-recent-login" };
      }

      throw error;
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    logout,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
