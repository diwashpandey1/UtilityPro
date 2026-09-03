import { Home } from "lucide-react";
import { Link } from "react-router-dom";

function BrandMark() {
    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2 2 7v10l10 5 10-5V7L12 2Z" />
            </svg>
        </div>
    );
}

export function AuthInput({ icon: Icon, id, label, ...inputProps }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                <input
                    id={id}
                    {...inputProps}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
            </div>
        </div>
    );
}

export function AuthSubmitButton({ children, loading, loadingText }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {loading ? loadingText : children}
        </button>
    );
}

function AuthLayout({ eyebrow, title, description, children, footer }) {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 lg:grid-cols-[0.9fr_1.1fr]">
                    <aside className="relative hidden overflow-hidden bg-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-36 border-white/10" />
                        <div className="absolute -bottom-36 -left-28 h-80 w-80 rounded-full border-44 border-cyan-300/10" />
                        <div className="relative">
                            <BrandMark />
                            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">UtilityPro</p>
                        </div>
                        <div className="relative max-w-sm">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">{eyebrow}</p>
                            <h1 className="mt-4 text-4xl font-bold leading-tight">Tools that keep your day moving.</h1>
                            <p className="mt-5 text-base leading-7 text-blue-100">Simple, useful utilities with one secure place to manage your account.</p>
                        </div>
                        <p className="relative text-xs text-blue-200">Your everyday toolbox, thoughtfully made.</p>
                    </aside>

                    <section className="relative flex items-center justify-center p-6 sm:p-10 lg:p-14">
                        <Link to="/" aria-label="Back to home" className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                            <Home size={20} />
                        </Link>
                        <div className="w-full max-w-md">
                            <div className="mb-8 lg:hidden"><BrandMark /></div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                            <div className="mt-8">{children}</div>
                            {footer && <div className="mt-7 text-center text-sm text-slate-500">{footer}</div>}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default AuthLayout;
