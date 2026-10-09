import { useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Stethoscope,
    ArrowRight,
    Activity,
} from "lucide-react";

import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ========================================
    // HANDLE INPUT
    // ========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };


    // ========================================
    // LOGIN
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.email.trim()) {
            setError(
                "Please enter your email address."
            );
            return;
        }

        if (!formData.password) {
            setError(
                "Please enter your password."
            );
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response =
                await api.post(
                    "/auth/login",
                    {
                        email:
                            formData.email
                                .trim()
                                .toLowerCase(),

                        password:
                            formData.password
                    }
                );

            const data = response.data;

            // ========================================
            // STORE TOKEN
            // ========================================

            if (data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );
            }

            // ========================================
            // STORE USER
            // ========================================

            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            // ========================================
            // REDIRECT
            // ========================================

            navigate(
                "/dashboard",
                {
                    replace: true
                }
            );

        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Invalid email or password."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-950">

            <div className="grid min-h-screen lg:grid-cols-2">

                {/* ========================================
                    LEFT SIDE
                ======================================== */}

                <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 lg:flex">

                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

                    <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

                        {/* Logo */}

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                                <Stethoscope size={27} />
                            </div>

                            <div>
                                <p className="text-lg font-bold text-white">
                                    MediCare
                                </p>

                                <p className="text-xs text-blue-100">
                                    Hospital Management
                                </p>
                            </div>

                        </div>


                        {/* Main */}

                        <div className="max-w-xl">

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-50 backdrop-blur">

                                <Activity size={16} />

                                Smart Healthcare Management

                            </div>

                            <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">

                                Manage your hospital

                                <span className="block text-blue-200">
                                    smarter and faster.
                                </span>

                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-blue-100">

                                A centralized hospital management
                                platform for patients, doctors,
                                appointments, medical records,
                                prescriptions, medicines and billing.

                            </p>


                            <div className="mt-8 grid grid-cols-2 gap-4">

                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                                    <ShieldCheck
                                        size={21}
                                        className="text-blue-200"
                                    />

                                    <p className="mt-3 text-sm font-semibold text-white">
                                        Secure Access
                                    </p>

                                    <p className="mt-1 text-xs text-blue-100">
                                        Role-based authentication
                                    </p>

                                </div>


                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                                    <Activity
                                        size={21}
                                        className="text-blue-200"
                                    />

                                    <p className="mt-3 text-sm font-semibold text-white">
                                        Real-time Data
                                    </p>

                                    <p className="mt-1 text-xs text-blue-100">
                                        Centralized hospital records
                                    </p>

                                </div>

                            </div>

                        </div>


                        <p className="text-xs text-blue-200">
                            © 2026 MediCare Hospital Management System
                        </p>

                    </div>

                </div>


                {/* ========================================
                    RIGHT SIDE
                ======================================== */}

                <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

                    <div className="w-full max-w-md">

                        {/* Mobile logo */}

                        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                                <Stethoscope size={26} />
                            </div>

                            <div>
                                <p className="text-lg font-bold text-slate-800">
                                    MediCare
                                </p>

                                <p className="text-xs text-slate-500">
                                    Hospital Management
                                </p>
                            </div>

                        </div>


                        {/* Login card */}

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">

                            <div className="mb-8">

                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <LockKeyhole size={23} />
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800">
                                    Welcome back
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Sign in to access your hospital
                                    management dashboard.
                                </p>

                            </div>


                            {/* Error */}

                            {error && (
                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}


                            {/* Form */}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/* Email */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Email Address
                                    </label>

                                    <div className="relative">

                                        <Mail
                                            size={19}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Password */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Password
                                    </label>

                                    <div className="relative">

                                        <LockKeyhole
                                            size={19}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                        >

                                            {showPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}

                                        </button>

                                    </div>

                                </div>


                                {/* Login */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {loading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In

                                            <ArrowRight
                                                size={18}
                                                className="transition group-hover:translate-x-1"
                                            />
                                        </>
                                    )}

                                </button>

                            </form>


                            {/* Register */}

                            <div className="mt-6 border-t border-slate-100 pt-6 text-center">

                                <p className="text-sm text-slate-600">

                                    Don't have an account?{" "}

                                    <Link
                                        to="/register"
                                        className="font-semibold text-blue-600 hover:underline"
                                    >
                                        Register Here
                                    </Link>

                                </p>

                            </div>


                            {/* Security */}

                            <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">

                                <ShieldCheck
                                    size={19}
                                    className="mt-0.5 shrink-0 text-green-600"
                                />

                                <p className="text-xs leading-5 text-slate-500">
                                    Your session is protected using
                                    secure authentication and
                                    role-based access control.
                                </p>

                            </div>

                        </div>


                        <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
                            © 2026 MediCare Hospital Management System
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;