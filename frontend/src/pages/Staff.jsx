import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    Users,
    X,
    UserRound,
    Building2,
    CalendarDays,
    IndianRupee,
} from "lucide-react";
import api from "../services/api";

function Staff() {
    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [formData, setFormData] = useState({
        user_id: "",
        designation: "",
        department_id: "",
        joining_date: "",
        salary: "",
    });

    // =========================
    // FETCH STAFF
    // =========================
    const fetchStaff = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/staff");

            const data = response.data;

            if (Array.isArray(data)) {
                setStaff(data);
            } else if (Array.isArray(data.staff)) {
                setStaff(data.staff);
            } else if (Array.isArray(data.data)) {
                setStaff(data.data);
            } else {
                setStaff([]);
            }
        } catch (err) {
            console.error("Error fetching staff:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load staff members."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FETCH DEPARTMENTS
    // =========================
    const fetchDepartments = async () => {
        try {
            const response = await api.get("/departments");

            const data = response.data;

            if (Array.isArray(data)) {
                setDepartments(data);
            } else if (Array.isArray(data.departments)) {
                setDepartments(data.departments);
            } else if (Array.isArray(data.data)) {
                setDepartments(data.data);
            } else {
                setDepartments([]);
            }
        } catch (err) {
            console.error("Error fetching departments:", err);
        }
    };

    useEffect(() => {
        fetchStaff();
        fetchDepartments();
    }, []);

    // =========================
    // SEARCH
    // =========================
    const filteredStaff = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        if (!term) {
            return staff;
        }

        return staff.filter((member) => {
            return (
                String(member.id || "")
                    .toLowerCase()
                    .includes(term) ||
                String(member.user_id || "")
                    .toLowerCase()
                    .includes(term) ||
                String(member.name || "")
                    .toLowerCase()
                    .includes(term) ||
                String(member.email || "")
                    .toLowerCase()
                    .includes(term) ||
                String(member.designation || "")
                    .toLowerCase()
                    .includes(term) ||
                String(member.department_name || "")
                    .toLowerCase()
                    .includes(term)
            );
        });
    }, [staff, searchTerm]);

    // =========================
    // OPEN ADD MODAL
    // =========================
    const openAddModal = () => {
        setModalType("add");
        setSelectedStaff(null);

        setFormData({
            user_id: "",
            designation: "",
            department_id: "",
            joining_date: "",
            salary: "",
        });

        setShowModal(true);
        setError("");
    };

    // =========================
    // OPEN VIEW MODAL
    // =========================
    const openViewModal = async (id) => {
        try {
            const response = await api.get(`/staff/${id}`);

            const data = response.data;

            const member =
                data.staff ||
                data.data ||
                data;

            setSelectedStaff(member);
            setModalType("view");
            setShowModal(true);
        } catch (err) {
            console.error("Error fetching staff member:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load staff details."
            );
        }
    };

    // =========================
    // OPEN EDIT MODAL
    // =========================
    const openEditModal = (member) => {
        setSelectedStaff(member);

        setFormData({
            user_id: member.user_id || "",
            designation: member.designation || "",
            department_id: member.department_id || "",
            joining_date: member.joining_date
                ? String(member.joining_date).split("T")[0]
                : "",
            salary: member.salary || "",
        });

        setModalType("edit");
        setShowModal(true);
        setError("");
    };

    // =========================
    // FORM CHANGE
    // =========================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");

            if (!formData.designation.trim()) {
                setError("Designation is required.");
                return;
            }

            if (modalType === "add") {
                if (!formData.user_id) {
                    setError("User ID is required.");
                    return;
                }

                await api.post("/staff", {
                    user_id: Number(formData.user_id),
                    designation: formData.designation,
                    department_id: formData.department_id
                        ? Number(formData.department_id)
                        : null,
                    joining_date: formData.joining_date || null,
                    salary: formData.salary
                        ? Number(formData.salary)
                        : null,
                });
            } else {
                await api.put(`/staff/${selectedStaff.id}`, {
                    designation: formData.designation,
                    department_id: formData.department_id
                        ? Number(formData.department_id)
                        : null,
                    joining_date: formData.joining_date || null,
                    salary: formData.salary
                        ? Number(formData.salary)
                        : null,
                });
            }

            setShowModal(false);
            setSelectedStaff(null);

            await fetchStaff();
        } catch (err) {
            console.error("Error saving staff:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to save staff member."
            );
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this staff member?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(`/staff/${id}`);

            await fetchStaff();
        } catch (err) {
            console.error("Error deleting staff:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to delete staff member."
            );
        }
    };

    // =========================
    // CLOSE MODAL
    // =========================
    const closeModal = () => {
        setShowModal(false);
        setSelectedStaff(null);
        setError("");
    };

    // =========================
    // FORMAT DATE
    // =========================
    const formatDate = (date) => {
        if (!date) return "—";

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

    // =========================
    // FORMAT SALARY
    // =========================
    const formatSalary = (salary) => {
        if (salary === null || salary === undefined || salary === "") {
            return "—";
        }

        return `₹${Number(salary).toLocaleString("en-IN")}`;
    };

    return (
        <div className="space-y-6">
            {/* ================= HEADER ================= */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Staff Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage hospital staff members and their details.
                    </p>
                </div>

                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Add Staff
                </button>
            </div>

            {/* ================= STATS ================= */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Staff
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {staff.length}
                            </h2>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Departments
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {departments.length}
                            </h2>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                            <Building2 size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Search Results
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {filteredStaff.length}
                            </h2>
                        </div>

                        <div className="rounded-xl bg-green-50 p-3 text-green-600">
                            <Search size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= SEARCH BAR ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search by name, email, designation, department..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        onClick={fetchStaff}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ================= ERROR ================= */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* ================= TABLE ================= */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="flex items-center gap-3 text-slate-500">
                            <RefreshCw
                                size={20}
                                className="animate-spin"
                            />
                            Loading staff...
                        </div>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                        <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                            <Users size={32} />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-700">
                            No staff members found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Add a staff member or try a different search.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Staff
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Designation
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Department
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Joining Date
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Salary
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredStaff.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                                    {String(
                                                        member.name ||
                                                            "S"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {member.name ||
                                                            `User #${member.user_id}`}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {member.email ||
                                                            `User ID: ${member.user_id}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                {member.designation ||
                                                    "—"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {member.department_name ||
                                                "Not Assigned"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatDate(
                                                member.joining_date
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                                            {formatSalary(
                                                member.salary
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openViewModal(
                                                            member.id
                                                        )
                                                    }
                                                    title="View"
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye size={17} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openEditModal(
                                                            member
                                                        )
                                                    }
                                                    title="Edit"
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            member.id
                                                        )
                                                    }
                                                    title="Delete"
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={17} />
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

            {/* ================= MODAL ================= */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {modalType === "add"
                                        ? "Add Staff Member"
                                        : modalType === "edit"
                                        ? "Edit Staff Member"
                                        : "Staff Details"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {modalType === "view"
                                        ? "View complete staff information."
                                        : "Enter the staff member details below."}
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* VIEW */}
                        {modalType === "view" ? (
                            <div className="space-y-6 p-6">
                                <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-5">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                                        {String(
                                            selectedStaff?.name || "S"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {selectedStaff?.name ||
                                                `User #${selectedStaff?.user_id}`}
                                        </h3>

                                        <p className="text-sm text-slate-500">
                                            {selectedStaff?.email ||
                                                "Email not available"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <UserRound size={17} />
                                            <span className="text-xs font-medium">
                                                User ID
                                            </span>
                                        </div>

                                        <p className="mt-2 font-semibold text-slate-800">
                                            {selectedStaff?.user_id ||
                                                "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Users size={17} />
                                            <span className="text-xs font-medium">
                                                Designation
                                            </span>
                                        </div>

                                        <p className="mt-2 font-semibold text-slate-800">
                                            {selectedStaff?.designation ||
                                                "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Building2 size={17} />
                                            <span className="text-xs font-medium">
                                                Department
                                            </span>
                                        </div>

                                        <p className="mt-2 font-semibold text-slate-800">
                                            {selectedStaff?.department_name ||
                                                "Not Assigned"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CalendarDays size={17} />
                                            <span className="text-xs font-medium">
                                                Joining Date
                                            </span>
                                        </div>

                                        <p className="mt-2 font-semibold text-slate-800">
                                            {formatDate(
                                                selectedStaff?.joining_date
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <IndianRupee size={17} />
                                            <span className="text-xs font-medium">
                                                Salary
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xl font-bold text-slate-800">
                                            {formatSalary(
                                                selectedStaff?.salary
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ADD / EDIT */
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5 p-6"
                            >
                                {modalType === "add" && (
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            User ID
                                        </label>

                                        <input
                                            type="number"
                                            name="user_id"
                                            value={formData.user_id}
                                            onChange={handleChange}
                                            placeholder="Enter existing user ID"
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                        <p className="mt-1 text-xs text-slate-400">
                                            Enter the ID of an existing user
                                            from the users table.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Designation
                                    </label>

                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="e.g. Receptionist, Nurse, Accountant"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Department
                                    </label>

                                    <select
                                        name="department_id"
                                        value={formData.department_id}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">
                                            Select Department
                                        </option>

                                        {departments.map((department) => (
                                            <option
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Joining Date
                                        </label>

                                        <input
                                            type="date"
                                            name="joining_date"
                                            value={
                                                formData.joining_date
                                            }
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Salary
                                        </label>

                                        <input
                                            type="number"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleChange}
                                            placeholder="e.g. 25000"
                                            min="0"
                                            step="0.01"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        {modalType === "add"
                                            ? "Add Staff"
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Staff;