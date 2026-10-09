import { useEffect, useMemo, useState } from "react";
import {
    Users,
    Stethoscope,
    CalendarCheck,
    IndianRupee,
    Building2,
    Pill,
    FileText,
    CreditCard,
    ArrowRight,
    Activity,
    CheckCircle2,
    Clock3,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [billing, setBilling] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [user, setUser] = useState(null);

    // ========================================
    // GET ARRAY FROM API RESPONSE
    // ========================================
    const getArray = (response) => {
        const data = response?.data;

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data?.patients)) {
            return data.patients;
        }

        if (Array.isArray(data?.doctors)) {
            return data.doctors;
        }

        if (Array.isArray(data?.appointments)) {
            return data.appointments;
        }

        if (Array.isArray(data?.departments)) {
            return data.departments;
        }

        if (Array.isArray(data?.medicines)) {
            return data.medicines;
        }

        if (Array.isArray(data?.records)) {
            return data.records;
        }

        if (Array.isArray(data?.prescriptions)) {
            return data.prescriptions;
        }

        if (Array.isArray(data?.bills)) {
            return data.bills;
        }

        return [];
    };

    // ========================================
    // FETCH DASHBOARD DATA
    // ========================================
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const results = await Promise.allSettled([
                api.get("/patients"),
                api.get("/doctors"),
                api.get("/appointments"),
                api.get("/departments"),
                api.get("/medicines"),
                api.get("/medical-records"),
                api.get("/prescriptions"),
                api.get("/billing"),
            ]);

            const [
                patientsResult,
                doctorsResult,
                appointmentsResult,
                departmentsResult,
                medicinesResult,
                recordsResult,
                prescriptionsResult,
                billingResult,
            ] = results;

            if (patientsResult.status === "fulfilled") {
                setPatients(getArray(patientsResult.value));
            }

            if (doctorsResult.status === "fulfilled") {
                setDoctors(getArray(doctorsResult.value));
            }

            if (appointmentsResult.status === "fulfilled") {
                setAppointments(
                    getArray(appointmentsResult.value)
                );
            }

            if (departmentsResult.status === "fulfilled") {
                setDepartments(
                    getArray(departmentsResult.value)
                );
            }

            if (medicinesResult.status === "fulfilled") {
                setMedicines(
                    getArray(medicinesResult.value)
                );
            }

            if (recordsResult.status === "fulfilled") {
                setMedicalRecords(
                    getArray(recordsResult.value)
                );
            }

            if (prescriptionsResult.status === "fulfilled") {
                setPrescriptions(
                    getArray(prescriptionsResult.value)
                );
            }

            if (billingResult.status === "fulfilled") {
                setBilling(
                    getArray(billingResult.value)
                );
            }

            const failedRequests = results.filter(
                (result) => result.status === "rejected"
            );

            if (failedRequests.length === results.length) {
                setError(
                    "Unable to load dashboard data. Please check the backend server."
                );
            }
        } catch (err) {
            console.error(
                "Dashboard loading error:",
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
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error(
                    "Invalid user data:",
                    err
                );
            }
        }

        fetchDashboardData();
    }, []);

    // ========================================
    // TOTAL REVENUE
    // ========================================
    const totalRevenue = useMemo(() => {
        return billing.reduce((total, bill) => {
            const amount = Number(
                bill.total_amount || 0
            );

            return total + amount;
        }, 0);
    }, [billing]);

    // ========================================
    // PAID REVENUE
    // ========================================
    const paidRevenue = useMemo(() => {
        return billing.reduce((total, bill) => {
            if (
                String(
                    bill.payment_status || ""
                ).toLowerCase() === "paid"
            ) {
                return (
                    total +
                    Number(
                        bill.total_amount || 0
                    )
                );
            }

            return total;
        }, 0);
    }, [billing]);

    // ========================================
    // PENDING BILLS
    // ========================================
    const pendingBills = useMemo(() => {
        return billing.filter((bill) => {
            const status = String(
                bill.payment_status || ""
            ).toLowerCase();

            return (
                status === "pending" ||
                status === "partially paid"
            );
        }).length;
    }, [billing]);

    // ========================================
    // APPOINTMENT COUNTS
    // ========================================
    const appointmentStats = useMemo(() => {
        const stats = {
            total: appointments.length,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
        };

        appointments.forEach((appointment) => {
            const status = String(
                appointment.status || ""
            ).toLowerCase();

            if (
                status === "scheduled" ||
                status === "confirmed"
            ) {
                stats.scheduled++;
            }

            if (status === "completed") {
                stats.completed++;
            }

            if (status === "cancelled") {
                stats.cancelled++;
            }
        });

        return stats;
    }, [appointments]);

    // ========================================
    // TODAY'S APPOINTMENTS
    // ========================================
    const todayAppointments = useMemo(() => {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            today.getDate()
        ).padStart(2, "0");

        const todayString = `${year}-${month}-${day}`;

        return appointments
            .filter((appointment) => {
                if (!appointment.appointment_date) {
                    return false;
                }

                const dateString = String(
                    appointment.appointment_date
                ).split("T")[0];

                return dateString === todayString;
            })
            .sort((a, b) => {
                return String(
                    a.appointment_time || ""
                ).localeCompare(
                    String(
                        b.appointment_time || ""
                    )
                );
            });
    }, [appointments]);

    // ========================================
    // LOW STOCK MEDICINES
    // ========================================
    const lowStockMedicines = useMemo(() => {
        return medicines.filter((medicine) => {
            return Number(
                medicine.quantity || 0
            ) <= 10;
        });
    }, [medicines]);

    // ========================================
    // RECENT APPOINTMENTS
    // ========================================
    const recentAppointments = useMemo(() => {
        return [...appointments]
            .sort((a, b) => {
                const dateA = new Date(
                    `${a.appointment_date || ""} ${
                        a.appointment_time || ""
                    }`
                );

                const dateB = new Date(
                    `${b.appointment_date || ""} ${
                        b.appointment_time || ""
                    }`
                );

                return dateB - dateA;
            })
            .slice(0, 5);
    }, [appointments]);

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

        return value.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
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
            return time;
        }

        let hour = Number(parts[0]);
        const minute = parts[1];

        const period =
            hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${period}`;
    };

    // ========================================
    // FORMAT CURRENCY
    // ========================================
    const formatCurrency = (amount) => {
        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        })}`;
    };

    // ========================================
    // STATUS BADGE
    // ========================================
    const getStatusClass = (status) => {
        const value = String(
            status || ""
        ).toLowerCase();

        if (
            value === "completed" ||
            value === "paid"
        ) {
            return "bg-green-50 text-green-700";
        }

        if (
            value === "cancelled"
        ) {
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

    return (
        <div className="space-y-6">

            {/* ========================================
                HEADER
            ======================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <p className="text-sm font-medium text-blue-600">
                        Hospital Management System
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                        Welcome back
                        {user?.name
                            ? `, ${user.name}`
                            : ""}
                        !
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Here's what's happening in your
                        hospital today.
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
                MAIN STAT CARDS
            ======================================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Patients */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Patients
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : patients.length}
                            </h2>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/patients"
                                    )
                                }
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                                View patients
                                <ArrowRight size={13} />
                            </button>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Users size={25} />
                        </div>

                    </div>
                </div>


                {/* Doctors */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Doctors
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : doctors.length}
                            </h2>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/doctors"
                                    )
                                }
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700"
                            >
                                View doctors
                                <ArrowRight size={13} />
                            </button>
                        </div>

                        <div className="rounded-xl bg-green-50 p-3 text-green-600">
                            <Stethoscope size={25} />
                        </div>

                    </div>
                </div>


                {/* Appointments */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Appointments
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : appointments.length}
                            </h2>

                            <p className="mt-2 text-xs text-slate-500">
                                {appointmentStats.completed} completed
                            </p>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                            <CalendarCheck size={25} />
                        </div>

                    </div>
                </div>


                {/* Revenue */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Revenue
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : formatCurrency(
                                          totalRevenue
                                      )}
                            </h2>

                            <p className="mt-2 text-xs text-green-600">
                                Paid:{" "}
                                {formatCurrency(
                                    paidRevenue
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                            <IndianRupee size={25} />
                        </div>

                    </div>
                </div>

            </div>


            {/* ========================================
                SECONDARY STATS
            ======================================== */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

                <button
                    onClick={() =>
                        navigate("/departments")
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <Building2
                        size={22}
                        className="text-indigo-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Departments
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                        {departments.length}
                    </p>
                </button>


                <button
                    onClick={() =>
                        navigate("/medicines")
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <Pill
                        size={22}
                        className="text-pink-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Medicines
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                        {medicines.length}
                    </p>
                </button>


                <button
                    onClick={() =>
                        navigate(
                            "/medical-records"
                        )
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <FileText
                        size={22}
                        className="text-cyan-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Medical Records
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                        {medicalRecords.length}
                    </p>
                </button>


                <button
                    onClick={() =>
                        navigate("/billing")
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <CreditCard
                        size={22}
                        className="text-orange-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Pending Bills
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                        {pendingBills}
                    </p>
                </button>

            </div>


            {/* ========================================
                TODAY + SYSTEM STATUS
            ======================================== */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                {/* Today's Appointments */}
                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="font-bold text-slate-800">
                                Today's Appointments
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {todayAppointments.length} appointments scheduled
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

                        {todayAppointments.length ===
                        0 ? (
                            <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                                <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                                    <CalendarCheck
                                        size={28}
                                    />
                                </div>

                                <p className="mt-3 font-semibold text-slate-700">
                                    No appointments today
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    There are no appointments
                                    scheduled for today.
                                </p>
                            </div>
                        ) : (
                            todayAppointments
                                .slice(0, 5)
                                .map(
                                    (
                                        appointment
                                    ) => (
                                        <div
                                            key={
                                                appointment.id
                                            }
                                            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                        >

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <Clock3
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {appointment.patient_name ||
                                                            `Patient #${appointment.patient_id}`}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        Dr.{" "}
                                                        {appointment.doctor_name ||
                                                            `Doctor #${appointment.doctor_id}`}
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="flex items-center gap-3">

                                                <span className="text-sm font-semibold text-slate-700">
                                                    {formatTime(
                                                        appointment.appointment_time
                                                    )}
                                                </span>

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


                {/* System Status */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="font-bold text-slate-800">
                            System Overview
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Current hospital system status
                        </p>
                    </div>

                    <div className="space-y-4 p-5">

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-3">
                                <Activity
                                    size={20}
                                    className="text-blue-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Appointments
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Scheduled
                                    </p>
                                </div>
                            </div>

                            <span className="text-lg font-bold text-slate-800">
                                {
                                    appointmentStats.scheduled
                                }
                            </span>
                        </div>


                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2
                                    size={20}
                                    className="text-green-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Completed
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Appointments
                                    </p>
                                </div>
                            </div>

                            <span className="text-lg font-bold text-slate-800">
                                {
                                    appointmentStats.completed
                                }
                            </span>
                        </div>


                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle
                                    size={20}
                                    className="text-amber-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Low Stock
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Medicines
                                    </p>
                                </div>
                            </div>

                            <span className="text-lg font-bold text-slate-800">
                                {
                                    lowStockMedicines.length
                                }
                            </span>
                        </div>


                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-3">
                                <CreditCard
                                    size={20}
                                    className="text-purple-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Pending Bills
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Payment required
                                    </p>
                                </div>
                            </div>

                            <span className="text-lg font-bold text-slate-800">
                                {pendingBills}
                            </span>
                        </div>

                    </div>
                </div>

            </div>


            {/* ========================================
                RECENT APPOINTMENTS + LOW STOCK
            ======================================== */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Recent Appointments */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Recent Appointments
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Latest appointment records
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

                        {recentAppointments.length ===
                        0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                                No appointment records found.
                            </div>
                        ) : (
                            recentAppointments.map(
                                (
                                    appointment
                                ) => (
                                    <div
                                        key={
                                            appointment.id
                                        }
                                        className="flex items-center justify-between gap-3 px-5 py-4"
                                    >

                                        <div className="flex min-w-0 items-center gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                                {String(
                                                    appointment.patient_name ||
                                                        "P"
                                                )
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                    {appointment.patient_name ||
                                                        `Patient #${appointment.patient_id}`}
                                                </p>

                                                <p className="truncate text-xs text-slate-500">
                                                    Dr.{" "}
                                                    {appointment.doctor_name ||
                                                        `Doctor #${appointment.doctor_id}`}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="shrink-0 text-right">

                                            <p className="text-xs font-medium text-slate-600">
                                                {formatDate(
                                                    appointment.appointment_date
                                                )}
                                            </p>

                                            <span
                                                className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClass(
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


                {/* Low Stock Medicines */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Medicine Stock
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Medicines requiring attention
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/medicines"
                                )
                            }
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Manage
                        </button>

                    </div>

                    <div className="divide-y divide-slate-100">

                        {lowStockMedicines.length ===
                        0 ? (
                            <div className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">

                                <div className="rounded-full bg-green-50 p-4 text-green-600">
                                    <CheckCircle2
                                        size={28}
                                    />
                                </div>

                                <p className="mt-3 font-semibold text-slate-700">
                                    Stock looks good
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    No medicines are currently
                                    low in stock.
                                </p>

                            </div>
                        ) : (
                            lowStockMedicines
                                .slice(0, 5)
                                .map(
                                    (
                                        medicine
                                    ) => (
                                        <div
                                            key={
                                                medicine.id
                                            }
                                            className="flex items-center justify-between gap-4 px-5 py-4"
                                        >

                                            <div className="flex items-center gap-3">

                                                <div className="rounded-lg bg-pink-50 p-2 text-pink-600">
                                                    <Pill
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {
                                                            medicine.name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {
                                                            medicine.category ||
                                                            "Medicine"
                                                        }
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-bold text-red-600">
                                                    {
                                                        medicine.quantity
                                                    }
                                                </p>

                                                <p className="text-[10px] text-slate-400">
                                                    units left
                                                </p>
                                            </div>

                                        </div>
                                    )
                                )
                        )}

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

                    <button
                        onClick={() =>
                            navigate("/patients")
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Users size={22} />
                        </div>

                        <p className="font-semibold text-slate-800">
                            Patients
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Manage patients
                        </p>

                        <ArrowRight
                            size={16}
                            className="mt-3 text-slate-400 transition group-hover:translate-x-1"
                        />
                    </button>


                    <button
                        onClick={() =>
                            navigate("/appointments")
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-4 inline-flex rounded-xl bg-purple-50 p-3 text-purple-600">
                            <CalendarCheck size={22} />
                        </div>

                        <p className="font-semibold text-slate-800">
                            Appointments
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Manage appointments
                        </p>

                        <ArrowRight
                            size={16}
                            className="mt-3 text-slate-400 transition group-hover:translate-x-1"
                        />
                    </button>


                    <button
                        onClick={() =>
                            navigate("/prescriptions")
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-4 inline-flex rounded-xl bg-green-50 p-3 text-green-600">
                            <FileText size={22} />
                        </div>

                        <p className="font-semibold text-slate-800">
                            Prescriptions
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Manage prescriptions
                        </p>

                        <ArrowRight
                            size={16}
                            className="mt-3 text-slate-400 transition group-hover:translate-x-1"
                        />
                    </button>


                    <button
                        onClick={() =>
                            navigate("/billing")
                        }
                        className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-3 text-amber-600">
                            <CreditCard size={22} />
                        </div>

                        <p className="font-semibold text-slate-800">
                            Billing
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Manage hospital bills
                        </p>

                        <ArrowRight
                            size={16}
                            className="mt-3 text-slate-400 transition group-hover:translate-x-1"
                        />
                    </button>

                </div>
            </div>

        </div>
    );
}

export default Dashboard;