import { Users } from "lucide-react";
import { Link } from "react-router-dom";

function Subscribe() {
  return (
    <section className="w-full py-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        
        <div className="flex justify-center">
          <div className="p-4 bg-white/20 rounded-full backdrop-blur-lg shadow-lg">
            <Users size={40} />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold">
          Join UtilityPro now.
        </h2>

        <p className="max-w-2xl mx-auto text-lg text-purple-100">
          Experience the power of having all essential tools in one place.  
          Sign up today and unlock unlimited access to our constantly expanding tool collection.
        </p>

        {/* Join Button */}
        <Link
          to="/signup"
          className="inline-block mt-4 px-8 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow hover:bg-purple-100 transition"
        >
          Join UtilityPro
        </Link>

        {/* Newsletter Subscribe */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <input
            type="text"
            placeholder="Enter your email"
            className="w-full max-w-sm px-4 py-3 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow hover:bg-purple-100 transition">
            Subscribe
          </button>
        </div>

      </div>
    </section>
  );
}

export default Subscribe;
