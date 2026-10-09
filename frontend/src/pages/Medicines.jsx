import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    X,
    Pill,
    Package,
    Calendar,
    IndianRupee,
} from "lucide-react";
import api from "../services/api";

function Medicines() {
    const [medicines, setMedicines] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingMedicine, setEditingMedicine] = useState(null);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        manufacturer: "",
        quantity: "",
        price: "",
        expiry_date: "",
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            setError("");

            const response = await api.get("/medicines");

            const data = response.data;

            let medicineList = [];

            if (Array.isArray(data)) {
                medicineList = data;
            } else if (Array.isArray(data.medicines)) {
                medicineList = data.medicines;
            } else if (Array.isArray(data.data)) {
                medicineList = data.data;
            }

            setMedicines(medicineList);
        } catch (err) {
            console.error("Error fetching medicines:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load medicines."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMedicines();
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            manufacturer: "",
            quantity: "",
            price: "",
            expiry_date: "",
        });
    };

    const openAddModal = () => {
        setEditingMedicine(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (medicine) => {
        setEditingMedicine(medicine);

        setFormData({
            name: medicine.name || "",
            category: medicine.category || "",
            manufacturer: medicine.manufacturer || "",
            quantity: medicine.quantity ?? "",
            price: medicine.price ?? "",
            expiry_date: medicine.expiry_date
                ? String(medicine.expiry_date).substring(0, 10)
                : "",
        });

        setShowModal(true);
    };

    const openViewModal = (medicine) => {
        setSelectedMedicine(medicine);
        setShowViewModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingMedicine(null);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");

            const medicineData = {
                name: formData.name,
                category: formData.category,
                manufacturer: formData.manufacturer,
                quantity: Number(formData.quantity),
                price: Number(formData.price),
                expiry_date: formData.expiry_date || null,
            };

            if (editingMedicine) {
                await api.put(
                    `/medicines/${editingMedicine.id}`,
                    medicineData
                );
            } else {
                await api.post("/medicines", medicineData);
            }

            closeModal();
            fetchMedicines();
        } catch (err) {
            console.error("Error saving medicine:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to save medicine."
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this medicine?"
        );

        if (!confirmDelete) return;

        try {
            setError("");

            await api.delete(`/medicines/${id}`);

            fetchMedicines();
        } catch (err) {
            console.error("Error deleting medicine:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to delete medicine."
            );
        }
    };

    const filteredMedicines = medicines.filter((medicine) => {
        const search = searchTerm.toLowerCase();

        return (
            String(medicine.id || "")
                .toLowerCase()
                .includes(search) ||
            String(medicine.name || "")
                .toLowerCase()
                .includes(search) ||
            String(medicine.category || "")
                .toLowerCase()
                .includes(search) ||
            String(medicine.manufacturer || "")
                .toLowerCase()
                .includes(search)
        );
    });

    const getStockStatus = (quantity) => {
        const qty = Number(quantity || 0);

        if (qty === 0) {
            return {
                text: "Out of Stock",
                className:
                    "bg-red-100 text-red-700",
            };
        }

        if (qty <= 10) {
            return {
                text: "Low Stock",
                className:
                    "bg-amber-100 text-amber-700",
            };
        }

        return {
            text: "Available",
            className:
                "bg-emerald-100 text-emerald-700",
        };
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Medicines
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage hospital medicines and pharmacy inventory
                    </p>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={18} />

                        Add Medicine
                    </button>

                </div>
            </div>


            {/* Error */}
            {error && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <span>{error}</span>

                    <button
                        onClick={() => setError("")}
                        className="ml-4"
                    >
                        <X size={18} />
                    </button>

                </div>
            )}


            {/* Search + Stats */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

                <div className="lg:col-span-3">

                    <div className="relative">

                        <Search
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search by medicine, category, manufacturer..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>


                <div className="rounded-lg border border-slate-200 bg-white px-5 py-3 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-blue-50 p-2">
                            <Pill
                                size={20}
                                className="text-blue-600"
                            />
                        </div>

                        <div>

                            <p className="text-xs text-slate-500">
                                Total Medicines
                            </p>

                            <p className="text-xl font-bold text-slate-800">
                                {medicines.length}
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                {loading ? (

                    <div className="flex min-h-[300px] items-center justify-center">

                        <div className="flex flex-col items-center gap-3">

                            <RefreshCw
                                size={28}
                                className="animate-spin text-blue-600"
                            />

                            <p className="text-sm text-slate-500">
                                Loading medicines...
                            </p>

                        </div>

                    </div>

                ) : filteredMedicines.length === 0 ? (

                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                        <div className="rounded-full bg-slate-100 p-4">

                            <Pill
                                size={30}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-700">
                            No medicines found
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-slate-500">
                            {searchTerm
                                ? "Try changing your search term."
                                : "There are no medicines yet. Add the first medicine."}
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px] text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">

                                <tr>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        ID
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Medicine
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Category
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Manufacturer
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Stock
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Price
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Expiry
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {filteredMedicines.map(
                                    (medicine) => {
                                        const stockStatus =
                                            getStockStatus(
                                                medicine.quantity
                                            );

                                        return (
                                            <tr
                                                key={
                                                    medicine.id
                                                }
                                                className="transition hover:bg-slate-50"
                                            >

                                                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                    #{medicine.id}
                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="rounded-full bg-blue-50 p-2">

                                                            <Pill
                                                                size={
                                                                    17
                                                                }
                                                                className="text-blue-600"
                                                            />

                                                        </div>

                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {
                                                                medicine.name
                                                            }
                                                        </p>

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                        {
                                                            medicine.category ||
                                                            "General"
                                                        }
                                                    </span>

                                                </td>


                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {
                                                        medicine.manufacturer ||
                                                        "N/A"
                                                    }
                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <Package
                                                            size={
                                                                17
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        <div>

                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {
                                                                    medicine.quantity ??
                                                                    0
                                                                }
                                                            </p>

                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${stockStatus.className}`}
                                                            >
                                                                {
                                                                    stockStatus.text
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">

                                                        <IndianRupee
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {Number(
                                                            medicine.price ||
                                                                0
                                                        ).toFixed(
                                                            2
                                                        )}

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2 text-sm text-slate-600">

                                                        <Calendar
                                                            size={
                                                                16
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        {medicine.expiry_date
                                                            ? String(
                                                                  medicine.expiry_date
                                                              ).substring(
                                                                  0,
                                                                  10
                                                              )
                                                            : "N/A"}

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            onClick={() =>
                                                                openViewModal(
                                                                    medicine
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                            title="View"
                                                        >
                                                            <Eye
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>


                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    medicine
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>


                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    medicine.id
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* Add / Edit Modal */}
            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingMedicine
                                        ? "Edit Medicine"
                                        : "Add Medicine"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter medicine and inventory details.
                                </p>

                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={22} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                {/* Name */}
                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Medicine Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter medicine name"
                                        required
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Category */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Category
                                    </label>

                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g. Antibiotic"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Manufacturer */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Manufacturer
                                    </label>

                                    <input
                                        type="text"
                                        name="manufacturer"
                                        value={
                                            formData.manufacturer
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter manufacturer"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Quantity */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Quantity *
                                    </label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        placeholder="0"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Price */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Price *
                                    </label>

                                    <div className="relative">

                                        <IndianRupee
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Expiry */}
                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Expiry Date
                                    </label>

                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={
                                            formData.expiry_date
                                        }
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* Buttons */}
                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    {editingMedicine
                                        ? "Update Medicine"
                                        : "Save Medicine"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* View Modal */}
            {showViewModal && selectedMedicine && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    Medicine Details
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Medicine #{selectedMedicine.id}
                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setShowViewModal(false)
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={22} />
                            </button>

                        </div>


                        <div className="space-y-4 p-6">

                            <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-5">

                                <div className="rounded-full bg-white p-3">

                                    <Pill
                                        size={28}
                                        className="text-blue-600"
                                    />

                                </div>

                                <div>

                                    <h3 className="text-lg font-bold text-slate-800">
                                        {
                                            selectedMedicine.name
                                        }
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        {
                                            selectedMedicine.category ||
                                            "General Medicine"
                                        }
                                    </p>

                                </div>

                            </div>


                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div className="rounded-xl bg-slate-50 p-4">

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Manufacturer
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {
                                            selectedMedicine.manufacturer ||
                                            "N/A"
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4">

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Category
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {
                                            selectedMedicine.category ||
                                            "General"
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4">

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Quantity
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {
                                            selectedMedicine.quantity ??
                                            0
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4">

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Price
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        ₹
                                        {Number(
                                            selectedMedicine.price ||
                                                0
                                        ).toFixed(2)}
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Expiry Date
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {selectedMedicine.expiry_date
                                            ? String(
                                                  selectedMedicine.expiry_date
                                              ).substring(
                                                  0,
                                                  10
                                              )
                                            : "N/A"}
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                            <button
                                onClick={() =>
                                    setShowViewModal(false)
                                }
                                className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-900"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Medicines;