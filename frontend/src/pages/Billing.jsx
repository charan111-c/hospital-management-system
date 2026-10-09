import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    X,
    Receipt,
    User,
    Calendar,
    IndianRupee,
    CreditCard,
} from "lucide-react";
import api from "../services/api";

function Billing() {
    const [bills, setBills] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingBill, setEditingBill] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);

    const [formData, setFormData] = useState({
        patient_id: "",
        appointment_id: "",
        consultation_fee: "",
        medicine_fee: "",
        test_fee: "",
        other_fee: "",
        total_amount: "",
        payment_status: "Pending",
        payment_method: "",
    });

    useEffect(() => {
        fetchBills();
        fetchPatients();
        fetchAppointments();
    }, []);

    const fetchBills = async () => {
        try {
            setError("");

            const response = await api.get("/billing");

            const data = response.data;

            let list = [];

            if (Array.isArray(data)) {
                list = data;
            } else if (Array.isArray(data.bills)) {
                list = data.bills;
            } else if (Array.isArray(data.billing)) {
                list = data.billing;
            } else if (Array.isArray(data.data)) {
                list = data.data;
            }

            setBills(list);
        } catch (err) {
            console.error("Error fetching bills:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load billing records."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get("/patients");

            const data = response.data;

            let list = [];

            if (Array.isArray(data)) {
                list = data;
            } else if (Array.isArray(data.patients)) {
                list = data.patients;
            } else if (Array.isArray(data.data)) {
                list = data.data;
            }

            setPatients(list);
        } catch (err) {
            console.error("Error fetching patients:", err);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await api.get("/appointments");

            const data = response.data;

            let list = [];

            if (Array.isArray(data)) {
                list = data;
            } else if (Array.isArray(data.appointments)) {
                list = data.appointments;
            } else if (Array.isArray(data.data)) {
                list = data.data;
            }

            setAppointments(list);
        } catch (err) {
            console.error("Error fetching appointments:", err);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBills();
    };

    const resetForm = () => {
        setFormData({
            patient_id: "",
            appointment_id: "",
            consultation_fee: "",
            medicine_fee: "",
            test_fee: "",
            other_fee: "",
            total_amount: "",
            payment_status: "Pending",
            payment_method: "",
        });
    };

    const openAddModal = () => {
        setEditingBill(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (bill) => {
        setEditingBill(bill);

        setFormData({
            patient_id: bill.patient_id || "",
            appointment_id: bill.appointment_id || "",
            consultation_fee: bill.consultation_fee ?? "",
            medicine_fee: bill.medicine_fee ?? "",
            test_fee: bill.test_fee ?? "",
            other_fee: bill.other_fee ?? "",
            total_amount: bill.total_amount ?? "",
            payment_status: bill.payment_status || "Pending",
            payment_method: bill.payment_method || "",
        });

        setShowModal(true);
    };

    const openViewModal = (bill) => {
        setSelectedBill(bill);
        setShowViewModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBill(null);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            if (
                [
                    "consultation_fee",
                    "medicine_fee",
                    "test_fee",
                    "other_fee",
                ].includes(name)
            ) {
                const consultation =
                    Number(updated.consultation_fee) || 0;

                const medicine =
                    Number(updated.medicine_fee) || 0;

                const test =
                    Number(updated.test_fee) || 0;

                const other =
                    Number(updated.other_fee) || 0;

                updated.total_amount = (
                    consultation +
                    medicine +
                    test +
                    other
                ).toFixed(2);
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");

            const billData = {
                patient_id: Number(formData.patient_id),
                appointment_id: formData.appointment_id
                    ? Number(formData.appointment_id)
                    : null,
                consultation_fee:
                    Number(formData.consultation_fee) || 0,
                medicine_fee:
                    Number(formData.medicine_fee) || 0,
                test_fee:
                    Number(formData.test_fee) || 0,
                other_fee:
                    Number(formData.other_fee) || 0,
                total_amount:
                    Number(formData.total_amount) || 0,
                payment_status: formData.payment_status,
                payment_method:
                    formData.payment_method || null,
            };

            if (editingBill) {
                await api.put(
                    `/billing/${editingBill.id}`,
                    billData
                );
            } else {
                await api.post("/billing", billData);
            }

            closeModal();
            fetchBills();
        } catch (err) {
            console.error("Error saving bill:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to save billing record."
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this bill?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await api.delete(`/billing/${id}`);

            fetchBills();
        } catch (err) {
            console.error("Error deleting bill:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to delete billing record."
            );
        }
    };

    const getPatientName = (bill) => {
        return (
            bill.patient_name ||
            bill.patientName ||
            patients.find(
                (patient) =>
                    Number(patient.id) ===
                    Number(bill.patient_id)
            )?.name ||
            `Patient #${bill.patient_id}`
        );
    };

    const getAppointmentLabel = (bill) => {
        if (bill.appointment_id) {
            const appointment = appointments.find(
                (item) =>
                    Number(item.id) ===
                    Number(bill.appointment_id)
            );

            if (appointment) {
                return `#${appointment.id}`;
            }

            return `#${bill.appointment_id}`;
        }

        return "None";
    };

    const getPaymentStatusClass = (status) => {
        if (status === "Paid") {
            return "bg-emerald-100 text-emerald-700";
        }

        if (status === "Partially Paid") {
            return "bg-amber-100 text-amber-700";
        }

        return "bg-red-100 text-red-700";
    };

    const filteredBills = bills.filter((bill) => {
        const search = searchTerm.toLowerCase();

        return (
            String(bill.id || "")
                .toLowerCase()
                .includes(search) ||
            getPatientName(bill)
                .toLowerCase()
                .includes(search) ||
            String(bill.payment_status || "")
                .toLowerCase()
                .includes(search) ||
            String(bill.payment_method || "")
                .toLowerCase()
                .includes(search)
        );
    });

    const totalRevenue = bills.reduce(
        (sum, bill) =>
            sum + Number(bill.total_amount || 0),
        0
    );

    const paidRevenue = bills
        .filter((bill) => bill.payment_status === "Paid")
        .reduce(
            (sum, bill) =>
                sum + Number(bill.total_amount || 0),
            0
        );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Billing
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage patient bills, payments and hospital charges
                    </p>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
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
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Create Bill
                    </button>

                </div>
            </div>


            {/* Error */}
            {error && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <span>{error}</span>

                    <button
                        onClick={() => setError("")}
                    >
                        <X size={18} />
                    </button>

                </div>
            )}


            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-blue-50 p-3">
                            <Receipt
                                size={22}
                                className="text-blue-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Total Bills
                            </p>

                            <p className="text-2xl font-bold text-slate-800">
                                {bills.length}
                            </p>
                        </div>

                    </div>

                </div>


                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-emerald-50 p-3">
                            <IndianRupee
                                size={22}
                                className="text-emerald-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Total Billing
                            </p>

                            <p className="text-2xl font-bold text-slate-800">
                                ₹
                                {totalRevenue.toFixed(
                                    2
                                )}
                            </p>
                        </div>

                    </div>

                </div>


                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-purple-50 p-3">
                            <CreditCard
                                size={22}
                                className="text-purple-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Paid Amount
                            </p>

                            <p className="text-2xl font-bold text-slate-800">
                                ₹
                                {paidRevenue.toFixed(
                                    2
                                )}
                            </p>
                        </div>

                    </div>

                </div>

            </div>


            {/* Search */}
            <div className="relative">

                <Search
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    placeholder="Search by patient, payment status, payment method..."
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

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
                                Loading billing records...
                            </p>

                        </div>

                    </div>

                ) : filteredBills.length === 0 ? (

                    <div className="flex min-h-[300px] flex-col items-center justify-center">

                        <div className="rounded-full bg-slate-100 p-4">
                            <Receipt
                                size={30}
                                className="text-slate-400"
                            />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-700">
                            No billing records found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {searchTerm
                                ? "Try changing your search term."
                                : "Create the first bill to get started."}
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px] text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">

                                <tr>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Bill ID
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Patient
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Appointment
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Method
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {filteredBills.map(
                                    (bill) => (

                                        <tr
                                            key={bill.id}
                                            className="transition hover:bg-slate-50"
                                        >

                                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                                                #{
                                                    bill.id
                                                }
                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="rounded-full bg-blue-50 p-2">
                                                        <User
                                                            size={
                                                                17
                                                            }
                                                            className="text-blue-600"
                                                        />
                                                    </div>

                                                    <div>

                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {getPatientName(
                                                                bill
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            Patient ID:{" "}
                                                            {
                                                                bill.patient_id
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {
                                                    getAppointmentLabel(
                                                        bill
                                                    )
                                                }
                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-1 text-sm font-bold text-slate-800">

                                                    <IndianRupee
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    {Number(
                                                        bill.total_amount ||
                                                            0
                                                    ).toFixed(
                                                        2
                                                    )}

                                                </div>

                                            </td>


                                            <td className="px-5 py-4">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClass(
                                                        bill.payment_status
                                                    )}`}
                                                >
                                                    {
                                                        bill.payment_status ||
                                                        "Pending"
                                                    }
                                                </span>

                                            </td>


                                            <td className="px-5 py-4">

                                                <span className="text-sm text-slate-600">
                                                    {
                                                        bill.payment_method ||
                                                        "N/A"
                                                    }
                                                </span>

                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2 text-sm text-slate-600">

                                                    <Calendar
                                                        size={
                                                            16
                                                        }
                                                        className="text-slate-400"
                                                    />

                                                    {bill.bill_date
                                                        ? new Date(
                                                              bill.bill_date
                                                          ).toLocaleDateString()
                                                        : "N/A"}

                                                </div>

                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        onClick={() =>
                                                            openViewModal(
                                                                bill
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
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
                                                                bill
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
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
                                                                bill.id
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
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

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* Add / Edit Modal */}
            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingBill
                                        ? "Edit Bill"
                                        : "Create Bill"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter patient charges and payment information.
                                </p>

                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={22} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            {/* Patient + Appointment */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Patient *
                                    </label>

                                    <select
                                        name="patient_id"
                                        value={
                                            formData.patient_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select Patient
                                        </option>

                                        {patients.map(
                                            (patient) => (
                                                <option
                                                    key={
                                                        patient.id
                                                    }
                                                    value={
                                                        patient.id
                                                    }
                                                >
                                                    {
                                                        patient.name
                                                    }{" "}
                                                    — ID{" "}
                                                    {
                                                        patient.id
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Appointment
                                    </label>

                                    <select
                                        name="appointment_id"
                                        value={
                                            formData.appointment_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            No Appointment
                                        </option>

                                        {appointments.map(
                                            (appointment) => (
                                                <option
                                                    key={
                                                        appointment.id
                                                    }
                                                    value={
                                                        appointment.id
                                                    }
                                                >
                                                    Appointment #
                                                    {
                                                        appointment.id
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            {/* Charges */}
                            <div>

                                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                                    Charges
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div>

                                        <label className="mb-2 block text-sm text-slate-600">
                                            Consultation Fee
                                        </label>

                                        <input
                                            type="number"
                                            name="consultation_fee"
                                            value={
                                                formData.consultation_fee
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    <div>

                                        <label className="mb-2 block text-sm text-slate-600">
                                            Medicine Fee
                                        </label>

                                        <input
                                            type="number"
                                            name="medicine_fee"
                                            value={
                                                formData.medicine_fee
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    <div>

                                        <label className="mb-2 block text-sm text-slate-600">
                                            Test Fee
                                        </label>

                                        <input
                                            type="number"
                                            name="test_fee"
                                            value={
                                                formData.test_fee
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    <div>

                                        <label className="mb-2 block text-sm text-slate-600">
                                            Other Fee
                                        </label>

                                        <input
                                            type="number"
                                            name="other_fee"
                                            value={
                                                formData.other_fee
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* Total */}
                            <div className="rounded-xl bg-blue-50 p-5">

                                <div className="flex items-center justify-between">

                                    <span className="font-semibold text-slate-700">
                                        Total Amount
                                    </span>

                                    <span className="text-2xl font-bold text-blue-700">
                                        ₹
                                        {Number(
                                            formData.total_amount ||
                                                0
                                        ).toFixed(2)}
                                    </span>

                                </div>

                            </div>


                            {/* Payment */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Payment Status
                                    </label>

                                    <select
                                        name="payment_status"
                                        value={
                                            formData.payment_status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="Partially Paid">
                                            Partially Paid
                                        </option>

                                        <option value="Paid">
                                            Paid
                                        </option>

                                    </select>

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Payment Method
                                    </label>

                                    <select
                                        name="payment_method"
                                        value={
                                            formData.payment_method
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select Method
                                        </option>

                                        <option value="Cash">
                                            Cash
                                        </option>

                                        <option value="Card">
                                            Card
                                        </option>

                                        <option value="UPI">
                                            UPI
                                        </option>

                                        <option value="Online">
                                            Online
                                        </option>

                                    </select>

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
                                    {editingBill
                                        ? "Update Bill"
                                        : "Create Bill"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* View Modal */}
            {showViewModal &&
                selectedBill && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                                <div>

                                    <h2 className="text-xl font-bold text-slate-800">
                                        Bill #
                                        {
                                            selectedBill.id
                                        }
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Complete billing details
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                                >
                                    <X size={22} />
                                </button>

                            </div>


                            <div className="space-y-5 p-6">

                                {/* Patient */}
                                <div className="rounded-xl bg-blue-50 p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="rounded-full bg-white p-3">

                                            <User
                                                size={24}
                                                className="text-blue-600"
                                            />

                                        </div>

                                        <div>

                                            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                                                Patient
                                            </p>

                                            <p className="text-lg font-bold text-slate-800">
                                                {getPatientName(
                                                    selectedBill
                                                )}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Patient ID:{" "}
                                                {
                                                    selectedBill.patient_id
                                                }
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Charges */}
                                <div>

                                    <h3 className="mb-3 text-sm font-semibold text-slate-700">
                                        Bill Breakdown
                                    </h3>

                                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">

                                        <div className="flex justify-between p-4 text-sm">

                                            <span className="text-slate-500">
                                                Consultation Fee
                                            </span>

                                            <span className="font-medium text-slate-700">
                                                ₹
                                                {Number(
                                                    selectedBill.consultation_fee ||
                                                        0
                                                ).toFixed(
                                                    2
                                                )}
                                            </span>

                                        </div>


                                        <div className="flex justify-between p-4 text-sm">

                                            <span className="text-slate-500">
                                                Medicine Fee
                                            </span>

                                            <span className="font-medium text-slate-700">
                                                ₹
                                                {Number(
                                                    selectedBill.medicine_fee ||
                                                        0
                                                ).toFixed(
                                                    2
                                                )}
                                            </span>

                                        </div>


                                        <div className="flex justify-between p-4 text-sm">

                                            <span className="text-slate-500">
                                                Test Fee
                                            </span>

                                            <span className="font-medium text-slate-700">
                                                ₹
                                                {Number(
                                                    selectedBill.test_fee ||
                                                        0
                                                ).toFixed(
                                                    2
                                                )}
                                            </span>

                                        </div>


                                        <div className="flex justify-between p-4 text-sm">

                                            <span className="text-slate-500">
                                                Other Fee
                                            </span>

                                            <span className="font-medium text-slate-700">
                                                ₹
                                                {Number(
                                                    selectedBill.other_fee ||
                                                        0
                                                ).toFixed(
                                                    2
                                                )}
                                            </span>

                                        </div>


                                        <div className="flex justify-between bg-blue-50 p-4">

                                            <span className="font-bold text-slate-700">
                                                Total Amount
                                            </span>

                                            <span className="font-bold text-blue-700">
                                                ₹
                                                {Number(
                                                    selectedBill.total_amount ||
                                                        0
                                                ).toFixed(
                                                    2
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                {/* Payment */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs text-slate-400">
                                            Payment Status
                                        </p>

                                        <span
                                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClass(
                                                selectedBill.payment_status
                                            )}`}
                                        >
                                            {
                                                selectedBill.payment_status
                                            }
                                        </span>

                                    </div>


                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs text-slate-400">
                                            Payment Method
                                        </p>

                                        <p className="mt-2 font-semibold text-slate-700">
                                            {
                                                selectedBill.payment_method ||
                                                "N/A"
                                            }
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs text-slate-400">
                                            Appointment
                                        </p>

                                        <p className="mt-2 font-semibold text-slate-700">
                                            {
                                                getAppointmentLabel(
                                                    selectedBill
                                                )
                                            }
                                        </p>

                                    </div>

                                </div>


                                {/* Date */}
                                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                                    <Calendar
                                        size={19}
                                        className="text-slate-500"
                                    />

                                    <div>

                                        <p className="text-xs text-slate-400">
                                            Bill Date
                                        </p>

                                        <p className="font-semibold text-slate-700">
                                            {selectedBill.bill_date
                                                ? new Date(
                                                      selectedBill.bill_date
                                                  ).toLocaleString()
                                                : "N/A"}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                                <button
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
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

export default Billing;