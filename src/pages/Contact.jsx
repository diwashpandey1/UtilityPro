import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Send, Mail, Phone, Instagram, Github } from "lucide-react";

function Contact() {
  return (
    <>
      <Header />

      <div className="min-h-screen bg-[#f7f7fb] pt-24 pb-16 px-4 md:px-10 lg:px-16">
        <div className="w-full max-w-6xl mx-auto space-y-10 lg:space-y-12">
          {/* TOP: Heading + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mt-10">
            {/* LEFT TEXT */}
            <div className="flex flex-col justify-start">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-4">
                Contact
              </h1>
              <p className="text-gray-600 text-lg max-w-md">
                Have feedback, found a bug, need support, or just want to say hi?
                <br />
                Feel free to reach out ✨
              </p>
            </div>

            {/* RIGHT CARD – FORM */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 lg:p-10">
              <form className="space-y-6">
                {/* Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Your Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your Name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Your Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Your Email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="subject"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Subject<span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      id="subject"
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Choose a subject...
                      </option>
                      <option value="bug">Report a bug</option>
                      <option value="feature">Suggest a feature</option>
                      <option value="support">Need help / Support</option>
                      <option value="other">Other</option>
                    </select>

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="message"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Message<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows="6"
                    placeholder="Write a message"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Terms + Button row */}
                <div className="flex flex-col items-start gap-4 mt-4">
                  <label className="flex items-start gap-2 text-xs md:text-sm text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <span>
                      I accept{" "}
                      <button
                        type="button"
                        className="text-red-500 underline hover:text-red-600"
                      >
                        Terms &amp; Conditions
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="text-red-500 underline hover:text-red-600"
                      >
                        Legal &amp; Privacy
                      </button>
                      .
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md self-end md:self-auto"
                  >
                    Send message
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* BOTTOM: CONTACT & SOCIAL INFO */}
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl shadow-sm space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800">
              Get in Touch
            </h3>

            <p className="text-gray-600 leading-relaxed">
              I try to respond within{" "}
              <span className="font-semibold">24 hours</span>. Whether it's a
              feature request, bug report, collaboration idea, or just a
              message — I'm happy to hear it 😊
            </p>

            {/* Email */}
            <div className="flex items-center gap-3 text-gray-700">
              <Mail size={20} className="text-blue-500" />
              <span className="text-sm">diwashpandey999@gmail.com</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 text-gray-700">
              <Phone size={20} className="text-green-600" />
              <span className="text-sm">+977 • Available After 6 PM</span>
            </div>

            {/* Social Icons */}
            <div className="pt-4">
              <p className="font-medium text-gray-800 mb-3">Connect with me</p>

              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-3 rounded-full bg-white shadow border hover:scale-110 transition"
                >
                  <Github size={22} />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-white shadow border hover:scale-110 transition"
                >
                  <Instagram size={22} className="text-pink-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Contact;
