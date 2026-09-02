import Home from "./pages/Home";
import Tools from "./pages/Tools";
import Tool from "./tools/Tool";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignUp from "./auth/Signup";
import LogIn from "./auth/LogIn";
import Profile from "./auth/Profile";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
   return (
      <>
         <Router basename="/">
            <Routes>
               <Route path="/" element={<Home />} />
               <Route path="/tools" element={<Tools />} />
               <Route path="/tools/*" element={<Tool />} />
               <Route path="/about" element={<About />} />
               <Route path="/contact" element={<Contact />} />
               <Route path="/signup" element={<SignUp />} />
               <Route path="/login" element={<LogIn />} />
               <Route path="/profile" element={<Profile />} />
            </Routes>
         </Router>
         {/* Global Toasts */}
         <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored" // or "light" / "dark"
         />
      </>
   );
}

export default App;
