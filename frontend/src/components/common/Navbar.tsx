import React, { useMemo, useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { Database, Menu, X } from 'lucide-react';

type RouteItem = {
  path: string;
  label: string;
  end?: boolean;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-purple-400 font-semibold border-b-2 border-purple-400 pb-1'
    : 'text-gray-300 hover:text-purple-400 transition-colors';

const Navbar: React.FC = React.memo(function Navbar() {
  const { isLoggedIn, isAdmin } = useAuthContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const baseRoutes: RouteItem[] = useMemo(
    () =>
      isLoggedIn
        ? [
            { path: '/', label: 'Home', end: true },
            { path: '/upload', label: 'Upload' },
            { path: '/gallery', label: 'Assets' },
          ]
        : [{ path: '/', label: 'Home', end: true }],
    [isLoggedIn],
  );

  const adminRoutes: RouteItem[] = useMemo(
    () =>
      isAdmin
        ? [
            { path: '/admin/dashboard', label: 'Admin Dashboard' },
            // { path: "/admin/workers", label: "Workers" },
            // { path: "/admin/storage", label: "Storage" },
            // { path: "/admin/users", label: "Users" },
            // { path: "/analytics", label: "Analytics" },
          ]
        : [],
    [isAdmin],
  );

  const authLinks: RouteItem[] = useMemo(() => {
    if (isLoggedIn) {
      return [
        // { path: "/profile", label: "Profile" },
        { path: '/logout', label: 'Logout' },
      ];
    }
    return [
      { path: '/signin', label: 'Sign In' },
      { path: '/signup', label: 'Sign Up' },
    ];
  }, [isLoggedIn]);

  return (
    <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" className="flex items-center space-x-2 group">
            <Database className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              DAM Platform
            </span>
          </NavLink>

          <div className="hidden md:flex space-x-6 font-medium">
            {[...baseRoutes, ...adminRoutes].map(({ path, label, end }) => (
              <NavLink key={path} to={path} end={end} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex space-x-4 items-center">
            {authLinks.map(({ path, label }, index) => (
              <NavLink
                key={path}
                to={path}
                className={
                  index === authLinks.length - 1 && !isLoggedIn
                    ? 'px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium'
                    : 'text-gray-300 hover:text-white transition-colors font-medium'
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          <button
            className="md:hidden text-white hover:text-purple-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-slate-900 border-t border-purple-500/20 shadow-lg"
        >
          <div className="px-4 py-4 space-y-3">
            {[...baseRoutes, ...adminRoutes].map(({ path, label, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({ isActive }) =>
                  isActive
                    ? 'block text-purple-400 font-semibold py-2 border-l-4 border-purple-400 pl-3'
                    : 'block text-gray-300 hover:text-purple-400 py-2 border-l-4 border-transparent hover:border-purple-400/50 pl-3 transition-all'
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}

            <div className="pt-4 border-t border-purple-500/20 space-y-3">
              {authLinks.map(({ path, label }, index) => (
                <NavLink
                  key={path}
                  to={path}
                  className={
                    index === authLinks.length - 1 && !isLoggedIn
                      ? 'block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-center'
                      : 'block text-gray-300 hover:text-purple-400 py-2 border-l-4 border-transparent hover:border-purple-400/50 pl-3 transition-all'
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

export default Navbar;
