import React, { useContext, useState, useEffect } from "react";
import { Mail, Lock, Eye, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";


const Login = () => {
   const { user, loginWithGoogle, loginWithEmail } = useContext(AuthContext);

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

   const navigate = useNavigate();

   // Redirect if already logged in
   useEffect(() => {
      if (user) {
         navigate("/", { replace: true });
      }
   }, [user, navigate]);

   const handleLogin = async (e) => {
      e.preventDefault();
      try {
         await loginWithEmail(email, password);
      } catch (err) {
         // console.log(err);
         toast.error("Login Failed ! Please try Again !")
      }
   };

   return (
      <div className="flex h-screen bg-white">

         {/* LEFT SIDE */}
         <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
            <div
               className="absolute w-[180%] h-[180%] lg:w-[150%] lg:h-[150%] top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 bg-white rounded-full opacity-100 z-10"
               style={{ clipPath: "circle(50% at 50% 50%)" }}>
               <div className="absolute inset-0 bg-gradient-to-l from-white to-transparent opacity-30"></div>
            </div>

            <div className="relative z-20 text-white text-center p-8 -translate-x-1/4">
               <h1 className="text-5xl font-extrabold">LOGIN</h1>
               <p className="text-xl opacity-80">SIGN IN</p>
               <div className="w-16 h-0.5 bg-white mx-auto mt-4" />
            </div>
         </div>

         {/* RIGHT SIDE */}
         <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
            <Link to="/" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
               <Home size={24} />
            </Link>

            <div className="w-full max-w-sm">

               {/* HEADER */}
               <div className="flex flex-col items-center mb-10">
                  <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                     <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10l10 5 10-5V7Z" />
                     </svg>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-gray-800">LOGIN</h2>
               </div>

               {/* FORM */}
               <form className="space-y-4" onSubmit={handleLogin}>
                  <InputGroup
                     icon={Mail}
                     placeholder="Email"
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                  />

                  <InputGroup
                     icon={Lock}
                     placeholder="Password"
                     type="password"
                     endIcon={Eye}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="text-right text-sm">
                     <Link to="/forgot-password" className="text-blue-600 hover:underline">
                        Forgot Password?
                     </Link>
                  </div>

                  <button
                     type="submit"
                     className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                     Login
                  </button>

                  <div className="flex items-center my-4">
                     <div className="flex-grow border-t" />
                     <span className="mx-4 text-sm text-gray-400">Or Login with</span>
                     <div className="flex-grow border-t" />
                  </div>

                  <GoogleButton loginWithGoogle={loginWithGoogle} />
               </form>

               <div className="mt-8 text-center text-sm text-gray-500">
                  Don't have an account?
                  <Link to="/signup" className="text-blue-600 hover:underline ml-1">
                     Sign Up
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
};

const InputGroup = ({ icon: Icon, placeholder, type, endIcon: EndIcon, value, onChange }) => (
   <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
         <Icon size={18} />
      </span>

      <input
         type={type}
         placeholder={placeholder}
         value={value}
         onChange={onChange}
         className="w-full pl-10 pr-10 py-3 border-b border-gray-300 focus:outline-none focus:border-blue-500"
      />

      {EndIcon && (
         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
            <EndIcon size={18} />
         </span>
      )}
   </div>
);

const GoogleButton = ({ loginWithGoogle }) => (
   <button
      onClick={loginWithGoogle}
      type="button"
      className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
   >
      <img
         src="https://img.icons8.com/?size=28&id=17949&format=png&color=000000"
         alt="Google Icon"
      />
      <span className="text-sm">Continue with Google</span>
   </button>
);

export default Login;
