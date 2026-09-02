import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import my_profile from "../assets/images/my_pp.jpg";
import logo from "../assets/images/logo.png"

function About() {
  return (
    <>
      <Header />

      <div className="pt-24 pb-16 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto text-gray-800 leading-relaxed">

        {/* Section Title */}
        <h2 className="text-4xl font-bold justify-center items-center gap-5 mb-10 flex">
          <img src={logo} alt="" className="w-20 h-20" />
          <span>About Utility<span className="text-blue-400">Pro</span></span>
        </h2>

        {/* Story Section */}
        <div className="space-y-6 text-lg">
          <p>
            UtilityPro started not as a business idea but as a learning project.
            While exploring full-stack development and improving my skills, I realized
            the best way to learn was by building something real something I would
            personally use.
          </p>

          <p>
            During that journey, I often needed simple tools: a password generator,
            QR scanner, color picker, or random value generator. Instead of searching
            different sites every time, the idea grew:
          </p>

          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 text-xl">
            “Why not build all of these tools in one place while learning?”
          </blockquote>

          <p>
            And that’s how <span className="font-semibold text-blue-600">UtilityPro</span> was born.
          </p>

          <p>
            Built with curiosity, errors, debugging, and progress   UtilityPro reflects
            my growth as a developer. What began as a small experiment now continues
            evolving with more features as I learn and improve.
          </p>

          <p>
            The goal isn’t perfection   it’s progress, practice, and building
            something meaningful while learning.
          </p>

          <p>
            Whether you’re here out of curiosity, to test a tool, or you landed here
            accidentally   <span className="font-semibold text-green-600">thank you</span>.
            Every visit, click, and feedback motivates me to keep improving and expanding
            UtilityPro step by step.
          </p>

          <p className="font-semibold text-xl mt-4">
            This is just the beginning   and the best part is:
            <br />
            <span className="text-blue-600 underline">I'm still learning.</span>
          </p>
        </div>

        {/* About Me Section */}
        <div className="mt-16 flex flex-col md:flex-row items-center gap-10 bg-gray-50 p-8 rounded-xl shadow-sm">

          <div className="w-70 aspect-square rounded-full object-cover border-4 border-blue-500 shadow-md overflow-hidden">
            <img
              src={my_profile}
              alt="My Profile"
              className=""
            />
          </div>


          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">About Me 👋</h3>
            <p className="text-lg text-gray-700">
              Hi, I’m <span className="font-semibold">Diwash Pandey</span>, a BCA student
              and passionate learner exploring the world of{" "}
              <span className="text-blue-600 font-semibold">
                Full-Stack Web Development & AI/ML.
              </span>
              <br /><br />
              I enjoy creating real projects while learning   combining creativity,
              logic, and technology. UtilityPro is one of those projects, built to
              sharpen my skills while making something useful.
              <br /><br />
              My journey continues, and every project gets me one step closer to
              becoming the developer I aspire to be.
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

export default About;
