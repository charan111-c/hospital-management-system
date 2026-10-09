import { useState } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// ========================================
// PAGES
// ========================================

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";

import Departments from "./pages/Departments";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Medicines from "./pages/Medicines";
import Prescriptions from "./pages/Prescriptions";
import Billing from "./pages/Billing";
import Staff from "./pages/Staff";

// ========================================
// COMPONENTS
// ========================================

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";


// ========================================
// MAIN LAYOUT
// ========================================

function MainLayout({ children }) {

    const [mobileOpen, setMobileOpen] =
        useState(false);

    return (
        <div className="min-h-screen bg-slate-50">

            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="lg:ml-64">

                <Navbar
                    setMobileOpen={setMobileOpen}
                />

                <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}


// ========================================
// ROLE BASED DASHBOARD
// ========================================

function RoleBasedDashboard() {

    const storedUser =
        localStorage.getItem("user");

    let user = null;

    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

    }

    const role = String(
        user?.role || ""
    ).toUpperCase();


    // ========================================
    // PATIENT
    // ========================================

    if (role === "PATIENT") {

        return <PatientDashboard />;

    }


    // ========================================
    // ADMIN
    // ========================================

    return <Dashboard />;
}


// ========================================
// APP
// ========================================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ========================================
                    ROOT
                ======================================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />


                {/* ========================================
                    LOGIN
                ======================================== */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                {/* ========================================
                    REGISTER
                ======================================== */}

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                {/* ========================================
                    DASHBOARD
                ======================================== */}

                <Route
                    path="/dashboard"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <RoleBasedDashboard />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    DEPARTMENTS
                ======================================== */}

                <Route
                    path="/departments"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <Departments />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    DOCTORS
                ======================================== */}

                <Route
                    path="/doctors"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <Doctors />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    PATIENTS
                ======================================== */}

                <Route
                    path="/patients"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <Patients />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    APPOINTMENTS
                ======================================== */}

                <Route
                    path="/appointments"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <Appointments />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    MEDICAL RECORDS
                ======================================== */}

                <Route
                    path="/medical-records"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <MedicalRecords />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    MEDICINES
                ======================================== */}

                <Route
                    path="/medicines"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <Medicines />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    PRESCRIPTIONS
                ======================================== */}

                <Route
                    path="/prescriptions"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <Prescriptions />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    BILLING
                ======================================== */}

                <Route
                    path="/billing"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <Billing />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    STAFF
                ======================================== */}

                <Route
                    path="/staff"
                    element={

                        <ProtectedRoute>

                            <MainLayout>

                                <Staff />

                            </MainLayout>

                        </ProtectedRoute>

                    }
                />


                {/* ========================================
                    INVALID ROUTE
                ======================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );
}


export default App;