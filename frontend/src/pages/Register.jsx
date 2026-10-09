import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Stethoscope,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "PATIENT",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


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
        setSuccess("");
    };


    // ========================================
    // VALIDATE
    // ========================================

    const validateForm = () => {

        if (!formData.name.trim()) {
            return "Please enter your full name.";
        }

        if (!formData.email.trim()) {
            return "Please enter your email address.";
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailPattern.test(
                formData.email.trim()
            )
        ) {
            return "Please enter a valid email address.";
        }

        if (!formData.phone.trim()) {
            return "Please enter your phone number.";
        }

        const phonePattern =
            /^[0-9]{10}$/;

        if (
            !phonePattern.test(
                formData.phone.trim()
            )
        ) {
            return "Phone number must contain exactly 10 digits.";
        }

        if (!formData.role) {
            return "Please select a role.";
        }

        if (!formData.password) {
            return "Please enter a password.";
        }

        if (formData.password.length < 6) {
            return "Password must contain at least 6 characters.";
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            return "Passwords do not match.";
        }

        return "";
    };


    // ========================================
    // REGISTER
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            setLoading(true);

            const response =
                await api.post(
                    "/auth/register",
                    {
                        name:
                            formData.name.trim(),

                        email:
                            formData.email
                                .trim()
                                .toLowerCase(),

                        phone:
                            formData.phone.trim(),

                        role:
                            formData.role,

                        password:
                            formData.password
                    }
                );

            setSuccess(
                response.data?.message ||
                "Registration successful!"
            );

            // Clear form
            setFormData({
                name: "",
                email: "",
                phone: "",
                role: "PATIENT",
                password: "",
                confirmPassword: "",
            });

            // Redirect to login
            setTimeout(() => {
                navigate("/login");
            }, 1800);

        } catch (err) {

            console.error(
                "Registration error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 px-4 py-8">

            <div className="flex min-h-screen items-center justify-center">

                <div className="w-full max-w-lg">

                    {/* ========================================
                        LOGO
                    ======================================== */}

                    <div className="mb-6 flex items-center justify-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur">
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


                    {/* ========================================
                        REGISTER CARD
                    ======================================== */}

                    <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">

                        {/* Header */}

                        <div className="mb-7 text-center">

                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <User size={24} />
                            </div>

                            <h1 className="text-2xl font-bold text-slate-800">
                                Create Account
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Register for the Hospital
                                Management System.
                            </p>

                        </div>


                        {/* ========================================
                            ERROR
                        ======================================== */}

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}


                        {/* ========================================
                            SUCCESS
                        ======================================== */}

                        {success && (
                            <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />

                                <span>
                                    {success}
                                </span>

                            </div>
                        )}


                        {/* ========================================
                            FORM
                        ======================================== */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* NAME */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Full Name
                                </label>

                                <div className="relative">

                                    <User
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your full name"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Email Address
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={18}
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
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* PHONE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Phone Number
                                </label>

                                <div className="relative">

                                    <Phone
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="10 digit phone number"
                                        maxLength={10}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* ROLE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Register As
                                </label>

                                <select
                                    name="role"
                                    value={
                                        formData.role
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                >

                                    <option value="PATIENT">
                                        Patient
                                    </option>

                                    <option value="DOCTOR">
                                        Doctor
                                    </option>

                                    <option value="RECEPTIONIST">
                                        Receptionist
                                    </option>

                                </select>

                                <p className="mt-2 text-xs text-slate-400">
                                    Admin accounts are created
                                    securely by the system
                                    administrator.
                                </p>

                            </div>


                            {/* PASSWORD */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Password
                                </label>

                                <div className="relative">

                                    <Lock
                                        size={18}
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
                                        placeholder="Create a password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>

                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Minimum 6 characters.
                                </p>

                            </div>


                            {/* CONFIRM PASSWORD */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Confirm Password
                                </label>

                                <div className="relative">

                                    <Lock
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Confirm your password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>

                                </div>

                            </div>


                            {/* REGISTER BUTTON */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account

                                        <ArrowRight
                                            size={18}
                                            className="transition group-hover:translate-x-1"
                                        />
                                    </>
                                )}

                            </button>

                        </form>


                        {/* ========================================
                            SECURITY
                        ======================================== */}

                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4">

                            <ShieldCheck
                                size={19}
                                className="mt-0.5 shrink-0 text-green-600"
                            />

                            <p className="text-xs leading-5 text-slate-500">
                                Your password is securely hashed
                                before being stored in the database.
                            </p>

                        </div>


                        {/* ========================================
                            LOGIN LINK
                        ======================================== */}

                        <p className="mt-6 text-center text-sm text-slate-600">

                            Already have an account?{" "}

                            <Link
                                to="/login"
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                Login Here
                            </Link>

                        </p>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Register;