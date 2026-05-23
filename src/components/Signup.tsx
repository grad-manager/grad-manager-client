/* Signup.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed
import { Globe, X, ChevronDown, Mail } from "lucide-react"; // Added Mail icon
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlineWarning,
} from "react-icons/ai";

// REQUIRED IMPORT: Use the actual upload utility
import { uploadFile } from "../firebase/storageUtils";

// Mock list of countries for the multiselect
const COUNTRIES_LIST = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar (Burma)",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine State",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

// Updated Gender Type
type GenderType = "Male" | "Female" | "";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [gender, setGender] = useState<GenderType>("");
  const [bio, setBio] = useState<string>("");

  // State for Target Countries
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  // State to control the custom dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  // Ref to close the dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [receiveEmailNotifications, setReceiveEmailNotifications] =
    useState<boolean>(true);
  const [receivePushNotifications, setReceivePushNotifications] =
    useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // 🚀 NEW STATE: To show the success message after sign-up, replacing immediate redirect
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);

  // Destructure `saveUserData` as it's no longer needed in the email signup flow
  const { signup, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // CRITICAL REDIRECT CHECK
  useEffect(() => {
    // If the user is already logged in, navigate away.
    if (currentUser) {
      navigate("/awaiting-verification", { replace: true });
    }
  }, [currentUser, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  // Logic for target country selection
  const toggleCountry = (country: string) => {
    setTargetCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // This should check that required fields are present before proceeding
    if (!firstName || !lastName || !email || !password) {
      setError(
        "Please fill in all required fields (First Name, Last Name, Email, Password).",
      );
      setLoading(false);
      return;
    }

    try {
      let finalPhotoURL: string | null = null;
      let userId: string | undefined;

      // 🛑 CRITICAL CHANGE 1: Prepare the initial data object
      const initialProfileData: Record<string, any> = {
        firstName,
        lastName,
        gender: gender || null,
        bio: bio || null,
        targetCountries: targetCountries,
        notificationSettings: {
          email: receiveEmailNotifications,
          push: receivePushNotifications,
        },
        role: "user", // Set default role
        // photoURL will be added after upload
      };

      // 🛑 CRITICAL CHANGE 2: Call signup with the third argument (initialData)
      // This function call handles:
      // 1. Creating the user in Firebase Auth.
      // 2. Setting the displayName: `${firstName} ${lastName}`.
      // 3. Creating the initial Firestore user document with all data in initialProfileData.
      // 4. Sending the verification email.
      // 5. Signing the user OUT.
      const userCredential = await signup(email, password, initialProfileData);
      const user = userCredential.user;
      // eslint-disable-next-line prefer-const
      userId = user.uid;

      // 🛑 CRITICAL CHANGE 3: Handle photo upload *after* user is created
      if (imageFile && userId) {
        // Upload the image using the newly created userId
        finalPhotoURL = await uploadFile(imageFile, userId);

        // Update the user's Auth profile and Firestore document with the photo URL
        await updateProfile(user, {
          photoURL: finalPhotoURL,
        });

        // Update Firestore document with the photoURL (using setDoc with merge)
        await setDoc(
          doc(db, "users", userId),
          {
            photoURL: finalPhotoURL,
          },
          { merge: true },
        );
      }

      // 🛑 CRITICAL CHANGE 4: The separate setDoc and saveUserData calls are now removed
      // as they are handled *inside* the useAuth().signup() function.

      // Success: Show the success message.
      setSignupSuccess(true);
    } catch (err: any) {
      console.error(err);
      // Provide better error feedback
      let errorMessage = "An unknown error occurred.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage =
          "The email address is already in use by another account.";
      } else if (err.code === "auth/weak-password") {
        errorMessage =
          "The password is too weak. It must be at least 6 characters.";
      } else if (err.code && err.code.includes("storage")) {
        errorMessage = "Failed to upload profile picture. Please try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError("⚠️ Failed to create an account: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // The useEffect hook will handle the redirect after successful Google login
    } catch (err: any) {
      // Improved Google login error handling for popup issues
      if (err.code === "auth/popup-blocked") {
        setError(
          "⚠️ Login failed. Your browser blocked the pop-up. Please allow pop-ups and try again.",
        );
      } else if (err.code === "auth/popup-closed-by-user") {
        // Ignore or log user closing the popup
      } else {
        setError("⚠️ Failed to sign up with Google: " + err.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Helper component for the selected countries pill
  const SelectedCountryPill: React.FC<{ country: string }> = ({ country }) => (
    <span className="flex items-center bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full border border-primary/20 shadow-sm whitespace-nowrap">
      {country}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleCountry(country);
        }}
        className="ml-2 text-primary/80 hover:text-primary transition-colors"
        aria-label={`Remove ${country}`}
      >
        <X size={12} />
      </button>
    </span>
  );

  // Early return if the user is logged in
  if (currentUser) {
    return null;
  }

  // RENDER: Success Message after sign up
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl text-center space-y-6 animate-fade-in">
          <Mail
            size={48}
            className="text-primary mx-auto animate-bounce-slow"
          />
          <h2 className="text-3xl font-bold text-secondary">
            Verification Email Sent!
          </h2>
          <p className="text-neutral-700 text-lg">
            Thank you for signing up, **{firstName}**!
          </p>
          <p className="text-neutral-600">
            We've sent a verification link to **{email}**. Please click the link
            in that email to activate your account and log in.
          </p>
          <Link
            to="/login"
            className="inline-block w-full bg-primary text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
          >
            Go to Login Page
          </Link>
          <p className="text-sm text-neutral-500 mt-4">
            *Note: Check your spam folder if you don't see it within a few
            minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-100 py-20">
      {/* Left side banner for large screens (omitted for brevity) */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-primary p-12 animate-fade-in rounded-l-3xl shadow-lg">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700 ease-in-out opacity-25 rounded-l-3xl"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8fHw%3D)",
          }}
        />
        <div className="relative z-10 text-white max-w-lg space-y-6 text-left">
          <h1 className="text-5xl font-extrabold leading-tight animate-slide-up drop-shadow-lg">
            Begin your journey to success.
          </h1>
          <p className="text-xl animate-slide-up animation-delay-300 drop-shadow-md">
            Create an account to start tracking your graduate school
            applications with confidence.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10 bg-white animate-fade-in rounded-r-3xl shadow-xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center animate-slide-up">
            <h2 className="text-4xl font-extrabold text-secondary tracking-wide">
              Grad Manager
            </h2>
            <p className="mt-2 text-neutral-600 font-medium">
              Create a new account
            </p>
          </div>

          {/* Google signup button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className={`w-full flex items-center justify-center gap-3 bg-white text-secondary font-semibold py-3 px-6 rounded-full text-lg border border-neutral-300 shadow-md hover:bg-neutral-50 transition-all duration-300 animate-slide-up animation-delay-200 ${
              googleLoading ? "cursor-wait opacity-70" : ""
            }`}
          >
            {googleLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin" size={22} />
            ) : (
              <FaGoogle size={20} />
            )}
            {googleLoading ? "Signing up..." : "Continue with Google"}
          </button>

          {/* Separator */}
          <div className="flex items-center my-6 animate-slide-up animation-delay-300">
            <div className="flex-grow border-t border-neutral-300" />
            <span className="mx-4 text-neutral-500 font-medium">or</span>
            <div className="flex-grow border-t border-neutral-300" />
          </div>

          {/* Email/password signup form */}
          <form onSubmit={handleEmailSignup} className="space-y-6">
            {error && (
              <p className="flex items-center gap-2 text-red-600 text-sm text-center mb-4 animate-slide-up animation-delay-300 font-semibold">
                <AiOutlineWarning size={18} /> {error}
              </p>
            )}

            <div className="flex space-x-4">
              <div className="w-1/2">
                <label
                  className="block text-secondary font-semibold mb-2"
                  htmlFor="firstName"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base"
                  placeholder="John"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
              <div className="w-1/2">
                <label
                  className="block text-secondary font-semibold mb-2"
                  htmlFor="lastName"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base"
                  placeholder="Doe"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-secondary font-semibold mb-2"
                htmlFor="email"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base"
                placeholder="you@example.com"
                required
                disabled={loading || googleLoading}
              />
            </div>

            <div className="relative">
              <label
                className="block text-secondary font-semibold mb-2"
                htmlFor="password"
              >
                Password *
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 pr-12 text-base"
                placeholder="Enter your password"
                required
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 top-7 flex items-center px-4 text-secondary hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <AiFillEye size={20} />
                ) : (
                  <AiFillEyeInvisible size={20} />
                )}
              </button>
            </div>

            {/* Profile Picture Upload Field */}
            <div>
              <label
                className="block text-secondary font-semibold mb-2"
                htmlFor="profilePicture"
              >
                Profile Picture (Optional)
              </label>
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={loading || googleLoading}
              />
              {imageFile && (
                <p className="mt-2 text-sm text-neutral-600">
                  Selected file: **{imageFile.name}**
                </p>
              )}
            </div>

            {/* Gender Select Field (Updated options) */}
            <div>
              <label
                className="block text-secondary font-semibold mb-2"
                htmlFor="gender"
              >
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderType)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base bg-white"
                disabled={loading || googleLoading}
              >
                <option value="" disabled>
                  Select your gender (Optional)
                </option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            {/* Custom Checkbox Multiselect for Target Countries */}
            <div className="mb-6 relative" ref={dropdownRef}>
              <label
                className="text-secondary font-semibold mb-2 flex items-center gap-2"
                htmlFor="targetCountriesDropdown"
              >
                <Globe size={16} /> Target Countries (Optional)
              </label>

              {/* Display for selected countries */}
              <div
                id="targetCountriesDropdown"
                onClick={() => {
                  if (!(loading || googleLoading)) {
                    setIsDropdownOpen((prev) => !prev);
                  }
                }}
                className={`w-full min-h-[46px] p-2 border border-neutral-300 rounded-lg flex flex-wrap items-center gap-2 cursor-pointer transition-all duration-300 bg-white ${
                  isDropdownOpen
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-neutral-400"
                } ${loading || googleLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                aria-expanded={isDropdownOpen}
                tabIndex={0}
              >
                {targetCountries.length === 0 ? (
                  <span className="text-neutral-500">
                    Select countries you are applying to...
                  </span>
                ) : (
                  <>
                    {targetCountries.map((country) => (
                      <SelectedCountryPill key={country} country={country} />
                    ))}
                  </>
                )}
                <ChevronDown
                  size={18}
                  className={`absolute right-3 transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"}`}
                />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && !(loading || googleLoading) && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {COUNTRIES_LIST.map((country) => (
                    <div
                      key={country}
                      className="flex items-center p-2 hover:bg-neutral-100 cursor-pointer transition-colors"
                      onClick={() => toggleCountry(country)}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={targetCountries.includes(country)}
                        className="mr-3 h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                      />
                      <span className="text-neutral-700">{country}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bio Textarea Field */}
            <div>
              <label
                className="block text-secondary font-semibold mb-2"
                htmlFor="bio"
              >
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base resize-none"
                placeholder="Tell us a little about yourself (e.g., your field of study, interests)."
                disabled={loading || googleLoading}
              />
            </div>

            {/* Checkbox for email notifications */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="receiveEmailNotifications"
                checked={receiveEmailNotifications}
                onChange={(e) => setReceiveEmailNotifications(e.target.checked)}
                className="mr-2 h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                disabled={loading || googleLoading}
              />
              <label
                htmlFor="receiveEmailNotifications"
                className="text-sm font-medium text-neutral-600"
              >
                I would like to receive email notifications.
              </label>
            </div>

            {/* Checkbox for push notifications */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="receivePushNotifications"
                checked={receivePushNotifications}
                onChange={(e) => setReceivePushNotifications(e.target.checked)}
                className="mr-2 h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                disabled={loading || googleLoading}
              />
              <label
                htmlFor="receivePushNotifications"
                className="text-sm font-medium text-neutral-600"
              >
                I would like to receive push notifications.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full bg-primary text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ${
                loading ? "cursor-wait opacity-70" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <AiOutlineLoading3Quarters
                    className="animate-spin"
                    size={20}
                  />
                  {imageFile ? "Uploading photo..." : "Signing up..."}
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-neutral-600 font-medium select-none">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
