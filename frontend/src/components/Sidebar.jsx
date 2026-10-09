import {
    LayoutDashboard,
    Building2,
    Stethoscope,
    Users,
    CalendarDays,
    FileText,
    Pill,
    ClipboardList,
    CreditCard,
    UserCog,
    LogOut,
    X
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";


function Sidebar({ mobileOpen, setMobileOpen }) {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };


    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Departments",
            path: "/departments",
            icon: Building2
        },
        {
            name: "Doctors",
            path: "/doctors",
            icon: Stethoscope
        },
        {
            name: "Patients",
            path: "/patients",
            icon: Users
        },
        {
            name: "Appointments",
            path: "/appointments",
            icon: CalendarDays
        },
        {
            name: "Medical Records",
            path: "/medical-records",
            icon: FileText
        },
        {
            name: "Medicines",
            path: "/medicines",
            icon: Pill
        },
        {
            name: "Prescriptions",
            path: "/prescriptions",
            icon: ClipboardList
        },
        {
            name: "Billing",
            path: "/billing",
            icon: CreditCard
        },
        {
            name: "Staff",
            path: "/staff",
            icon: UserCog
        }
    ];


    return (
        <>
            {/* Mobile overlay */}

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}


            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-64 flex-col
                    bg-slate-950 text-white
                    shadow-xl
                    transition-transform duration-300
                    lg:translate-x-0
                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* Logo */}

                <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-lg">
                            🏥
                        </div>

                        <div>
                            <h1 className="text-lg font-bold tracking-wide">
                                HMS
                            </h1>

                            <p className="text-[10px] text-slate-400">
                                Hospital Management
                            </p>
                        </div>

                    </div>


                    <button
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* Navigation */}

                <nav className="flex-1 overflow-y-auto px-3 py-5">

                    <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Main Menu
                    </p>


                    <div className="space-y-1">

                        {menuItems.map((item) => {

                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        }`
                                    }
                                >

                                    <Icon size={19} />

                                    <span>
                                        {item.name}
                                    </span>

                                </NavLink>
                            );

                        })}

                    </div>

                </nav>


                {/* User section */}

                <div className="border-t border-slate-800 p-4">

                    <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-900 p-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold">
                            {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : "U"
                            }
                        </div>


                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold">
                                {user.name || "User"}
                            </p>

                            <p className="text-xs text-slate-400">
                                {user.role || "USER"}
                            </p>

                        </div>

                    </div>


                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
                    >

                        <LogOut size={18} />

                        Logout

                    </button>

                </div>

            </aside>
        </>
    );
}

export default Sidebar;