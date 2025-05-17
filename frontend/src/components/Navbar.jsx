import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = ({ handleLogout }) => (
  <nav className="bg-white px-6 py-4 shadow-md flex items-center">
    <div className="max-w-[1150px] mx-auto w-full">
      <div className="flex justify-between items-center text-sm sm:text-base font-medium">
        <div className="flex gap-10">
          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-[#C0C0C0] hover:text-blue-300 transition-colors"
            }
          >
            Invoices
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-[#C0C0C0] hover:text-blue-300 transition-colors"
            }
          >
            Users
          </NavLink>
        </div>
        <div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-red-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;
