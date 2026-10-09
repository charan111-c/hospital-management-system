import { useEffect, useState } from "react";

import {
    Stethoscope,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    UserPlus,
    X,
    Mail,
    Phone,
    Building2,
    Award,
} from "lucide-react";

import api from "../services/api";

function Doctors() {
    // =========================================================
    // STATE
    // =========================================================

    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        department_id: "",
    });

    // =========================================================
    // FETCH DOCTORS
    // =========================================================

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/doctors");

            console.log("Doctors API response:", response.data);

            let data = [];

            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response.data?.doctors)) {
                data = response.data.doctors;
            } else if (Array.isArray(response.data?.data)) {
                data = response.data.data;
            }

            setDoctors(data);
            setFilteredDoctors(data);
        } catch (err) {
            console.error("Failed to load doctors:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load doctors"
            );

            setDoctors([]);
            setFilteredDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH DEPARTMENTS
    // =========================================================

    const fetchDepartments = async () => {
        try {
            const response = await api.get("/departments");

            console.log(
                "Departments for doctors:",
                response.data
            );

            let data = [];

            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (
                Array.isArray(response.data?.departments)
            ) {
                data = response.data.departments;
            } else if (Array.isArray(response.data?.data)) {
                data = response.data.data;
            }

            setDepartments(data);
        } catch (err) {
            console.error(
                "Failed to load departments:",
                err
            );
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchDoctors();
        fetchDepartments();
    }, []);

    // =========================================================
    // SEARCH
    // =========================================================

    useEffect(() => {
        const value = search.toLowerCase().trim();

        if (!value) {
            setFilteredDoctors(doctors);
            return;
        }

        const filtered = doctors.filter((doctor) => {
            const id = String(
                doctor.id || ""
            ).toLowerCase();

            const name = String(
                doctor.name || ""
            ).toLowerCase();

            const email = String(
                doctor.email || ""
            ).toLowerCase();

            const phone = String(
                doctor.phone || ""
            ).toLowerCase();

            const specialization = String(
                doctor.specialization || ""
            ).toLowerCase();

            const department = String(
                doctor.department_name ||
                doctor.department ||
                ""
            ).toLowerCase();

            return (
                id.includes(value) ||
                name.includes(value) ||
                email.includes(value) ||
                phone.includes(value) ||
                specialization.includes(value) ||
                department.includes(value)
            );
        });

        setFilteredDoctors(filtered);
    }, [search, doctors]);

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
            specialization: "",
            department_id: "",
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
    // ADD DOCTOR
    // =========================================================

    const handleAddDoctor = async (e) => {
        e.preventDefault();

        try {
            const doctorData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                specialization: formData.specialization,
                department_id: formData.department_id
                    ? Number(formData.department_id)
                    : null,
            };

            console.log("Adding doctor:", {
                ...doctorData,
                password: "********",
            });

            await api.post("/doctors", doctorData);

            alert("Doctor added successfully!");

            closeAddModal();

            await fetchDoctors();
        } catch (err) {
            console.error(
                "Add doctor error:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to add doctor"
            );
        }
    };

    // =========================================================
    // EDIT
    // =========================================================

    const openEditModal = (doctor) => {
        setEditingDoctor(doctor);

        setFormData({
            name: doctor.name || "",
            email: doctor.email || "",
            password: "",
            phone: doctor.phone || "",
            specialization:
                doctor.specialization || "",
            department_id:
                doctor.department_id
                    ? String(doctor.department_id)
                    : "",
        });

        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingDoctor(null);
        resetForm();
    };

    // =========================================================
    // UPDATE DOCTOR
    // =========================================================

    const handleUpdateDoctor = async (e) => {
        e.preventDefault();

        if (!editingDoctor) {
            return;
        }

        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                specialization:
                    formData.specialization,
                department_id:
                    formData.department_id
                        ? Number(formData.department_id)
                        : null,
            };

            await api.put(
                `/doctors/${editingDoctor.id}`,
                updateData
            );

            alert("Doctor updated successfully!");

            closeEditModal();

            await fetchDoctors();
        } catch (err) {
            console.error(
                "Update doctor error:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to update doctor"
            );
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this doctor?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/doctors/${id}`);

            alert("Doctor deleted successfully!");

            await fetchDoctors();
        } catch (err) {
            console.error(
                "Delete doctor error:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to delete doctor"
            );
        }
    };

    // =========================================================
    // GET DEPARTMENT NAME
    // =========================================================

    const getDepartmentName = (doctor) => {
        if (doctor.department_name) {
            return doctor.department_name;
        }

        if (doctor.department) {
            if (typeof doctor.department === "string") {
                return doctor.department;
            }

            if (doctor.department.name) {
                return doctor.department.name;
            }
        }

        const department = departments.find(
            (item) =>
                String(item.id) ===
                String(doctor.department_id)
        );

        return department?.name || "Not assigned";
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
                        Loading doctors...
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Doctors
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage hospital doctors and their
                        specializations
                    </p>

                </div>

                <div className="flex gap-3">

                    <button
                        type="button"
                        onClick={fetchDoctors}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >

                        <RefreshCw className="h-4 w-4" />

                        Refresh

                    </button>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >

                        <UserPlus className="h-4 w-4" />

                        Add Doctor

                    </button>

                </div>

            </div>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                            <Stethoscope className="h-6 w-6 text-blue-600" />

                        </div>

                        <div>

                            <p className="text-sm text-slate-500">
                                Total Doctors
                            </p>

                            <p className="text-2xl font-bold text-slate-900">
                                {doctors.length}
                            </p>

                        </div>

                    </div>

                </div>


                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">

                            <Building2 className="h-6 w-6 text-indigo-600" />

                        </div>

                        <div>

                            <p className="text-sm text-slate-500">
                                Departments
                            </p>

                            <p className="text-2xl font-bold text-slate-900">
                                {departments.length}
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                DOCTOR LIST
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Doctor List
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {filteredDoctors.length} records
                            </p>

                        </div>


                        {/* SEARCH */}

                        <div className="relative w-full sm:w-80">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search doctors..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4">

                        <p className="font-semibold text-red-700">
                            Unable to load doctors
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={fetchDoctors}
                            className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* EMPTY */}

                {!error &&
                    filteredDoctors.length === 0 && (

                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                                <Stethoscope className="h-8 w-8 text-slate-400" />

                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                No doctors found
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                {search
                                    ? "No doctors match your search."
                                    : "There are no doctors registered yet."}
                            </p>

                            {!search && (

                                <button
                                    onClick={openAddModal}
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >

                                    <UserPlus className="h-4 w-4" />

                                    Add Doctor

                                </button>

                            )}

                        </div>

                    )}


                {/* TABLE */}

                {!error &&
                    filteredDoctors.length > 0 && (

                        <div className="overflow-x-auto">

                            <table className="min-w-full">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            ID
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Doctor
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Contact
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Specialization
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Department
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {filteredDoctors.map(
                                        (doctor) => (

                                            <tr
                                                key={doctor.id}
                                                className="transition hover:bg-slate-50"
                                            >

                                                {/* ID */}

                                                <td className="whitespace-nowrap px-5 py-4">

                                                    <span className="text-sm font-semibold text-slate-700">
                                                        #{doctor.id}
                                                    </span>

                                                </td>


                                                {/* DOCTOR */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">

                                                            {doctor.name
                                                                ? doctor.name
                                                                      .charAt(
                                                                          0
                                                                      )
                                                                      .toUpperCase()
                                                                : "D"}

                                                        </div>

                                                        <div>

                                                            <p className="font-medium text-slate-900">
                                                                {doctor.name ||
                                                                    "N/A"}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                Doctor ID:{" "}
                                                                {
                                                                    doctor.id
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* CONTACT */}

                                                <td className="px-5 py-4">

                                                    <div className="space-y-1">

                                                        {doctor.email && (

                                                            <div className="flex items-center gap-2 text-sm text-slate-600">

                                                                <Mail className="h-3.5 w-3.5 text-slate-400" />

                                                                {
                                                                    doctor.email
                                                                }

                                                            </div>

                                                        )}

                                                        {doctor.phone && (

                                                            <div className="flex items-center gap-2 text-sm text-slate-600">

                                                                <Phone className="h-3.5 w-3.5 text-slate-400" />

                                                                {
                                                                    doctor.phone
                                                                }

                                                            </div>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* SPECIALIZATION */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <Award className="h-4 w-4 text-blue-500" />

                                                        <span className="text-sm text-slate-700">

                                                            {doctor.specialization ||
                                                                "Not specified"}

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* DEPARTMENT */}

                                                <td className="px-5 py-4">

                                                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">

                                                        <Building2 className="h-3.5 w-3.5" />

                                                        {getDepartmentName(
                                                            doctor
                                                        )}

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-1">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedDoctor(
                                                                    doctor
                                                                )
                                                            }
                                                            title="View doctor"
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                        >

                                                            <Eye className="h-4 w-4" />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    doctor
                                                                )
                                                            }
                                                            title="Edit doctor"
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                                        >

                                                            <Pencil className="h-4 w-4" />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    doctor.id
                                                                )
                                                            }
                                                            title="Delete doctor"
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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
                VIEW DOCTOR MODAL
            ===================================================== */}

            {selectedDoctor && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 p-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Doctor Details
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Doctor #{selectedDoctor.id}
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedDoctor(null)
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >

                                <X className="h-5 w-5" />

                            </button>

                        </div>


                        <div className="space-y-5 p-5">

                            <div className="flex items-center gap-4">

                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">

                                    {selectedDoctor.name
                                        ? selectedDoctor.name
                                              .charAt(0)
                                              .toUpperCase()
                                        : "D"}

                                </div>

                                <div>

                                    <h3 className="text-xl font-semibold text-slate-900">
                                        {selectedDoctor.name ||
                                            "N/A"}
                                    </h3>

                                    <p className="text-sm text-blue-600">
                                        {selectedDoctor.specialization ||
                                            "Doctor"}
                                    </p>

                                </div>

                            </div>


                            <div className="grid gap-3 sm:grid-cols-2">

                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs font-medium text-slate-500">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-sm font-medium text-slate-800">
                                        {selectedDoctor.email ||
                                            "N/A"}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs font-medium text-slate-500">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {selectedDoctor.phone ||
                                            "N/A"}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs font-medium text-slate-500">
                                        Specialization
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {selectedDoctor.specialization ||
                                            "N/A"}
                                    </p>

                                </div>


                                <div className="rounded-lg bg-slate-50 p-4">

                                    <p className="text-xs font-medium text-slate-500">
                                        Department
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {getDepartmentName(
                                            selectedDoctor
                                        )}
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="flex justify-end border-t border-slate-200 p-5">

                            <button
                                onClick={() =>
                                    setSelectedDoctor(null)
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
                ADD DOCTOR MODAL
            ===================================================== */}

            {showAddModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Add New Doctor
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Enter doctor information
                                </p>

                            </div>

                            <button
                                onClick={closeAddModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >

                                <X className="h-5 w-5" />

                            </button>

                        </div>


                        <form onSubmit={handleAddDoctor}>

                            <div className="space-y-4 p-5">

                                {/* Name */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Doctor Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Dr. John Smith"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Email */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="doctor@hospital.com"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Password */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        placeholder="Enter login password"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-xs text-slate-400">
                                        Minimum 6 characters
                                    </p>

                                </div>


                                {/* Phone */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Specialization */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Specialization
                                    </label>

                                    <input
                                        type="text"
                                        name="specialization"
                                        value={
                                            formData.specialization
                                        }
                                        onChange={handleChange}
                                        placeholder="Cardiology"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Department */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Department
                                    </label>

                                    <select
                                        name="department_id"
                                        value={
                                            formData.department_id
                                        }
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select department
                                        </option>

                                        {departments.map(
                                            (department) => (

                                                <option
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {
                                                        department.name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">

                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >

                                    <UserPlus className="h-4 w-4" />

                                    Add Doctor

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                EDIT DOCTOR MODAL
            ===================================================== */}

            {showEditModal && editingDoctor && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    Edit Doctor
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Update doctor information
                                </p>

                            </div>

                            <button
                                onClick={closeEditModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >

                                <X className="h-5 w-5" />

                            </button>

                        </div>


                        <form onSubmit={handleUpdateDoctor}>

                            <div className="space-y-4 p-5">

                                {/* Name */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Doctor Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Email */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Phone */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Specialization */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Specialization
                                    </label>

                                    <input
                                        type="text"
                                        name="specialization"
                                        value={
                                            formData.specialization
                                        }
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Department */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Department
                                    </label>

                                    <select
                                        name="department_id"
                                        value={
                                            formData.department_id
                                        }
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select department
                                        </option>

                                        {departments.map(
                                            (department) => (

                                                <option
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {
                                                        department.name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
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

export default Doctors;