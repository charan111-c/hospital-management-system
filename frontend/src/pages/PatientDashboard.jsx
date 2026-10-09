import { useEffect, useMemo, useState } from "react";
import {
    CalendarCheck,
    Clock3,
    FileText,
    Pill,
    CreditCard,
    UserRound,
    Stethoscope,
    ArrowRight,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [billing, setBilling] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ========================================
    // GET ARRAY FROM API RESPONSE
    // ========================================
    const getArray = (response, possibleKeys = []) => {
        const data = response?.data;

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        for (const key of possibleKeys) {
            if (Array.isArray(data?.[key])) {
                return data[key];
            }
        }

        return [];
    };

    // ========================================
    // LOAD USER
    // ========================================
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Invalid user data:", err);
            }
        }
    }, []);

    // ========================================
    // FETCH PATIENT DATA
    // ========================================
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const results = await Promise.allSettled([
                // PATIENT-SPECIFIC APPOINTMENTS
                api.get("/appointments/my"),

                // These will be fixed separately
                api.get("/medical-records"),
                api.get("/prescriptions"),
                api.get("/billing"),
            ]);

            const [
                appointmentsResult,
                recordsResult,
                prescriptionsResult,
                billingResult,
            ] = results;

            // ========================================
            // APPOINTMENTS
            // ========================================
            if (appointmentsResult.status === "fulfilled") {
                setAppointments(
                    getArray(
                        appointmentsResult.value,
                        ["appointments"]
                    )
                );
            } else {
                console.error(
                    "Appointments error:",
                    appointmentsResult.reason
                );

                setAppointments([]);
            }

            // ========================================
            // MEDICAL RECORDS
            // ========================================
            if (recordsResult.status === "fulfilled") {
                setMedicalRecords(
                    getArray(
                        recordsResult.value,
                        ["records", "medicalRecords"]
                    )
                );
            } else {
                console.error(
                    "Medical records error:",
                    recordsResult.reason
                );

                setMedicalRecords([]);
            }

            // ========================================
            // PRESCRIPTIONS
            // ========================================
            if (prescriptionsResult.status === "fulfilled") {
                setPrescriptions(
                    getArray(
                        prescriptionsResult.value,
                        ["prescriptions"]
                    )
                );
            } else {
                console.error(
                    "Prescriptions error:",
                    prescriptionsResult.reason
                );

                setPrescriptions([]);
            }

            // ========================================
            // BILLING
            // ========================================
            if (billingResult.status === "fulfilled") {
                setBilling(
                    getArray(
                        billingResult.value,
                        ["bills", "billing"]
                    )
                );
            } else {
                console.error(
                    "Billing error:",
                    billingResult.reason
                );

                setBilling([]);
            }

            // ========================================
            // CHECK ALL REQUESTS
            // ========================================
            const failedRequests = results.filter(
                (result) => result.status === "rejected"
            );

            if (failedRequests.length === results.length) {
                setError(
                    "Unable to load your dashboard. Please check the backend server."
                );
            }

        } catch (err) {
            console.error(
                "Patient dashboard error:",
                err
            );

            setError(
                "Failed to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // INITIAL LOAD
    // ========================================
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // ========================================
    // FORMAT DATE
    // ========================================
    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return String(date);
        }

        return value.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ========================================
    // FORMAT TIME
    // ========================================
    const formatTime = (time) => {
        if (!time) {
            return "—";
        }

        const parts = String(time).split(":");

        if (parts.length < 2) {
            return String(time);
        }

        let hour = Number(parts[0]);
        const minute = parts[1];

        const period = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${period}`;
    };

    // ========================================
    // FORMAT CURRENCY
    // ========================================
    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        )}`;
    };

    // ========================================
    // CURRENT PATIENT ID
    // ========================================
    const patientId =
        user?.patient_id ||
        user?.patientId ||
        user?.id;

    // ========================================
    // PATIENT APPOINTMENTS
    // ========================================
    const patientAppointments = useMemo(() => {

        // Since /appointments/my already returns
        // patient-specific appointments, we can use
        // the response directly.

        if (!patientId) {
            return appointments;
        }

        const filtered = appointments.filter(
            (appointment) => {
                return (
                    String(
                        appointment.patient_id
                    ) === String(patientId) ||
                    String(
                        appointment.user_id
                    ) === String(patientId)
                );
            }
        );

        /*
         * The backend /appointments/my endpoint
         * already filters using the authenticated
         * user's ID.
         *
         * Therefore, if the response doesn't contain
         * patient_id in the expected format, we still
         * display the API response.
         */
        return filtered.length > 0
            ? filtered
            : appointments;

    }, [appointments, patientId]);

    // ========================================
    // UPCOMING APPOINTMENTS
    // ========================================
    const upcomingAppointments = useMemo(() => {

        const now = new Date();

        return [...patientAppointments]
            .filter((appointment) => {

                if (!appointment.appointment_date) {
                    return false;
                }

                const appointmentDate =
                    new Date(
                        `${String(
                            appointment.appointment_date
                        ).split("T")[0]}T${
                            appointment.appointment_time ||
                            "00:00:00"
                        }`
                    );

                return appointmentDate >= now;
            })
            .sort((a, b) => {

                const dateA =
                    new Date(
                        `${String(
                            a.appointment_date
                        ).split("T")[0]}T${
                            a.appointment_time ||
                            "00:00:00"
                        }`
                    );

                const dateB =
                    new Date(
                        `${String(
                            b.appointment_date
                        ).split("T")[0]}T${
                            b.appointment_time ||
                            "00:00:00"
                        }`
                    );

                return dateA - dateB;
            });

    }, [patientAppointments]);

    // ========================================
    // RECENT APPOINTMENTS
    // ========================================
    const recentAppointments = useMemo(() => {

        return [...patientAppointments]
            .sort((a, b) => {

                const dateA =
                    new Date(
                        `${String(
                            a.appointment_date || ""
                        ).split("T")[0]} ${
                            a.appointment_time || ""
                        }`
                    );

                const dateB =
                    new Date(
                        `${String(
                            b.appointment_date || ""
                        ).split("T")[0]} ${
                            b.appointment_time || ""
                        }`
                    );

                return dateB - dateA;
            })
            .slice(0, 5);

    }, [patientAppointments]);

    // ========================================
    // PENDING BILLS
    // ========================================
    const pendingBills = useMemo(() => {

        return billing.filter((bill) => {

            const status = String(
                bill.payment_status ||
                bill.status ||
                ""
            ).toLowerCase();

            return (
                status === "pending" ||
                status === "partially paid" ||
                status === "unpaid"
            );
        });

    }, [billing]);

    // ========================================
    // TOTAL PENDING AMOUNT
    // ========================================
    const pendingAmount = useMemo(() => {

        return pendingBills.reduce(
            (total, bill) => {

                return (
                    total +
                    Number(
                        bill.total_amount ||
                        bill.amount ||
                        bill.balance ||
                        0
                    )
                );
            },
            0
        );

    }, [pendingBills]);

    // ========================================
    // STATUS CLASS
    // ========================================
    const getStatusClass = (status) => {

        const value = String(
            status || ""
        ).toLowerCase();

        if (
            value === "completed" ||
            value === "confirmed" ||
            value === "paid"
        ) {
            return "bg-green-50 text-green-700";
        }

        if (value === "cancelled") {
            return "bg-red-50 text-red-700";
        }

        if (
            value === "pending" ||
            value === "partially paid"
        ) {
            return "bg-amber-50 text-amber-700";
        }

        return "bg-blue-50 text-blue-700";
    };

    // ========================================
    // UI
    // ========================================
    return (
        <div className="space-y-6">

            {/* ========================================
                HEADER
            ======================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <p className="text-sm font-medium text-blue-600">
                        Patient Portal
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                        Welcome back
                        {user?.name
                            ? `, ${user.name}`
                            : ""}!
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your appointments,
                        medical records, prescriptions
                        and bills.
                    </p>

                </div>

                <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >

                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* ========================================
                ERROR
            ======================================== */}

            {error && (

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                    <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0"
                    />

                    <div>

                        <p className="font-semibold">
                            Dashboard Error
                        </p>

                        <p className="mt-1">
                            {error}
                        </p>

                    </div>

                </div>
            )}


            {/* ========================================
                STAT CARDS
            ======================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* APPOINTMENTS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-500">
                                My Appointments
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : patientAppointments.length}
                            </h2>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/appointments"
                                    )
                                }
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                                View appointments
                                <ArrowRight size={13} />
                            </button>

                        </div>

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <CalendarCheck size={25} />
                        </div>

                    </div>

                </div>


                {/* MEDICAL RECORDS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-500">
                                Medical Records
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : medicalRecords.length}
                            </h2>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/medical-records"
                                    )
                                }
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                            >
                                View records
                                <ArrowRight size={13} />
                            </button>

                        </div>

                        <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                            <FileText size={25} />
                        </div>

                    </div>

                </div>


                {/* PRESCRIPTIONS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-500">
                                Prescriptions
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : prescriptions.length}
                            </h2>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/prescriptions"
                                    )
                                }
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700"
                            >
                                View prescriptions
                                <ArrowRight size={13} />
                            </button>

                        </div>

                        <div className="rounded-xl bg-green-50 p-3 text-green-600">
                            <Pill size={25} />
                        </div>

                    </div>

                </div>


                {/* PENDING BILLS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-500">
                                Pending Bills
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : formatCurrency(
                                        pendingAmount
                                    )}
                            </h2>

                            <p className="mt-2 text-xs text-amber-600">
                                {pendingBills.length} pending bill
                                {pendingBills.length !== 1
                                    ? "s"
                                    : ""}
                            </p>

                        </div>

                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                            <CreditCard size={25} />
                        </div>

                    </div>

                </div>

            </div>


            {/* ========================================
                UPCOMING APPOINTMENT
            ======================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div>

                        <h2 className="font-bold text-slate-800">
                            Upcoming Appointment
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Your next scheduled hospital visit
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/appointments"
                            )
                        }
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                        View all
                    </button>

                </div>


                {upcomingAppointments.length === 0 ? (

                    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">

                        <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                            <CalendarCheck size={28} />
                        </div>

                        <p className="mt-3 font-semibold text-slate-700">
                            No upcoming appointments
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            You don't have any upcoming appointments.
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    "/appointments"
                                )
                            }
                            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Book Appointment
                        </button>

                    </div>

                ) : (

                    <div className="p-5">

                        {upcomingAppointments
                            .slice(0, 1)
                            .map(
                                (appointment) => (

                                    <div
                                        key={
                                            appointment.id
                                        }
                                        className="rounded-2xl bg-blue-50 p-5"
                                    >

                                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                                            <div className="flex items-center gap-4">

                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                                                    <Stethoscope
                                                        size={
                                                            28
                                                        }
                                                    />
                                                </div>

                                                <div>

                                                    <p className="text-lg font-bold text-slate-800">

                                                        Dr.{" "}

                                                        {appointment.doctor_name ||
                                                            `Doctor #${appointment.doctor_id}`}

                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">

                                                        {appointment.reason ||
                                                            "Medical consultation"}

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="flex flex-wrap gap-3">

                                                <div className="rounded-xl bg-white px-4 py-3">

                                                    <p className="text-xs text-slate-400">
                                                        Date
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold text-slate-700">

                                                        {formatDate(
                                                            appointment.appointment_date
                                                        )}

                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-white px-4 py-3">

                                                    <p className="text-xs text-slate-400">
                                                        Time
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold text-slate-700">

                                                        {formatTime(
                                                            appointment.appointment_time
                                                        )}

                                                    </p>

                                                </div>


                                                <div className="rounded-xl bg-white px-4 py-3">

                                                    <p className="text-xs text-slate-400">
                                                        Status
                                                    </p>

                                                    <span
                                                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(
                                                            appointment.status
                                                        )}`}
                                                    >

                                                        {appointment.status ||
                                                            "Scheduled"}

                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                    </div>

                )}

            </div>


            {/* ========================================
                RECENT APPOINTMENTS + PROFILE
            ======================================== */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* RECENT APPOINTMENTS */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>

                            <h2 className="font-bold text-slate-800">
                                Recent Appointments
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Your recent hospital visits
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/appointments"
                                )
                            }
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            View all
                        </button>

                    </div>


                    <div className="divide-y divide-slate-100">

                        {recentAppointments.length === 0 ? (

                            <div className="p-8 text-center text-sm text-slate-500">
                                No appointment records found.
                            </div>

                        ) : (

                            recentAppointments.map(
                                (appointment) => (

                                    <div
                                        key={
                                            appointment.id
                                        }
                                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                <Clock3
                                                    size={18}
                                                />
                                            </div>

                                            <div>

                                                <p className="font-semibold text-slate-800">

                                                    Dr.{" "}

                                                    {appointment.doctor_name ||
                                                        `Doctor #${appointment.doctor_id}`}

                                                </p>

                                                <p className="text-xs text-slate-500">

                                                    {appointment.reason ||
                                                        "Medical consultation"}

                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex items-center gap-3">

                                            <div className="text-right">

                                                <p className="text-sm font-medium text-slate-700">

                                                    {formatDate(
                                                        appointment.appointment_date
                                                    )}

                                                </p>

                                                <p className="text-xs text-slate-500">

                                                    {formatTime(
                                                        appointment.appointment_time
                                                    )}

                                                </p>

                                            </div>


                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                    appointment.status
                                                )}`}
                                            >

                                                {appointment.status ||
                                                    "Scheduled"}

                                            </span>

                                        </div>

                                    </div>
                                )
                            )

                        )}

                    </div>

                </div>


                {/* PROFILE */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-5 py-4">

                        <h2 className="font-bold text-slate-800">
                            My Profile
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Your account information
                        </p>

                    </div>


                    <div className="p-5">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">

                                <UserRound size={28} />

                            </div>


                            <div>

                                <p className="font-bold text-slate-800">
                                    {user?.name ||
                                        "Patient"}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {user?.email ||
                                        "Patient account"}
                                </p>

                            </div>

                        </div>


                        <div className="mt-5 space-y-3">

                            <div className="rounded-xl bg-slate-50 p-3">

                                <p className="text-xs text-slate-400">
                                    Role
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                    Patient
                                </p>

                            </div>


                            <div className="rounded-xl bg-slate-50 p-3">

                                <p className="text-xs text-slate-400">
                                    Appointments
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                    {patientAppointments.length}
                                </p>

                            </div>

                        </div>


                        <button
                            onClick={() =>
                                navigate(
                                    "/profile"
                                )
                            }
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >

                            View Profile

                            <ArrowRight size={16} />

                        </button>

                    </div>

                </div>

            </div>


            {/* ========================================
                QUICK ACTIONS
            ======================================== */}

            <div>

                <h2 className="mb-4 text-lg font-bold text-slate-800">
                    Quick Actions
                </h2>


                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                    {/* APPOINTMENTS */}

                    <button
                        onClick={() =>
                            navigate(
                                "/appointments"
                            )
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">

                            <CalendarCheck
                                size={22}
                            />

                        </div>

                        <p className="font-semibold text-slate-800">
                            Appointments
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            View your appointments
                        </p>

                        <ArrowRight
                            size={16}
                            className="mt-3 text-slate-400 transition group-hover:translate-x-1"
                        />

                    </button>


                    {/* MEDICAL RECORDS */}

                    <button
                        onClick={() =>
                            navigate(
                                "/medical-records"
                            )
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="mb-4 inline-flex rounded-xl bg-cyan-50 p-3 text-cyan-600">

                            <FileText
                                size={22}
                            />

                        </div>

                        <p className="font-semibold text-slate-800">
                            Medical Records
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            View medical history
                        </p>

                        <ArrowRight
                            size={16}
                            className="mt-3 text-slate-400 transition group-hover:translate-x-1"
                        />

                    </button>


                    {/* PRESCRIPTIONS */}

                    <button
                        onClick={() =>
                            navigate(
                                "/prescriptions"
                            )
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="mb-4 inline-flex rounded-xl bg-green-50 p-3 text-green-600">

                            <Pill
                                size={22}
                            />

                        </div>

                        <p className="font-semibold text-slate-800">
                            Prescriptions
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            View your medicines
                        </p>

                        <ArrowRight
                            size={16}
                            className="mt-3 text-slate-400 transition group-hover:translate-x-1"
                        />

                    </button>


                    {/* BILLING */}

                    <button
                        onClick={() =>
                            navigate(
                                "/billing"
                            )
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-3 text-amber-600">

                            <CreditCard
                                size={22}
                            />

                        </div>

                        <p className="font-semibold text-slate-800">
                            Bills
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            View your hospital bills
                        </p>

                        <ArrowRight
                            size={16}
                            className="mt-3 text-slate-400 transition group-hover:translate-x-1"
                        />

                    </button>

                </div>

            </div>


            {/* ========================================
                HEALTH STATUS
            ======================================== */}

            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-white p-3 text-green-600 shadow-sm">

                        <CheckCircle2
                            size={24}
                        />

                    </div>


                    <div>

                        <h3 className="font-bold text-green-800">
                            Your Patient Portal is Active
                        </h3>

                        <p className="mt-1 text-sm text-green-700">
                            You can access your appointments,
                            medical records, prescriptions and
                            billing information from this dashboard.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default PatientDashboard;