import React, { useMemo, useState, useEffect, useRef } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center relative">
      <div className="text-xl font-bold text-gray-800">DAM Platform</div>

      <div className="hidden md:flex space-x-6 font-medium">
        {[...baseRoutes, ...adminRoutes].map(({ path, label, end }) => (
          <NavLink key={path} to={path} end={end} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </div>

      <div className="hidden md:flex space-x-6 font-medium">
        {authLinks.map(({ path, label }) => (
          <NavLink key={path} to={path} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </div>

      <button
        className="md:hidden text-gray-800"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute top-0 right-0 w-2/3 bg-white shadow-md p-6 mt-3 rounded-lg z-10"
        >
          <button
            className="absolute top-4 right-4 text-xl text-gray-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <ul className="flex flex-col space-y-4">
            {[...baseRoutes, ...adminRoutes].map(({ path, label, end }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={end}
                  className={linkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}

            {authLinks.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={linkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
});

export default Navbar;
