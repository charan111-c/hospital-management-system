import { useEffect, useState } from "react";

import {
    Building2,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    Plus,
    X,
} from "lucide-react";

import api from "../services/api";

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [editingDepartment, setEditingDepartment] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    // =========================================================
    // FETCH DEPARTMENTS
    // =========================================================

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/departments");

            console.log("Departments API response:", response.data);

            let data = [];

            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response.data?.departments)) {
                data = response.data.departments;
            } else if (Array.isArray(response.data?.data)) {
                data = response.data.data;
            }

            setDepartments(data);
            setFilteredDepartments(data);
        } catch (err) {
            console.error("Failed to load departments:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load departments"
            );

            setDepartments([]);
            setFilteredDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // =========================================================
    // SEARCH
    // =========================================================

    useEffect(() => {
        const value = search.toLowerCase().trim();

        if (!value) {
            setFilteredDepartments(departments);
            return;
        }

        const filtered = departments.filter((department) => {
            return (
                String(department.id || "")
                    .toLowerCase()
                    .includes(value) ||
                String(department.name || "")
                    .toLowerCase()
                    .includes(value) ||
                String(department.description || "")
                    .toLowerCase()
                    .includes(value)
            );
        });

        setFilteredDepartments(filtered);
    }, [search, departments]);

    // =========================================================
    // FORM
    // =========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
        });
    };

    // =========================================================
    // ADD
    // =========================================================

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();

        try {
            await api.post("/departments", formData);

            alert("Department added successfully!");

            closeAddModal();
            await fetchDepartments();
        } catch (err) {
            console.error("Add department error:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to add department"
            );
        }
    };

    // =========================================================
    // EDIT
    // =========================================================

    const openEditModal = (department) => {
        setEditingDepartment(department);

        setFormData({
            name: department.name || "",
            description: department.description || "",
        });

        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingDepartment(null);
        resetForm();
    };

    const handleUpdateDepartment = async (e) => {
        e.preventDefault();

        if (!editingDepartment) {
            return;
        }

        try {
            await api.put(
                `/departments/${editingDepartment.id}`,
                formData
            );

            alert("Department updated successfully!");

            closeEditModal();
            await fetchDepartments();
        } catch (err) {
            console.error("Update department error:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to update department"
            );
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this department?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/departments/${id}`);

            alert("Department deleted successfully!");

            await fetchDepartments();
        } catch (err) {
            console.error("Delete department error:", err);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to delete department"
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
                        Loading departments...
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

            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Departments
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage hospital departments
                    </p>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={fetchDepartments}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Department
                    </button>

                </div>
            </div>


            {/* STAT CARD */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                        <Building2 className="h-6 w-6 text-blue-600" />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Total Departments
                        </p>

                        <p className="text-2xl font-bold text-slate-900">
                            {departments.length}
                        </p>
                    </div>

                </div>
            </div>


            {/* TABLE */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}
                <div className="border-b border-slate-200 p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Department List
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {filteredDepartments.length} records
                            </p>
                        </div>

                        <div className="relative w-full sm:w-80">

                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search departments..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>
                </div>


                {/* ERROR */}
                {error && (
                    <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4">

                        <p className="font-semibold text-red-700">
                            Unable to load departments
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={fetchDepartments}
                            className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Retry
                        </button>

                    </div>
                )}


                {/* EMPTY */}
                {!error && filteredDepartments.length === 0 && (

                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <Building2 className="h-8 w-8 text-slate-400" />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            No departments found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {search
                                ? "No departments match your search."
                                : "There are no departments registered yet."}
                        </p>

                        {!search && (
                            <button
                                onClick={openAddModal}
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Add Department
                            </button>
                        )}

                    </div>
                )}


                {/* DATA TABLE */}
                {!error && filteredDepartments.length > 0 && (

                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                            <thead className="bg-slate-50">

                                <tr>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        ID
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Department
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Description
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {filteredDepartments.map((department) => (

                                    <tr
                                        key={department.id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* ID */}
                                        <td className="px-5 py-4">

                                            <span className="font-semibold text-slate-700">
                                                #{department.id}
                                            </span>

                                        </td>


                                        {/* NAME */}
                                        <td className="px-5 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                </div>

                                                <p className="font-medium text-slate-900">
                                                    {department.name || "N/A"}
                                                </p>

                                            </div>

                                        </td>


                                        {/* DESCRIPTION */}
                                        <td className="max-w-md px-5 py-4">

                                            <p className="truncate text-sm text-slate-600">
                                                {department.description ||
                                                    "No description"}
                                            </p>

                                        </td>


                                        {/* ACTIONS */}
                                        <td className="px-5 py-4">

                                            <div className="flex justify-end gap-1">

                                                <button
                                                    onClick={() =>
                                                        setSelectedDepartment(
                                                            department
                                                        )
                                                    }
                                                    title="View department"
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openEditModal(
                                                            department
                                                        )
                                                    }
                                                    title="Edit department"
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            department.id
                                                        )
                                                    }
                                                    title="Delete department"
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
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
                VIEW MODAL
            ===================================================== */}

            {selectedDepartment && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 p-5">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Department Details
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Department #{selectedDepartment.id}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedDepartment(null)
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        <div className="space-y-5 p-5">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                                    <Building2 className="h-7 w-7 text-blue-600" />
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">
                                        {selectedDepartment.name || "N/A"}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        Department ID #{selectedDepartment.id}
                                    </p>
                                </div>

                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">

                                <p className="text-xs font-medium text-slate-500">
                                    Description
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                    {selectedDepartment.description ||
                                        "No description available"}
                                </p>

                            </div>

                        </div>

                        <div className="flex justify-end border-t border-slate-200 p-5">

                            <button
                                onClick={() =>
                                    setSelectedDepartment(null)
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

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 p-5">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Add Department
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Create a new hospital department
                                </p>
                            </div>

                            <button
                                onClick={closeAddModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        <form onSubmit={handleAddDepartment}>

                            <div className="space-y-4 p-5">

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Department Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Cardiology"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Enter department description"
                                        className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

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
                                    <Plus className="h-4 w-4" />
                                    Add Department
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                EDIT MODAL
            ===================================================== */}

            {showEditModal && editingDepartment && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 p-5">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Edit Department
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Update department information
                                </p>
                            </div>

                            <button
                                onClick={closeEditModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        <form onSubmit={handleUpdateDepartment}>

                            <div className="space-y-4 p-5">

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Department Name
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

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

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

export default Departments;