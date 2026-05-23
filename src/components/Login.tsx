/* Login.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlineWarning,
} from "react-icons/ai";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // Renamed for clarity: Google operation now causes a redirect, not a temporary loading state.
  const [googleRedirecting, setGoogleRedirecting] = useState<boolean>(false);

  const { login, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // CRITICAL REDIRECT CHECK: Navigates away if the user is successfully logged in.
  useEffect(() => {
    if (currentUser) {
      // Use replace to prevent the user from navigating back to the login page
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);

      // Clear fields on success
      setEmail("");
      setPassword("");
    } catch (err: any) {
      let userFriendlyError = "An unexpected error occurred. Please try again.";

      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          userFriendlyError = "Invalid email or password.";
          break;
        case "auth/user-disabled":
          userFriendlyError = "Your account has been disabled.";
          break;
        case "auth/too-many-requests":
          userFriendlyError =
            'Too many failed login attempts. Try again later or use the "Forgot Password" link.';
          break;
        default:
          console.error("Firebase Login Error:", err);
          break;
      }
      setError("⚠️ " + userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 UPDATED: Google login uses redirect
  const handleGoogleLogin = async () => {
    setError("");
    setGoogleRedirecting(true); // Indicate that the redirect process has started
    try {
      // Triggers the full page redirect.
      await loginWithGoogle();

      // NOTE: Code execution stops here as the page redirects.
      // setGoogleRedirecting(false) will only run if the initial redirect setup fails.
    } catch (err: any) {
      // Error handling for when the *initial* redirect fails.
      // Popup errors are removed since we are using signInWithRedirect.
      if (
        err.code === "auth/cancelled-popup-request" ||
        err.code === "auth/cancelled-by-user"
      ) {
        // User cancelled the flow before the redirect started or during redirect setup.
      } else {
        setError(
          "⚠️ Failed to start Google sign-in process. Please try again.",
        );
        console.error("Firebase Google Redirect Initiation Error:", err);
      }
    } finally {
      // If the redirect fails immediately, turn off the loading state.
      // If the redirect is successful, the page reload makes this irrelevant.
      setGoogleRedirecting(false);
    }
  };

  // Early return if the user is logged in
  if (currentUser) {
    return null;
  }

  // Combine loading states for UI disability
  const isAnyLoading = loading || googleRedirecting;

  return (
    <div className="min-h-screen flex bg-neutral-100 py-20 relative overflow-hidden">
      {/* Left banner */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative bg-primary p-12 rounded-l-3xl shadow-lg">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-25 rounded-l-3xl"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop)",
          }}
        />
        <div className="relative z-10 text-white max-w-lg space-y-6 text-left">
          <h1 className="text-5xl font-extrabold leading-tight drop-shadow-lg">
            Your journey to success starts here.
          </h1>
          <p className="text-xl drop-shadow-md">
            Log in to manage your graduate school applications with confidence
            and clarity.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10 bg-white rounded-r-3xl shadow-xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-secondary tracking-wide">
              Grad Manager
            </h2>
            <p className="mt-2 text-neutral-600 font-medium">
              Log in to your account
            </p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isAnyLoading}
            className={`w-full flex items-center justify-center gap-3 bg-white text-secondary font-semibold py-3 px-6 rounded-full text-lg border border-neutral-300 shadow-md hover:bg-neutral-50 transition-all ${
              isAnyLoading ? "cursor-wait opacity-70" : ""
            }`}
          >
            {googleRedirecting ? (
              <AiOutlineLoading3Quarters className="animate-spin" size={22} />
            ) : (
              <FaGoogle size={20} />
            )}
            {googleRedirecting ? "Redirecting..." : "Continue with Google"}
          </button>

          {/* Separator */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-neutral-300" />
            <span className="mx-4 text-neutral-500 font-medium">or</span>
            <div className="flex-grow border-t border-neutral-300" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
            {error && (
              <p className="flex items-center gap-2 text-red-600 text-sm text-center mb-4 font-semibold">
                <AiOutlineWarning size={18} /> {error}
              </p>
            )}

            <div>
              <label
                className="block text-secondary font-semibold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                placeholder="you@example.com"
                required
                disabled={isAnyLoading}
              />
            </div>

            <div className="relative">
              <label
                className="block text-secondary font-semibold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12 text-base"
                placeholder="Enter your password"
                required
                disabled={isAnyLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 top-7 flex items-center px-4 text-secondary hover:text-primary"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <AiFillEye size={20} />
                ) : (
                  <AiFillEyeInvisible size={20} />
                )}
              </button>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm text-primary font-semibold hover:underline block text-right"
            >
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={isAnyLoading}
              className={`w-full bg-primary text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all ${
                loading ? "cursor-wait opacity-70" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <AiOutlineLoading3Quarters
                    className="animate-spin"
                    size={20}
                  />{" "}
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-neutral-600 font-medium select-none">
            <p>
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-primary font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
