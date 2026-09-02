import logo from "../assets/images/logo.png";
import { Facebook, Instagram, Github, Mail } from "lucide-react";
import navLinks from "../data/Navdata";
import { trendingTools } from "../data/ToolsData";
import { Link, useLocation } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  return (
    <section className="bg-gray-900 text-gray-50 py-14 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img src={logo} alt="UtilityPro Logo" className="w-10 h-10" />
              <p className="text-2xl font-bold tracking-wide">
                <span className="text-blue-400">Utility</span>
                <span className="text-blue-600">Pro</span>
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Your all-in-one platform for essential tools. Simple, fast, and
              reliable utilities to boost your productivity.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 text-gray-300">
              <a href="https://facebook.com/diwash.pandey.07" target="_blank">
                <Facebook className="hover:text-blue-500 transition" size={22} />
              </a>
              <a href="https://instagram.com/diiwashhh7" target="_blank">
                <Instagram className="hover:text-pink-500 transition" size={22} />
              </a>
              <a href="https://www.github.com/diwashpandey1" target="_blank">
                <Github className="hover:text-gray-100 transition" size={22} />
              </a>
              <a href="mailto:diwashpandey999@gmail.com">
                <Mail className="hover:text-red-400 transition" size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Quick Links</h3>

            <div className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  to={link.url}
                  className={`transition ${
                    location.pathname === link.url
                      ? "text-blue-400 font-medium"
                      : "hover:text-blue-400"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <Link
                to="/privacy-policy"
                className="hover:text-blue-400 transition"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Popular Tools */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Popular Tools</h3>

            <div className="flex flex-col gap-2">
              {trendingTools.slice(0, 5).map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.link}
                  className="hover:text-blue-400 transition"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-700 my-10" />

        {/* Footer Bottom */}
        <div className="text-center text-gray-400">
          © {currentYear} UtilityPro. All rights reserved.
        </div>
      </div>
    </section>
  );
}

export default Footer;
