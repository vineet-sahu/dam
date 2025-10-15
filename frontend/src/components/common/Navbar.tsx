import React from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  isAdmin?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAdmin = false }) => {
  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-800">DAM Platform</div>
      <ul className="flex space-x-6 text-gray-700 font-medium">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/upload">Upload</Link>
        </li>
        <li>
          <Link to="/gallery">Assets</Link>
        </li>
        <li>
          <Link to="/analytics">Analytics</Link>
        </li>
        {isAdmin && (
          <>
            <li>
              <Link to="/admin/dashboard">Admin Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/workers">Workers</Link>
            </li>
            <li>
              <Link to="/admin/storage">Storage</Link>
            </li>
            <li>
              <Link to="/admin/users">Users</Link>
            </li>
          </>
        )}
      </ul>
      <div>
        <Link
          to="/profile"
          className="px-3 py-1 rounded-lg hover:bg-gray-100 transition"
        >
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
