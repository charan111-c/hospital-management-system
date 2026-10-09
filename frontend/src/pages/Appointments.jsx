import { useEffect, useState } from "react";

import {
    CalendarDays,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    Plus,
    X,
    UserRound,
    Stethoscope,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";

import api from "../services/api";


// =========================================================
// DATE FORMAT HELPER
// =========================================================

function formatDateForInput(value) {
    if (!value) {
        return "";
    }

    const dateString = String(value);

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    // ISO format
    // Example: 2026-09-21T00:00:00.000Z
    if (dateString.includes("T")) {
        return dateString.split("T")[0];
    }

    // MySQL datetime
    // Example: 2026-09-21 00:00:00
    if (dateString.includes(" ")) {
        return dateString.split(" ")[0];
    }

    return "";
}


// =========================================================
// TIME FORMAT HELPER
// =========================================================

function formatTimeForInput(value) {
    if (!value) {
        return "";
    }

    const timeString = String(value);

    // HH:mm:ss
    if (/^\d{2}:\d{2}:\d{2}/.test(timeString)) {
        return timeString.substring(0, 5);
    }

    // HH:mm
    if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString;
    }

    // ISO datetime
    if (timeString.includes("T")) {
        const timePart = timeString.split("T")[1];

        return timePart.substring(0, 5);
    }

    return "";
}


// =========================================================
// APPOINTMENT FORM
// =========================================================

function AppointmentForm({
    formData,
    handleChange,
    saving,
    onSubmit,
    onCancel,
    submitText,
}) {
    return (
        <form onSubmit={onSubmit}>

            <div className="space-y-4 p-5">

                {/* PATIENT */}

                <div>

                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Patient
                    </label>

                    <select
                        name="patient_id"
                        value={formData.patient_id}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >

                        <option value="">
                            Select patient
                        </option>

                        {formData.patients?.map((patient) => (
                            <option
                                key={patient.id}
                                value={patient.id}
                            >
                                {patient.name}
                                {" — Patient #"}
                                {patient.id}
                            </option>
                        ))}

                    </select>

                </div>


                {/* DOCTOR */}

                <div>

                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Doctor
                    </label>

                    <select
                        name="doctor_id"
                        value={formData.doctor_id}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >

                        <option value="">
                            Select doctor
                        </option>

                        {formData.doctors?.map((doctor) => (
                            <option
                                key={doctor.id}
                                value={doctor.id}
                            >
                                {doctor.name}
                                {" — "}
                                {doctor.specialization || "Doctor"}
                            </option>
                        ))}

                    </select>

                </div>


                {/* DATE AND TIME */}

                <div className="grid gap-4 sm:grid-cols-2">

                    {/* DATE */}

                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Appointment Date
                        </label>

                        <input
                            type="date"
                            name="appointment_date"
                            value={formData.appointment_date}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>


                    {/* TIME */}

                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Appointment Time
                        </label>

                        <input
                            type="time"
                            name="appointment_time"
                            value={formData.appointment_time}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>


                {/* REASON */}

                <div>

                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Reason
                    </label>

                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter reason for appointment"
                        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                </div>


                {/* STATUS */}

                <div>

                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Status
                    </label>

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Confirmed">
                            Confirmed
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>

                    </select>

                </div>

            </div>


            {/* BUTTONS */}

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    Cancel
                </button>


                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                    {saving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}

                    {saving ? "Saving..." : submitText}

                </button>

            </div>

        </form>
    );
}


// =========================================================
// MAIN COMPONENT
// =========================================================

function Appointments() {

    const [appointments, setAppointments] = useState([]);

    const [patients, setPatients] = useState([]);

    const [doctors, setDoctors] = useState([]);

    const [filteredAppointments, setFilteredAppointments] =
        useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [editingAppointment, setEditingAppointment] =
        useState(null);

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);


    // =========================================================
    // FORM DATA
    // =========================================================

    const [formData, setFormData] = useState({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
        status: "Pending",
    });


    // =========================================================
    // FETCH APPOINTMENTS
    // =========================================================

    const fetchAppointments = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get("/appointments");

            console.log(
                "Appointments:",
                response.data
            );

            let data = [];

            if (Array.isArray(response.data)) {

                data = response.data;

            } else if (
                Array.isArray(
                    response.data?.appointments
                )
            ) {

                data =
                    response.data.appointments;

            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {

                data =
                    response.data.data;
            }

            setAppointments(data);

            setFilteredAppointments(data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load appointments"
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // FETCH PATIENTS
    // =========================================================

    const fetchPatients = async () => {

        try {

            const response =
                await api.get("/patients");

            let data = [];

            if (Array.isArray(response.data)) {

                data = response.data;

            } else if (
                Array.isArray(
                    response.data?.patients
                )
            ) {

                data =
                    response.data.patients;

            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {

                data =
                    response.data.data;
            }

            setPatients(data);

        } catch (err) {

            console.error(
                "Patients error:",
                err
            );
        }
    };


    // =========================================================
    // FETCH DOCTORS
    // =========================================================

    const fetchDoctors = async () => {

        try {

            const response =
                await api.get("/doctors");

            let data = [];

            if (Array.isArray(response.data)) {

                data = response.data;

            } else if (
                Array.isArray(
                    response.data?.doctors
                )
            ) {

                data =
                    response.data.doctors;

            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {

                data =
                    response.data.data;
            }

            setDoctors(data);

        } catch (err) {

            console.error(
                "Doctors error:",
                err
            );
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchAppointments();

        fetchPatients();

        fetchDoctors();

    }, []);


    // =========================================================
    // SEARCH
    // =========================================================

    useEffect(() => {

        const value =
            search.toLowerCase().trim();

        if (!value) {

            setFilteredAppointments(
                appointments
            );

            return;
        }

        const filtered =
            appointments.filter(
                (appointment) => {

                    const patientName =
                        getPatientName(
                            appointment
                        ).toLowerCase();

                    const doctorName =
                        getDoctorName(
                            appointment
                        ).toLowerCase();

                    const status =
                        String(
                            appointment.status || ""
                        ).toLowerCase();

                    const reason =
                        String(
                            appointment.reason || ""
                        ).toLowerCase();

                    const id =
                        String(
                            appointment.id || ""
                        );

                    return (
                        patientName.includes(value) ||
                        doctorName.includes(value) ||
                        status.includes(value) ||
                        reason.includes(value) ||
                        id.includes(value)
                    );
                }
            );

        setFilteredAppointments(
            filtered
        );

    }, [
        search,
        appointments,
        patients,
        doctors,
    ]);


    // =========================================================
    // HELPERS
    // =========================================================

    function getPatientName(appointment) {

        if (appointment.patient_name) {
            return appointment.patient_name;
        }

        const patient =
            patients.find(
                (item) =>
                    String(item.id) ===
                    String(
                        appointment.patient_id
                    )
            );

        return (
            patient?.name ||
            `Patient #${appointment.patient_id}`
        );
    }


    function getDoctorName(appointment) {

        if (appointment.doctor_name) {
            return appointment.doctor_name;
        }

        const doctor =
            doctors.find(
                (item) =>
                    String(item.id) ===
                    String(
                        appointment.doctor_id
                    )
            );

        return (
            doctor?.name ||
            `Doctor #${appointment.doctor_id}`
        );
    }


    function getStatusClass(status) {

        switch (
            String(status || "").toLowerCase()
        ) {

            case "completed":
                return "bg-green-50 text-green-700";

            case "cancelled":
                return "bg-red-50 text-red-700";

            case "confirmed":
                return "bg-blue-50 text-blue-700";

            default:
                return "bg-amber-50 text-amber-700";
        }
    }


    function getStatusIcon(status) {

        switch (
            String(status || "").toLowerCase()
        ) {

            case "completed":
                return (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                );

            case "cancelled":
                return (
                    <XCircle className="h-3.5 w-3.5" />
                );

            case "confirmed":
                return (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                );

            default:
                return (
                    <AlertCircle className="h-3.5 w-3.5" />
                );
        }
    }


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {

        setFormData({
            patient_id: "",
            doctor_id: "",
            appointment_date: "",
            appointment_time: "",
            reason: "",
            status: "Pending",
        });
    };


    // =========================================================
    // ADD MODAL
    // =========================================================

    const openAddModal = () => {

        resetForm();

        setShowAddModal(true);
    };


    const closeAddModal = () => {

        setShowAddModal(false);

        resetForm();
    };


    // =========================================================
    // ADD APPOINTMENT
    // =========================================================

    const handleAddAppointment = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            await api.post(
                "/appointments",
                {
                    patient_id:
                        Number(
                            formData.patient_id
                        ),

                    doctor_id:
                        Number(
                            formData.doctor_id
                        ),

                    appointment_date:
                        formData.appointment_date,

                    appointment_time:
                        formData.appointment_time,

                    reason:
                        formData.reason.trim(),

                    status:
                        formData.status,
                }
            );

            alert(
                "Appointment created successfully!"
            );

            closeAddModal();

            await fetchAppointments();

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to create appointment"
            );

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // EDIT MODAL
    // =========================================================

    const openEditModal = (appointment) => {

        setEditingAppointment(
            appointment
        );

        setFormData({

            patient_id:
                String(
                    appointment.patient_id || ""
                ),

            doctor_id:
                String(
                    appointment.doctor_id || ""
                ),

            appointment_date:
                formatDateForInput(
                    appointment.appointment_date ||
                    appointment.date
                ),

            appointment_time:
                formatTimeForInput(
                    appointment.appointment_time ||
                    appointment.time
                ),

            reason:
                appointment.reason || "",

            status:
                appointment.status ||
                "Pending",
        });

        setShowEditModal(true);
    };


    const closeEditModal = () => {

        setShowEditModal(false);

        setEditingAppointment(null);

        resetForm();
    };


    // =========================================================
    // UPDATE APPOINTMENT
    // =========================================================

    const handleUpdateAppointment = async (e) => {

        e.preventDefault();

        if (!editingAppointment) {
            return;
        }

        try {

            setSaving(true);

            await api.put(
                `/appointments/${editingAppointment.id}`,
                {
                    patient_id:
                        Number(
                            formData.patient_id
                        ),

                    doctor_id:
                        Number(
                            formData.doctor_id
                        ),

                    appointment_date:
                        formData.appointment_date,

                    appointment_time:
                        formData.appointment_time,

                    reason:
                        formData.reason.trim(),

                    status:
                        formData.status,
                }
            );

            alert(
                "Appointment updated successfully!"
            );

            closeEditModal();

            await fetchAppointments();

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to update appointment"
            );

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this appointment?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/appointments/${id}`
            );

            alert(
                "Appointment deleted successfully!"
            );

            await fetchAppointments();

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to delete appointment"
            );
        }
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="flex min-h-[500px] items-center justify-center">

                <div className="flex flex-col items-center gap-3">

                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />

                    <p className="text-sm text-slate-500">
                        Loading appointments...
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Appointments
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage patient appointments and schedules
                    </p>

                </div>


                <div className="flex gap-3">

                    <button
                        onClick={fetchAppointments}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >

                        <RefreshCw className="h-4 w-4" />

                        Refresh

                    </button>


                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >

                        <Plus className="h-4 w-4" />

                        New Appointment

                    </button>

                </div>

            </div>


            {/* STATISTICS */}

            <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-500">
                        Total Appointments
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                        {appointments.length}
                    </p>

                </div>


                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-500">
                        Confirmed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-blue-600">

                        {
                            appointments.filter(
                                (item) =>
                                    String(
                                        item.status
                                    ).toLowerCase() ===
                                    "confirmed"
                            ).length
                        }

                    </p>

                </div>


                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-500">
                        Completed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-600">

                        {
                            appointments.filter(
                                (item) =>
                                    String(
                                        item.status
                                    ).toLowerCase() ===
                                    "completed"
                            ).length
                        }

                    </p>

                </div>

            </div>


            {/* TABLE */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Appointment List
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {filteredAppointments.length} records
                            </p>

                        </div>


                        <div className="relative w-full sm:w-80">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search appointments..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4">

                        <p className="font-semibold text-red-700">
                            Unable to load appointments
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={fetchAppointments}
                            className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* EMPTY */}

                {!error &&
                    filteredAppointments.length ===
                    0 && (

                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                                <CalendarDays className="h-8 w-8 text-slate-400" />

                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                No appointments found
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">

                                {search
                                    ? "No appointments match your search."
                                    : "There are no appointments registered yet."}

                            </p>

                            {!search && (

                                <button
                                    onClick={openAddModal}
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >

                                    <Plus className="h-4 w-4" />

                                    New Appointment

                                </button>

                            )}

                        </div>

                    )}


                {/* DATA TABLE */}

                {!error &&
                    filteredAppointments.length >
                    0 && (

                        <div className="overflow-x-auto">

                            <table className="min-w-full">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            ID
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Patient
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Doctor
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Date & Time
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {filteredAppointments.map(
                                        (appointment) => (

                                            <tr
                                                key={
                                                    appointment.id
                                                }
                                                className="hover:bg-slate-50"
                                            >

                                                <td className="px-5 py-4 font-semibold text-slate-700">

                                                    #
                                                    {
                                                        appointment.id
                                                    }

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                                                            <UserRound className="h-5 w-5" />

                                                        </div>

                                                        <div>

                                                            <p className="font-medium text-slate-900">

                                                                {
                                                                    getPatientName(
                                                                        appointment
                                                                    )
                                                                }

                                                            </p>

                                                            <p className="text-xs text-slate-500">

                                                                Patient #
                                                                {
                                                                    appointment.patient_id
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">

                                                            <Stethoscope className="h-5 w-5" />

                                                        </div>

                                                        <div>

                                                            <p className="font-medium text-slate-900">

                                                                {
                                                                    getDoctorName(
                                                                        appointment
                                                                    )
                                                                }

                                                            </p>

                                                            <p className="text-xs text-slate-500">

                                                                Doctor #
                                                                {
                                                                    appointment.doctor_id
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="space-y-1">

                                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">

                                                            <CalendarDays className="h-4 w-4 text-slate-400" />

                                                            {
                                                                formatDateForInput(
                                                                    appointment.appointment_date ||
                                                                    appointment.date
                                                                )
                                                            }

                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs text-slate-500">

                                                            <Clock className="h-3.5 w-3.5" />

                                                            {
                                                                formatTimeForInput(
                                                                    appointment.appointment_time ||
                                                                    appointment.time
                                                                )
                                                            }

                                                        </div>

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                            appointment.status
                                                        )}`}
                                                    >

                                                        {
                                                            getStatusIcon(
                                                                appointment.status
                                                            )
                                                        }

                                                        {
                                                            appointment.status
                                                        }

                                                    </span>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-1">

                                                        <button
                                                            onClick={() =>
                                                                setSelectedAppointment(
                                                                    appointment
                                                                )
                                                            }
                                                            title="View"
                                                            className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                                        >

                                                            <Eye className="h-4 w-4" />

                                                        </button>


                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    appointment
                                                                )
                                                            }
                                                            title="Edit"
                                                            className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                                                        >

                                                            <Pencil className="h-4 w-4" />

                                                        </button>


                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    appointment.id
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                                        >

                                                            <Trash2 className="h-4 w-4" />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

            </div>


            {/* =====================================================
                VIEW MODAL
            ===================================================== */}

            {selectedAppointment && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 p-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Appointment Details
                                </h2>

                                <p className="text-sm text-slate-500">

                                    Appointment #
                                    {
                                        selectedAppointment.id
                                    }

                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    setSelectedAppointment(
                                        null
                                    )
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >

                                <X className="h-5 w-5" />

                            </button>

                        </div>


                        <div className="space-y-4 p-5">

                            <div className="grid gap-3 sm:grid-cols-2">

                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs text-slate-500">
                                        Patient
                                    </p>

                                    <p className="mt-1 font-medium text-slate-900">

                                        {
                                            getPatientName(
                                                selectedAppointment
                                            )
                                        }

                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs text-slate-500">
                                        Doctor
                                    </p>

                                    <p className="mt-1 font-medium text-slate-900">

                                        {
                                            getDoctorName(
                                                selectedAppointment
                                            )
                                        }

                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs text-slate-500">
                                        Date
                                    </p>

                                    <p className="mt-1 font-medium text-slate-900">

                                        {
                                            formatDateForInput(
                                                selectedAppointment.appointment_date ||
                                                selectedAppointment.date
                                            )
                                        }

                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs text-slate-500">
                                        Time
                                    </p>

                                    <p className="mt-1 font-medium text-slate-900">

                                        {
                                            formatTimeForInput(
                                                selectedAppointment.appointment_time ||
                                                selectedAppointment.time
                                            )
                                        }

                                    </p>

                                </div>

                            </div>


                            <div className="rounded-lg bg-slate-50 p-4">

                                <p className="text-xs text-slate-500">
                                    Reason
                                </p>

                                <p className="mt-1 text-sm text-slate-800">

                                    {
                                        selectedAppointment.reason ||
                                        "No reason provided"
                                    }

                                </p>

                            </div>


                            <div>

                                <p className="mb-2 text-xs text-slate-500">
                                    Status
                                </p>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                        selectedAppointment.status
                                    )}`}
                                >

                                    {
                                        getStatusIcon(
                                            selectedAppointment.status
                                        )
                                    }

                                    {
                                        selectedAppointment.status
                                    }

                                </span>

                            </div>

                        </div>


                        <div className="flex justify-end border-t border-slate-200 p-5">

                            <button
                                onClick={() =>
                                    setSelectedAppointment(
                                        null
                                    )
                                }
                                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                ADD MODAL
            ===================================================== */}

            {showAddModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    New Appointment
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Schedule a patient appointment
                                </p>

                            </div>


                            <button
                                onClick={closeAddModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >

                                <X className="h-5 w-5" />

                            </button>

                        </div>


                        <AppointmentForm
                            formData={{
                                ...formData,
                                patients,
                                doctors,
                            }}
                            handleChange={handleChange}
                            saving={saving}
                            onSubmit={handleAddAppointment}
                            onCancel={closeAddModal}
                            submitText="Create Appointment"
                        />

                    </div>

                </div>

            )}


            {/* =====================================================
                EDIT MODAL
            ===================================================== */}

            {showEditModal &&
                editingAppointment && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">

                                <div>

                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Edit Appointment
                                    </h2>

                                    <p className="text-sm text-slate-500">

                                        Update appointment #
                                        {
                                            editingAppointment.id
                                        }

                                    </p>

                                </div>


                                <button
                                    onClick={closeEditModal}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                                >

                                    <X className="h-5 w-5" />

                                </button>

                            </div>


                            <AppointmentForm
                                formData={{
                                    ...formData,
                                    patients,
                                    doctors,
                                }}
                                handleChange={handleChange}
                                saving={saving}
                                onSubmit={handleUpdateAppointment}
                                onCancel={closeEditModal}
                                submitText="Save Changes"
                            />

                        </div>

                    </div>

                )}

        </div>
    );
}

export default Appointments;