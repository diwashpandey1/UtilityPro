import React, { useState, useContext, useEffect } from "react";
import { User, Mail, Lock, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // 🔥 Import Firestore functions
import { auth, fireDb } from "../backend/Firebase";
import { toast } from "react-toastify";


const SignUp = () => {
  const { user, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");

  // Redirect logged-in users
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPass) {
      toast.warn("All fields are required.");
      return;
    }

    if (password !== confirmPass) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      // 1. Create User in Firebase Authentication
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Update Auth Profile (Display Name)
      await updateProfile(res.user, { displayName: fullName });

      // 3. 🔥 Store User Data in Firestore "user" collection
      // Route: user/{uid}
      await setDoc(doc(fireDb, "user", res.user.uid), {
        uid: res.user.uid,
        displayName: fullName,
        email: email,
        // We initialize these as empty so your Profile page doesn't break
        photoURL: "", 
        dob: "", 
        phoneNumber: "",
        createdAt: new Date().toISOString(),
        providerId: "password", // To identify login method in Profile page
      });

      // 4. Navigate to home
      navigate("/", { replace: true });
    } catch (err) {
      // console.log(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-white">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
        <div
          className="absolute w-[180%] h-[180%] lg:w-[150%] lg:h-[150%] 
                      top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 
                      bg-white rounded-full opacity-100 z-10"
          style={{ clipPath: "circle(50% at 50% 50%)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-white to-transparent opacity-30"></div>
        </div>

        <div className="relative z-20 text-white text-center p-8 -translate-x-1/4">
          <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
            SIGN UP
          </h1>
          <p className="text-xl opacity-80">CREATE ACCOUNT</p>
          <div className="w-16 h-0.5 bg-white mx-auto mt-4"></div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-white">

        <Link
          to="/"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7m-5 10V9m0 11v-4a1 1 0 011-1h2a1 1 0 
                  011 1v4m0 0h-6"
            />
          </svg>
        </Link>

        <div className="w-full max-w-sm">

          {/* HEADER */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-gray-800">
              SIGN UP
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded-md text-sm mb-3">
              {error}
            </div>
          )}

          {/* FORM */}
          <form className="space-y-4" onSubmit={handleSignUp}>

            <InputGroup
              icon={User}
              placeholder="Full Name"
              type="text"
              onChange={(e) => setFullName(e.target.value)}
            />

            <InputGroup
              icon={Mail}
              placeholder="Email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputGroup
              icon={Lock}
              placeholder="Password"
              type="password"
              endIcon={Eye}
              onChange={(e) => setPassword(e.target.value)}
            />

            <InputGroup
              icon={Lock}
              placeholder="Confirm Password"
              type="password"
              endIcon={Eye}
              onChange={(e) => setConfirmPass(e.target.value)}
            />

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold 
                           rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Sign Up
            </button>

            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t"></div>
              <span className="mx-4 text-sm text-gray-400">Or Sign Up with</span>
              <div className="flex-grow border-t"></div>
            </div>

            {/* GOOGLE BUTTON */}
            <GoogleButton loginWithGoogle={loginWithGoogle} />
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account?
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline ml-1"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// INPUT COMPONENT
const InputGroup = ({ icon: Icon, placeholder, type, endIcon: EndIcon, onChange }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon size={18} />
    </span>

    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full pl-10 pr-10 py-3 border-b border-gray-300 
                  focus:outline-none focus:border-blue-500"
    />

    {EndIcon && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
        <EndIcon size={18} />
      </span>
    )}
  </div>
);

// GOOGLE BUTTON
const GoogleButton = ({ loginWithGoogle }) => (
  <button
    onClick={loginWithGoogle}
    type="button"
    className="w-full flex items-center justify-center gap-2 py-3 
               border border-gray-300 rounded-lg hover:bg-gray-50 transition"
  >
    <img
      src="https://img.icons8.com/?size=28&id=17949&format=png"
      alt="Google Icon"
    />
    <span className="text-sm">Continue with Google</span>
  </button>
);

export default SignUp;