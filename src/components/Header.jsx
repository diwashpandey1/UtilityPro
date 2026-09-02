import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/images/logo.png";
import navLinks from "../data/Navdata";
import { AuthContext } from "../context/AuthContext";

function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // 🔥 Correctly access context
  const { user, logout } = useContext(AuthContext);

  // 🔥 Firebase user uses "photoURL"
  const profilePicture =
    user?.photoURL ||
    "https://www.pngmart.com/files/23/Profile-PNG-Photo.png";

  return (
    <header className="w-full bg-gray-50 shadow-sm fixed z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center gap-1">
          <img src={logo} alt="Logo" className="h-10 w-10" />
          <p className="font-bold text-xl">
            <span className="text-gray-950">Utility</span>
            <span className="text-cyan-300">Pro</span>
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-10 text-gray-700 text-[15px]">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.url}
              className={`transition ${
                location.pathname === link.url
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          {/* Desktop Login / Signup */}
          {!user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            /* Desktop Profile Picture (Direct Link) */
            <div className="hidden md:flex items-center">
              <Link
                to="/profile"
                className="w-10 h-10 rounded-full overflow-hidden border hover:opacity-80 transition"
              >
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          )}

          {/* MOBILE: Profile (if logged in) + Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full overflow-hidden border hover:opacity-80 transition"
              >
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="text-gray-700"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-gray-50 shadow-md"
          >
            <nav className="flex flex-col gap-4 py-4 px-6">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  to={link.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`transition ${
                    location.pathname === link.url
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="flex flex-col gap-2 mt-4">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-center border rounded-lg hover:text-blue-600"
                    >
                      Login
                    </Link>

                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 border rounded-lg text-center hover:text-blue-600"
                    >
                      Profile
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;