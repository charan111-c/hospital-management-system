import { useEffect, useState } from "react";

import {
    Users,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    UserPlus,
    X,
    Phone,
    Mail,
    Calendar,
    User,
    Lock,
} from "lucide-react";

import api from "../services/api";

function Patients() {
    // =========================================================
    // STATE
    // =========================================================

    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    // Add patient modal
    const [showAddModal, setShowAddModal] = useState(false);

    // View patient modal
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Edit patient modal
    const [editingPatient, setEditingPatient] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Add/Edit form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        gender: "",
        date_of_birth: "",
    });

    // =========================================================
    // FETCH PATIENTS
    // =========================================================

    const fetchPatients = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/patients");

            console.log("Patients API response:", response.data);

            let patientData = [];

            if (Array.isArray(response.data)) {
                patientData = response.data;
            } else if (Array.isArray(response.data?.patients)) {
                patientData = response.data.patients;
            } else if (Array.isArray(response.data?.data)) {
                patientData = response.data.data;
            }

            setPatients(patientData);
            setFilteredPatients(patientData);

        } catch (err) {
            console.error("Failed to load patients:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load patients"
            );

            setPatients([]);
            setFilteredPatients([]);

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchPatients();
    }, []);

    // =========================================================
    // SEARCH
    // =========================================================

    useEffect(() => {
        const searchValue = search.toLowerCase().trim();

        if (!searchValue) {
            setFilteredPatients(patients);
            return;
        }

        const filtered = patients.filter((patient) => {
            const id = String(patient.id || "").toLowerCase();
            const name = String(patient.name || "").toLowerCase();
            const email = String(patient.email || "").toLowerCase();
            const phone = String(patient.phone || "").toLowerCase();
            const gender = String(patient.gender || "").toLowerCase();

            return (
                id.includes(searchValue) ||
                name.includes(searchValue) ||
                email.includes(searchValue) ||
                phone.includes(searchValue) ||
                gender.includes(searchValue)
            );
        });

        setFilteredPatients(filtered);

    }, [search, patients]);

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

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
            name: "",
            email: "",
            password: "",
            phone: "",
            gender: "",
            date_of_birth: "",
        });
    };

    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    // =========================================================
    // CLOSE ADD MODAL
    // =========================================================

    const closeAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    // =========================================================
    // ADD PATIENT
    // =========================================================

    const handleAddPatient = async (e) => {
        e.preventDefault();

        try {
            const patientData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                gender: formData.gender,
                date_of_birth: formData.date_of_birth,
            };

            console.log("Adding patient:", {
                ...patientData,
                password: "********",
            });

            await api.post("/patients", patientData);

            alert("Patient added successfully!");

            closeAddModal();

            await fetchPatients();

        } catch (err) {
            console.error("Add patient error:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to add patient"
            );
        }
    };

    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const handleEditClick = (patient) => {
        setEditingPatient(patient);

        setFormData({
            name: patient.name || "",
            email: patient.email || "",
            password: "",
            phone: patient.phone || "",
            gender: patient.gender || "",
            date_of_birth: patient.date_of_birth
                ? String(patient.date_of_birth).substring(0, 10)
                : "",
        });

        setShowEditModal(true);
    };

    // =========================================================
    // CLOSE EDIT MODAL
    // =========================================================

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingPatient(null);
        resetForm();
    };

    // =========================================================
    // UPDATE PATIENT
    // =========================================================

    const handleUpdatePatient = async (e) => {
        e.preventDefault();

        if (!editingPatient) {
            return;
        }

        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                date_of_birth: formData.date_of_birth,
            };

            await api.put(
                `/patients/${editingPatient.id}`,
                updateData
            );

            alert("Patient updated successfully!");

            closeEditModal();

            await fetchPatients();

        } catch (err) {
            console.error("Update patient error:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to update patient"
            );
        }
    };

    // =========================================================
    // DELETE PATIENT
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this patient?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/patients/${id}`);

            alert("Patient deleted successfully!");

            await fetchPatients();

        } catch (err) {
            console.error("Delete patient error:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to delete patient"
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
                        Loading patients...
                    </p>

                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="space-y-6">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Patients
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage and view registered patients
                    </p>
                </div>

                <div className="flex gap-3">

                    <button
                        type="button"
                        onClick={fetchPatients}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Patient
                    </button>

                </div>
            </div>


            {/* =====================================================
                TOTAL PATIENTS
            ===================================================== */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Total Patients
                        </p>

                        <p className="text-2xl font-bold text-slate-900">
                            {patients.length}
                        </p>
                    </div>

                </div>
            </div>


            {/* =====================================================
                PATIENT LIST
            ===================================================== */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Patient List
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {filteredPatients.length} records
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-80">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search patients..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>
                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4">

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <p className="text-sm font-semibold text-red-700">
                                    Unable to load patients
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {error}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={fetchPatients}
                                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Retry
                            </button>

                        </div>

                    </div>

                )}


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {!error && filteredPatients.length === 0 && (

                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                            <Users className="h-8 w-8 text-slate-400" />

                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            No patients found
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-500">

                            {search
                                ? "There are no patients matching your search."
                                : "There are no registered patients yet."}

                        </p>

                        {!search && (

                            <button
                                type="button"
                                onClick={openAddModal}
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add First Patient
                            </button>

                        )}

                    </div>

                )}


                {/* =================================================
                    TABLE
                ================================================= */}

                {!error && filteredPatients.length > 0 && (

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
                                        Contact
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Gender
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Date of Birth
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {filteredPatients.map((patient) => (

                                    <tr
                                        key={patient.id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* ID */}
                                        <td className="whitespace-nowrap px-5 py-4">

                                            <span className="text-sm font-semibold text-slate-700">
                                                #{patient.id}
                                            </span>

                                        </td>


                                        {/* Patient */}
                                        <td className="px-5 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">

                                                    {patient.name
                                                        ? patient.name
                                                              .charAt(0)
                                                              .toUpperCase()
                                                        : "P"}

                                                </div>

                                                <div className="min-w-0">

                                                    <p className="truncate font-medium text-slate-900">
                                                        {patient.name || "N/A"}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        Patient ID: {patient.id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* Contact */}
                                        <td className="px-5 py-4">

                                            <div className="space-y-1">

                                                {patient.email && (

                                                    <div className="flex items-center gap-2 text-sm text-slate-600">

                                                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                                        <span>
                                                            {patient.email}
                                                        </span>

                                                    </div>

                                                )}

                                                {patient.phone && (

                                                    <div className="flex items-center gap-2 text-sm text-slate-600">

                                                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                                        <span>
                                                            {patient.phone}
                                                        </span>

                                                    </div>

                                                )}

                                                {!patient.email &&
                                                    !patient.phone && (

                                                        <span className="text-sm text-slate-400">
                                                            No contact details
                                                        </span>

                                                    )}

                                            </div>

                                        </td>


                                        {/* Gender */}
                                        <td className="px-5 py-4">

                                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">

                                                {patient.gender ||
                                                    "Not specified"}

                                            </span>

                                        </td>


                                        {/* DOB */}
                                        <td className="whitespace-nowrap px-5 py-4">

                                            <div className="flex items-center gap-2 text-sm text-slate-600">

                                                <Calendar className="h-4 w-4 text-slate-400" />

                                                {patient.date_of_birth
                                                    ? String(
                                                          patient.date_of_birth
                                                      ).substring(0, 10)
                                                    : "N/A"}

                                            </div>

                                        </td>


                                        {/* Actions */}
                                        <td className="px-5 py-4">

                                            <div className="flex justify-end gap-1">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedPatient(
                                                            patient
                                                        )
                                                    }
                                                    title="View patient"
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>


                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditClick(
                                                            patient
                                                        )
                                                    }
                                                    title="Edit patient"
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>


                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            patient.id
                                                        )
                                                    }
                                                    title="Delete patient"
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================================
                VIEW PATIENT MODAL
            ===================================================== */}

            {selectedPatient && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Patient Details
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Patient #{selectedPatient.id}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedPatient(null)
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>


                        {/* Content */}
                        <div className="space-y-5 p-5">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600">

                                    {selectedPatient.name
                                        ? selectedPatient.name
                                              .charAt(0)
                                              .toUpperCase()
                                        : "P"}

                                </div>

                                <div>

                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {selectedPatient.name || "N/A"}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        Patient ID #{selectedPatient.id}
                                    </p>

                                </div>

                            </div>


                            <div className="grid gap-3 sm:grid-cols-2">

                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs font-medium text-slate-500">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-sm font-medium text-slate-800">
                                        {selectedPatient.email || "N/A"}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs font-medium text-slate-500">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {selectedPatient.phone || "N/A"}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs font-medium text-slate-500">
                                        Gender
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {selectedPatient.gender || "N/A"}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs font-medium text-slate-500">
                                        Date of Birth
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {selectedPatient.date_of_birth
                                            ? String(
                                                  selectedPatient.date_of_birth
                                              ).substring(0, 10)
                                            : "N/A"}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Footer */}
                        <div className="flex justify-end border-t border-slate-200 p-5">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedPatient(null)
                                }
                                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                ADD PATIENT MODAL
            ===================================================== */}

            {showAddModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Add New Patient
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Enter patient information
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeAddModal}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>


                        {/* Form */}
                        <form onSubmit={handleAddPatient}>

                            <div className="space-y-4 p-5">

                                {/* Name */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Patient Name
                                    </label>

                                    <div className="relative">

                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter patient name"
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Email */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Email
                                    </label>

                                    <div className="relative">

                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="patient@example.com"
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Password */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Password
                                    </label>

                                    <div className="relative">

                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                            placeholder="Enter login password"
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Minimum 6 characters
                                    </p>

                                </div>


                                {/* Phone */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Phone
                                    </label>

                                    <div className="relative">

                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Gender */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Gender
                                    </label>

                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select gender
                                        </option>

                                        <option value="Male">
                                            Male
                                        </option>

                                        <option value="Female">
                                            Female
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* Date of Birth */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Date of Birth
                                    </label>

                                    <div className="relative">

                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* Footer */}
                            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">

                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Add Patient
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                EDIT PATIENT MODAL
            ===================================================== */}

            {showEditModal && editingPatient && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Edit Patient
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Update patient information
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>


                        {/* Form */}
                        <form onSubmit={handleUpdatePatient}>

                            <div className="space-y-4 p-5">

                                {/* Name */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Patient Name
                                    </label>

                                    <div className="relative">

                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Email */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Email
                                    </label>

                                    <div className="relative">

                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Phone */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Phone
                                    </label>

                                    <div className="relative">

                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Gender */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Gender
                                    </label>

                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select gender
                                        </option>

                                        <option value="Male">
                                            Male
                                        </option>

                                        <option value="Female">
                                            Female
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* Date of Birth */}
                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Date of Birth
                                    </label>

                                    <div className="relative">

                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* Footer */}
                            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Save Changes
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Patients;