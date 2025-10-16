import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

type RouteItem = {
  path: string;
  label: string;
  end?: boolean;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
    : "text-gray-700 hover:text-blue-600";

const Navbar: React.FC = React.memo(function Navbar() {
  const { isLoggedIn, isAdmin } = useAuthContext();

  const baseRoutes: RouteItem[] = useMemo(
    () => [
      { path: "/", label: "Home", end: true },
      { path: "/upload", label: "Upload" },
      { path: "/gallery", label: "Assets" },
      { path: "/analytics", label: "Analytics" },
    ],
    [],
  );

  const adminRoutes: RouteItem[] = useMemo(
    () =>
      isAdmin
        ? [
            { path: "/admin/dashboard", label: "Admin Dashboard" },
            { path: "/admin/workers", label: "Workers" },
            { path: "/admin/storage", label: "Storage" },
            { path: "/admin/users", label: "Users" },
          ]
        : [],
    [isAdmin],
  );

  const authLinks: RouteItem[] = useMemo(() => {
    if (isLoggedIn) {
      return [
        { path: "/profile", label: "Profile" },
        { path: "/logout", label: "Logout" },
      ];
    }
    return [
      { path: "/signin", label: "Sign In" },
      { path: "/signup", label: "Sign Up" },
    ];
  }, [isLoggedIn]);

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-800">DAM Platform</div>

      <ul className="flex space-x-6 font-medium">
        {[...baseRoutes, ...adminRoutes].map(({ path, label, end }) => (
          <li key={path}>
            <NavLink to={path} end={end} className={linkClass}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <ul className="flex space-x-6 font-medium">
        {authLinks.map(({ path, label }) => (
          <li key={path}>
            <NavLink to={path} className={linkClass}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
});

export default Navbar;
