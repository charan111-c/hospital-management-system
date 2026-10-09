import {
    Bell,
    Search,
    Menu
} from "lucide-react";


function Navbar({ setMobileOpen }) {

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );


    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">

            {/* Left */}

            <div className="flex items-center gap-4">

                <button
                    onClick={() => setMobileOpen(true)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                >
                    <Menu size={22} />
                </button>


                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex md:w-72 lg:w-96">

                    <Search
                        size={18}
                        className="text-slate-400"
                    />

                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />

                </div>

            </div>


            {/* Right */}

            <div className="flex items-center gap-3 sm:gap-5">

                {/* Mobile search */}

                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden">
                    <Search size={20} />
                </button>


                {/* Notifications */}

                <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">

                    <Bell size={21} />

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

                </button>


                {/* User */}

                <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-5">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">

                        {user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"
                        }

                    </div>


                    <div className="hidden sm:block">

                        <p className="text-sm font-semibold text-slate-800">
                            {user.name || "User"}
                        </p>

                        <p className="text-xs text-slate-500">
                            {user.role || "USER"}
                        </p>

                    </div>

                </div>

            </div>

        </header>
    );
}

export default Navbar;