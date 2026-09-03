import { useContext, useEffect, useState } from "react";
import { Eye, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import AuthLayout, { AuthInput, AuthSubmitButton } from "../components/auth/AuthLayout";

const errorMessages = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "Email and password sign-in is not enabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Unable to connect. Please check your internet connection and try again.",
};

const getAuthErrorMessage = (error) => errorMessages[error.code] || "Unable to sign in. Please try again.";

const Login = () => {
    const { user, loginWithGoogle, loginWithEmail } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/", { replace: true });
    }, [user, navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        if (!email.trim() || !password) {
            toast.warn("Please enter your email and password.");
            return;
        }
        setIsSubmitting(true);
        try {
            await loginWithEmail(email.trim(), password);
        } catch (error) {
            toast.error(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            toast.error(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="Welcome back"
            title="Sign in to UtilityPro"
            description="Access your tools and keep your workflow moving."
            footer={<>Don't have an account? <Link to="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700">Sign up</Link></>}
        >
            <form className="space-y-5" onSubmit={handleLogin} noValidate>
                <AuthInput icon={Mail} id="login-email" label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" />
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
                        <Link to="/auth/forgetpassword" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                        <input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                        <Eye className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                    </div>
                </div>
                <AuthSubmitButton loading={isSubmitting} loadingText="Signing in...">Sign in</AuthSubmitButton>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with<span className="h-px flex-1 bg-slate-200" /></div>
            <button type="button" onClick={handleGoogleLogin} disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60">
                <img src="https://img.icons8.com/?size=28&id=17949&format=png&color=000000" alt="" className="h-5 w-5" /> Continue with Google
            </button>
        </AuthLayout>
    );
};

export default Login;
