import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    X,
    FileText,
    User,
    Stethoscope,
    Calendar,
} from "lucide-react";
import api from "../services/api";

function MedicalRecords() {
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingRecord, setEditingRecord] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [formData, setFormData] = useState({
        patient_id: "",
        doctor_id: "",
        diagnosis: "",
        symptoms: "",
        treatment: "",
        notes: "",
        record_date: "",
    });

    useEffect(() => {
        fetchRecords();
        fetchPatients();
        fetchDoctors();
    }, []);

    const fetchRecords = async () => {
        try {
            setError("");

            const response = await api.get("/medical-records");

            const data = response.data;

            let recordList = [];

            if (Array.isArray(data)) {
                recordList = data;
            } else if (Array.isArray(data.records)) {
                recordList = data.records;
            } else if (Array.isArray(data.data)) {
                recordList = data.data;
            }

            setRecords(recordList);
        } catch (err) {
            console.error("Error fetching medical records:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load medical records."
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

            let patientList = [];

            if (Array.isArray(data)) {
                patientList = data;
            } else if (Array.isArray(data.patients)) {
                patientList = data.patients;
            } else if (Array.isArray(data.data)) {
                patientList = data.data;
            }

            setPatients(patientList);
        } catch (err) {
            console.error("Error fetching patients:", err);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await api.get("/doctors");

            const data = response.data;

            let doctorList = [];

            if (Array.isArray(data)) {
                doctorList = data;
            } else if (Array.isArray(data.doctors)) {
                doctorList = data.doctors;
            } else if (Array.isArray(data.data)) {
                doctorList = data.data;
            }

            setDoctors(doctorList);
        } catch (err) {
            console.error("Error fetching doctors:", err);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchRecords();
    };

    const resetForm = () => {
        setFormData({
            patient_id: "",
            doctor_id: "",
            diagnosis: "",
            symptoms: "",
            treatment: "",
            notes: "",
            record_date: "",
        });
    };

    const openAddModal = () => {
        setEditingRecord(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (record) => {
        setEditingRecord(record);

        setFormData({
            patient_id: record.patient_id || "",
            doctor_id: record.doctor_id || "",
            diagnosis: record.diagnosis || "",
            symptoms: record.symptoms || "",
            treatment: record.treatment || "",
            notes: record.notes || "",
            record_date: record.record_date
                ? String(record.record_date).substring(0, 10)
                : "",
        });

        setShowModal(true);
    };

    const openViewModal = (record) => {
        setSelectedRecord(record);
        setShowViewModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRecord(null);
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

            const recordData = {
                patient_id: Number(formData.patient_id),
                doctor_id: Number(formData.doctor_id),
                diagnosis: formData.diagnosis,
                symptoms: formData.symptoms,
                treatment: formData.treatment,
                notes: formData.notes,
                record_date: formData.record_date,
            };

            if (editingRecord) {
                await api.put(
                    `/medical-records/${editingRecord.id}`,
                    recordData
                );
            } else {
                await api.post("/medical-records", recordData);
            }

            closeModal();
            fetchRecords();
        } catch (err) {
            console.error("Error saving medical record:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to save medical record."
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this medical record?"
        );

        if (!confirmDelete) return;

        try {
            setError("");

            await api.delete(`/medical-records/${id}`);

            fetchRecords();
        } catch (err) {
            console.error("Error deleting medical record:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to delete medical record."
            );
        }
    };

    const getPatientName = (record) => {
        return (
            record.patient_name ||
            record.patientName ||
            patients.find(
                (patient) => Number(patient.id) === Number(record.patient_id)
            )?.name ||
            `Patient #${record.patient_id}`
        );
    };

    const getDoctorName = (record) => {
        return (
            record.doctor_name ||
            record.doctorName ||
            doctors.find(
                (doctor) => Number(doctor.id) === Number(record.doctor_id)
            )?.name ||
            `Doctor #${record.doctor_id}`
        );
    };

    const filteredRecords = records.filter((record) => {
        const search = searchTerm.toLowerCase();

        return (
            String(record.id || "")
                .toLowerCase()
                .includes(search) ||
            getPatientName(record).toLowerCase().includes(search) ||
            getDoctorName(record).toLowerCase().includes(search) ||
            String(record.diagnosis || "")
                .toLowerCase()
                .includes(search) ||
            String(record.symptoms || "")
                .toLowerCase()
                .includes(search) ||
            String(record.record_date || "")
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
                        Medical Records
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage patient medical history and treatment records
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
                                refreshing ? "animate-spin" : ""
                            }
                        />
                        Refresh
                    </button>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Record
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
                            placeholder="Search by patient, doctor, diagnosis..."
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
                            <FileText
                                size={20}
                                className="text-blue-600"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Total Records
                            </p>

                            <p className="text-xl font-bold text-slate-800">
                                {records.length}
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
                                Loading medical records...
                            </p>
                        </div>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                        <div className="rounded-full bg-slate-100 p-4">
                            <FileText
                                size={30}
                                className="text-slate-400"
                            />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-700">
                            No medical records found
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-slate-500">
                            {searchTerm
                                ? "Try changing your search term."
                                : "There are no medical records yet. Add the first record."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
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
                                        Diagnosis
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
                                {filteredRecords.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                            #{record.id}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-blue-50 p-2">
                                                    <User
                                                        size={17}
                                                        className="text-blue-600"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {getPatientName(
                                                            record
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Patient ID:{" "}
                                                        {
                                                            record.patient_id
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope
                                                    size={17}
                                                    className="text-emerald-600"
                                                />

                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {getDoctorName(
                                                            record
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Doctor ID:{" "}
                                                        {
                                                            record.doctor_id
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="max-w-[220px] px-5 py-4">
                                            <p className="truncate text-sm font-medium text-slate-700">
                                                {record.diagnosis ||
                                                    "Not specified"}
                                            </p>

                                            <p className="mt-1 truncate text-xs text-slate-400">
                                                {record.symptoms ||
                                                    "No symptoms recorded"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar
                                                    size={16}
                                                    className="text-slate-400"
                                                />

                                                {record.record_date
                                                    ? String(
                                                          record.record_date
                                                      ).substring(0, 10)
                                                    : "N/A"}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openViewModal(
                                                            record
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                    title="View"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openEditModal(
                                                            record
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            record.id
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
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

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingRecord
                                        ? "Edit Medical Record"
                                        : "Add Medical Record"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter patient diagnosis and treatment
                                    information.
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
                                {/* Patient */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Patient *
                                    </label>

                                    <select
                                        name="patient_id"
                                        value={formData.patient_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">
                                            Select Patient
                                        </option>

                                        {patients.map((patient) => (
                                            <option
                                                key={patient.id}
                                                value={patient.id}
                                            >
                                                {patient.name} — ID{" "}
                                                {patient.id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Doctor */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Doctor *
                                    </label>

                                    <select
                                        name="doctor_id"
                                        value={formData.doctor_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">
                                            Select Doctor
                                        </option>

                                        {doctors.map((doctor) => (
                                            <option
                                                key={doctor.id}
                                                value={doctor.id}
                                            >
                                                {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Record Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="record_date"
                                        value={formData.record_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Diagnosis */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Diagnosis
                                    </label>

                                    <input
                                        type="text"
                                        name="diagnosis"
                                        value={formData.diagnosis}
                                        onChange={handleChange}
                                        placeholder="Enter diagnosis"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {/* Symptoms */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Symptoms
                                </label>

                                <textarea
                                    name="symptoms"
                                    value={formData.symptoms}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Describe patient symptoms..."
                                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Treatment */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Treatment
                                </label>

                                <textarea
                                    name="treatment"
                                    value={formData.treatment}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter treatment details..."
                                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Additional notes..."
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
                                    {editingRecord
                                        ? "Update Record"
                                        : "Save Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    Medical Record #{selectedRecord.id}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Complete medical record details
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

                        <div className="space-y-5 p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Patient
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {getPatientName(
                                            selectedRecord
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Doctor
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {getDoctorName(
                                            selectedRecord
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Record Date
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {selectedRecord.record_date
                                            ? String(
                                                  selectedRecord.record_date
                                              ).substring(0, 10)
                                            : "N/A"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Diagnosis
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {selectedRecord.diagnosis ||
                                            "Not specified"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                                    Symptoms
                                </h3>

                                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                    {selectedRecord.symptoms ||
                                        "No symptoms recorded."}
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                                    Treatment
                                </h3>

                                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                    {selectedRecord.treatment ||
                                        "No treatment recorded."}
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                                    Notes
                                </h3>

                                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                    {selectedRecord.notes ||
                                        "No additional notes."}
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

export default MedicalRecords;