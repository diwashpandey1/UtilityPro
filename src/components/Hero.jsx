import {ArrowRight, Sparkles, TrendingUp, Users} from "lucide-react";
import CloudyBG from "../assets/bgs/Cloudy.svg";
import { Link } from "react-router-dom";

function Hero() {
   return (
      <section
         className="relative overflow-hidden"
         style={{
            backgroundImage: `url("${CloudyBG}")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom center",
         }}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center max-w-4xl mx-auto">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-8">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Your Complete Utility Toolkit</span>
               </div>

               <p className="text-gray-100 mb-10 max-w-xl mx-auto text-lg">
                  Say goodbye to endlessly switching between apps. Everything you need is brought together in one seamless space, making your daily tasks easier, faster, and more effortless than ever.
               </p>

               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/tools"
                     onClick={() => onNavigate("tools")}
                     className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                     Explore Tools
                     <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/signup" className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                     Get Started
                  </Link>
               </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
         </div>
      </section>
   );
}

export default Hero;
