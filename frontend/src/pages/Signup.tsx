import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSignUp } from "../hooks/useAuth";

export const Signup = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const navigate = useNavigate();
  const {
    mutateAsync,
    isPending,
    // isError,
    // data,
    // error: errorData,
    // isSuccess,
  } = useSignUp();

  const validate = () => {
    const errors: typeof fieldErrors = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    } else if (name.trim().length > 50) {
      errors.name = "Name must not be more than 50 characters";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 4) {
      errors.password = "Password must be at least 4 characters";
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;
    try {
      await mutateAsync({ name, email, password });
      toast.success("Signup successful, redirecting to login...");
      navigate("/signin");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message;
      setError(errMsg || "Signup failed");
      toast.error(errMsg || "Signup failed");
    }
  };

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 3)
          error = "Name must be at least 3 characters";
        else if (value.trim().length > 50)
          error = "Name must not be more than 50 characters";
        break;

      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email address";
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 4)
          error = "Password must be at least 4 characters";
        break;

      case "confirmPassword":
        if (value !== password) error = "Passwords do not match";
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Name
            </label>
            <input
              type="text"
              onChange={(e) => {
                setName(e.target.value);
                validateField("name", e.target.value);
              }}
              value={name}
              placeholder="Enter your name"
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-green-500 focus:outline-none`}
            />
            {fieldErrors.name && (
              <p className="text-red-600 text-xs mt-1 text-left">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Email
            </label>
            <input
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
                validateField("email", e.target.value);
              }}
              value={email}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-green-500 focus:outline-none`}
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-xs mt-1 text-left">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => {
                setPassword(e.target.value);
                validateField("password", e.target.value);
                validateField("confirmPassword", confirmPassword);
              }}
              value={password}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.password ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-green-500 focus:outline-none`}
            />
            {fieldErrors.password && (
              <p className="text-red-600 text-xs mt-1 text-left">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validateField("confirmPassword", e.target.value);
              }}
              value={confirmPassword}
              className={`w-full px-4 py-2 rounded-lg border ${
                fieldErrors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:ring-2 focus:ring-green-500 focus:outline-none`}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1 text-left">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition font-medium"
            disabled={isPending}
          >
            {isPending ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={"/signin"}
            className="text-green-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
