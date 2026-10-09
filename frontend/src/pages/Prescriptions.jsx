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
    User,
    Stethoscope,
    Calendar,
    ClipboardList,
} from "lucide-react";
import api from "../services/api";

function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingPrescription, setEditingPrescription] = useState(null);
    const [selectedPrescription, setSelectedPrescription] =
        useState(null);

    const [formData, setFormData] = useState({
        patient_id: "",
        doctor_id: "",
        medicine_id: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        prescribed_date: "",
    });

    useEffect(() => {
        fetchPrescriptions();
        fetchPatients();
        fetchDoctors();
        fetchMedicines();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setError("");

            const response = await api.get("/prescriptions");

            const data = response.data;

            let list = [];

            if (Array.isArray(data)) {
                list = data;
            } else if (Array.isArray(data.prescriptions)) {
                list = data.prescriptions;
            } else if (Array.isArray(data.data)) {
                list = data.data;
            }

            setPrescriptions(list);
        } catch (err) {
            console.error(
                "Error fetching prescriptions:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to load prescriptions."
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

    const fetchDoctors = async () => {
        try {
            const response = await api.get("/doctors");
            const data = response.data;

            let list = [];

            if (Array.isArray(data)) {
                list = data;
            } else if (Array.isArray(data.doctors)) {
                list = data.doctors;
            } else if (Array.isArray(data.data)) {
                list = data.data;
            }

            setDoctors(list);
        } catch (err) {
            console.error("Error fetching doctors:", err);
        }
    };

    const fetchMedicines = async () => {
        try {
            const response = await api.get("/medicines");
            const data = response.data;

            let list = [];

            if (Array.isArray(data)) {
                list = data;
            } else if (Array.isArray(data.medicines)) {
                list = data.medicines;
            } else if (Array.isArray(data.data)) {
                list = data.data;
            }

            setMedicines(list);
        } catch (err) {
            console.error("Error fetching medicines:", err);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPrescriptions();
    };

    const resetForm = () => {
        setFormData({
            patient_id: "",
            doctor_id: "",
            medicine_id: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: "",
            prescribed_date: "",
        });
    };

    const openAddModal = () => {
        setEditingPrescription(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (prescription) => {
        setEditingPrescription(prescription);

        setFormData({
            patient_id: prescription.patient_id || "",
            doctor_id: prescription.doctor_id || "",
            medicine_id: prescription.medicine_id || "",
            dosage: prescription.dosage || "",
            frequency: prescription.frequency || "",
            duration: prescription.duration || "",
            instructions:
                prescription.instructions || "",
            prescribed_date: prescription.prescribed_date
                ? String(
                      prescription.prescribed_date
                  ).substring(0, 10)
                : "",
        });

        setShowModal(true);
    };

    const openViewModal = (prescription) => {
        setSelectedPrescription(prescription);
        setShowViewModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPrescription(null);
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

            const prescriptionData = {
                patient_id: Number(formData.patient_id),
                doctor_id: Number(formData.doctor_id),
                medicine_id: Number(formData.medicine_id),
                dosage: formData.dosage,
                frequency: formData.frequency,
                duration: formData.duration,
                instructions: formData.instructions,
                prescribed_date: formData.prescribed_date,
            };

            if (editingPrescription) {
                await api.put(
                    `/prescriptions/${editingPrescription.id}`,
                    prescriptionData
                );
            } else {
                await api.post(
                    "/prescriptions",
                    prescriptionData
                );
            }

            closeModal();
            fetchPrescriptions();
        } catch (err) {
            console.error(
                "Error saving prescription:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to save prescription."
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this prescription?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await api.delete(`/prescriptions/${id}`);

            fetchPrescriptions();
        } catch (err) {
            console.error(
                "Error deleting prescription:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to delete prescription."
            );
        }
    };

    const getPatientName = (prescription) => {
        return (
            prescription.patient_name ||
            prescription.patientName ||
            patients.find(
                (patient) =>
                    Number(patient.id) ===
                    Number(prescription.patient_id)
            )?.name ||
            `Patient #${prescription.patient_id}`
        );
    };

    const getDoctorName = (prescription) => {
        return (
            prescription.doctor_name ||
            prescription.doctorName ||
            doctors.find(
                (doctor) =>
                    Number(doctor.id) ===
                    Number(prescription.doctor_id)
            )?.name ||
            `Doctor #${prescription.doctor_id}`
        );
    };

    const getMedicineName = (prescription) => {
        return (
            prescription.medicine_name ||
            prescription.medicineName ||
            medicines.find(
                (medicine) =>
                    Number(medicine.id) ===
                    Number(prescription.medicine_id)
            )?.name ||
            `Medicine #${prescription.medicine_id}`
        );
    };

    const filteredPrescriptions =
        prescriptions.filter((prescription) => {
            const search = searchTerm.toLowerCase();

            return (
                String(prescription.id || "")
                    .toLowerCase()
                    .includes(search) ||
                getPatientName(prescription)
                    .toLowerCase()
                    .includes(search) ||
                getDoctorName(prescription)
                    .toLowerCase()
                    .includes(search) ||
                getMedicineName(prescription)
                    .toLowerCase()
                    .includes(search) ||
                String(prescription.dosage || "")
                    .toLowerCase()
                    .includes(search) ||
                String(prescription.frequency || "")
                    .toLowerCase()
                    .includes(search)
            );
        });

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Prescriptions
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage patient prescriptions and medication instructions
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
                        Add Prescription
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


            {/* Search + Count */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

                <div className="lg:col-span-3">

                    <div className="relative">

                        <Search
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search by patient, doctor, medicine..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>


                <div className="rounded-lg border border-slate-200 bg-white px-5 py-3 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-blue-50 p-2">
                            <ClipboardList
                                size={20}
                                className="text-blue-600"
                            />
                        </div>

                        <div>

                            <p className="text-xs text-slate-500">
                                Total Prescriptions
                            </p>

                            <p className="text-xl font-bold text-slate-800">
                                {prescriptions.length}
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
                                Loading prescriptions...
                            </p>

                        </div>

                    </div>

                ) : filteredPrescriptions.length === 0 ? (

                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                        <div className="rounded-full bg-slate-100 p-4">

                            <ClipboardList
                                size={30}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-700">
                            No prescriptions found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {searchTerm
                                ? "Try changing your search term."
                                : "Add the first prescription to get started."}
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1050px] text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">

                                <tr>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        ID
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Patient
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Doctor
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Medicine
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Dosage
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Frequency
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

                                {filteredPrescriptions.map(
                                    (prescription) => (

                                        <tr
                                            key={
                                                prescription.id
                                            }
                                            className="transition hover:bg-slate-50"
                                        >

                                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                #
                                                {
                                                    prescription.id
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
                                                                prescription
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            ID:{" "}
                                                            {
                                                                prescription.patient_id
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    <Stethoscope
                                                        size={
                                                            17
                                                        }
                                                        className="text-emerald-600"
                                                    />

                                                    <p className="text-sm font-medium text-slate-700">
                                                        {getDoctorName(
                                                            prescription
                                                        )}
                                                    </p>

                                                </div>

                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    <div className="rounded-lg bg-purple-50 p-2">

                                                        <Pill
                                                            size={
                                                                16
                                                            }
                                                            className="text-purple-600"
                                                        />

                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {getMedicineName(
                                                            prescription
                                                        )}
                                                    </p>

                                                </div>

                                            </td>


                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {
                                                    prescription.dosage ||
                                                    "N/A"
                                                }
                                            </td>


                                            <td className="px-5 py-4">

                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                    {
                                                        prescription.frequency ||
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

                                                    {prescription.prescribed_date
                                                        ? String(
                                                              prescription.prescribed_date
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
                                                                prescription
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
                                                                prescription
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
                                                                prescription.id
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

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingPrescription
                                        ? "Edit Prescription"
                                        : "Add Prescription"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter prescription and medication details.
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

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                {/* Patient */}
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


                                {/* Doctor */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Doctor *
                                    </label>

                                    <select
                                        name="doctor_id"
                                        value={
                                            formData.doctor_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select Doctor
                                        </option>

                                        {doctors.map(
                                            (doctor) => (
                                                <option
                                                    key={
                                                        doctor.id
                                                    }
                                                    value={
                                                        doctor.id
                                                    }
                                                >
                                                    {
                                                        doctor.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* Medicine */}
                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Medicine *
                                    </label>

                                    <select
                                        name="medicine_id"
                                        value={
                                            formData.medicine_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="">
                                            Select Medicine
                                        </option>

                                        {medicines.map(
                                            (medicine) => (
                                                <option
                                                    key={
                                                        medicine.id
                                                    }
                                                    value={
                                                        medicine.id
                                                    }
                                                >
                                                    {
                                                        medicine.name
                                                    }{" "}
                                                    — Stock:{" "}
                                                    {
                                                        medicine.quantity
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* Dosage */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Dosage
                                    </label>

                                    <input
                                        type="text"
                                        name="dosage"
                                        value={
                                            formData.dosage
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 500mg"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Frequency */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Frequency
                                    </label>

                                    <input
                                        type="text"
                                        name="frequency"
                                        value={
                                            formData.frequency
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Twice daily"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Duration */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Duration
                                    </label>

                                    <input
                                        type="text"
                                        name="duration"
                                        value={
                                            formData.duration
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 5 days"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Date */}
                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Prescribed Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="prescribed_date"
                                        value={
                                            formData.prescribed_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* Instructions */}
                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Instructions
                                </label>

                                <textarea
                                    name="instructions"
                                    value={
                                        formData.instructions
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Enter medication instructions..."
                                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

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
                                    {editingPrescription
                                        ? "Update Prescription"
                                        : "Save Prescription"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* View Modal */}
            {showViewModal &&
                selectedPrescription && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                                <div>

                                    <h2 className="text-xl font-bold text-slate-800">
                                        Prescription Details
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Prescription #
                                        {
                                            selectedPrescription.id
                                        }
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

                                {/* Main Info */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="rounded-xl bg-blue-50 p-4">

                                        <div className="flex items-center gap-2">

                                            <User
                                                size={18}
                                                className="text-blue-600"
                                            />

                                            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                                                Patient
                                            </p>

                                        </div>

                                        <p className="mt-2 font-semibold text-slate-800">
                                            {getPatientName(
                                                selectedPrescription
                                            )}
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-emerald-50 p-4">

                                        <div className="flex items-center gap-2">

                                            <Stethoscope
                                                size={18}
                                                className="text-emerald-600"
                                            />

                                            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                                                Doctor
                                            </p>

                                        </div>

                                        <p className="mt-2 font-semibold text-slate-800">
                                            {getDoctorName(
                                                selectedPrescription
                                            )}
                                        </p>

                                    </div>

                                </div>


                                {/* Medicine */}
                                <div className="rounded-xl bg-purple-50 p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="rounded-full bg-white p-3">

                                            <Pill
                                                size={24}
                                                className="text-purple-600"
                                            />

                                        </div>

                                        <div>

                                            <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                                                Medicine
                                            </p>

                                            <p className="text-lg font-bold text-slate-800">
                                                {getMedicineName(
                                                    selectedPrescription
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Medication Details */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Dosage
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                            {
                                                selectedPrescription.dosage
                                            }
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Frequency
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                            {
                                                selectedPrescription.frequency
                                            }
                                        </p>

                                    </div>


                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Duration
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                            {
                                                selectedPrescription.duration
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
                                            Prescribed Date
                                        </p>

                                        <p className="font-semibold text-slate-700">
                                            {selectedPrescription.prescribed_date
                                                ? String(
                                                      selectedPrescription.prescribed_date
                                                  ).substring(
                                                      0,
                                                      10
                                                  )
                                                : "N/A"}
                                        </p>

                                    </div>

                                </div>


                                {/* Instructions */}
                                <div>

                                    <h3 className="mb-2 text-sm font-semibold text-slate-700">
                                        Instructions
                                    </h3>

                                    <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                        {
                                            selectedPrescription.instructions ||
                                            "No instructions provided."
                                        }
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

export default Prescriptions;