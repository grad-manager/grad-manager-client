/* Profile.tsx (Final Revision with Checkbox Multi-Select) */

import React, { useState, useRef, useEffect } from "react";
import { useAuth, type UserProfile, type UserProfileUpdate } from "../context/AuthContext";
import { uploadFile } from "../firebase/storageUtils";
import { User, Camera, Loader2, Save, AlertTriangle, Globe, ChevronDown, Check } from "lucide-react";

// --- Comprehensive List of All Countries (ISO 3166-1) ---
const ALL_COUNTRIES: string[] = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", 
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", 
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
    "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", 
    "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
    "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", 
    "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", 
    "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", 
    "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
    "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", 
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
    "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
    "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", 
    "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", 
    "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", 
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
    "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", 
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", 
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", 
    "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", 
    "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", 
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", 
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", 
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", 
    "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", 
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", 
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", 
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", 
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", 
    "Zambia", "Zimbabwe"
];
// --- End Country List ---


// Helper type to handle the default 'Select...' option for the dropdown
type GenderOption = UserProfile['gender'] | '';
type CountryState = string[];


// ------------------------------------------------------------------
// 🚀 NEW COMPONENT: Country Multi-Select Dropdown with Checkboxes 🚀
// ------------------------------------------------------------------

interface CountryMultiSelectDropdownProps {
    selectedCountries: string[];
    onSelectionChange: (countries: string[]) => void;
    disabled: boolean;
}

const CountryMultiSelectDropdown: React.FC<CountryMultiSelectDropdownProps> = ({
    selectedCountries,
    onSelectionChange,
    disabled,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(''); // Clear search when closing
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCountry = (country: string) => {
        if (disabled) return;
        if (selectedCountries.includes(country)) {
            onSelectionChange(selectedCountries.filter(c => c !== country));
        } else {
            // Sort the array upon adding a new country for consistent ordering
            onSelectionChange([...selectedCountries, country].sort());
        }
    };

    const handleToggleDropdown = () => {
        if (!disabled) {
            setIsOpen(prev => !prev);
        }
    };

    const filteredCountries = ALL_COUNTRIES.filter(country =>
        country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayValue = selectedCountries.length === 0
        ? 'Select target countries...'
        : selectedCountries.length === ALL_COUNTRIES.length
            ? 'All Countries Selected'
            : `${selectedCountries.length} selected`;

    return (
        <div className="relative z-100" ref={dropdownRef}>
            {/* Display Button */}
            <button
                type="button"
                onClick={handleToggleDropdown}
                className={`flex justify-between items-center w-full p-3 border rounded-lg shadow-sm bg-white text-left transition text-base ${
                    disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={disabled}
            >
                <div className="flex items-center">
                    <Globe size={18} className="mr-2 text-gray-500" />
                    <span className={selectedCountries.length === 0 ? 'text-gray-500' : 'text-gray-800'}>
                        {displayValue}
                    </span>
                </div>
                <ChevronDown size={18} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search countries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                        />
                    </div>
                    
                    {/* Checkbox List */}
                    {filteredCountries.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No countries found matching "{searchTerm}".</div>
                    ) : (
                        filteredCountries.map(country => (
                            <div
                                key={country}
                                onClick={() => toggleCountry(country)}
                                className={`flex items-center justify-between p-3 cursor-pointer text-sm ${
                                    selectedCountries.includes(country) ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                {country}
                                {selectedCountries.includes(country) && (
                                    <Check size={16} className="text-blue-600" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
            {/* Display selected tags below the dropdown (optional tag list) */}
            {selectedCountries.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {selectedCountries.slice(0, 5).map(country => (
                        <span key={country} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
                            {country}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleCountry(country); }}
                                className="ml-1 text-blue-800 hover:text-blue-900 font-bold leading-none"
                                disabled={disabled}
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                    {selectedCountries.length > 5 && (
                        <span className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                            +{selectedCountries.length - 5} more
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

// ------------------------------------------------------------------
// Main Profile Component
// ------------------------------------------------------------------

const Profile: React.FC = () => {
    // Destructure the necessary items from AuthContext
    const { currentUser, userProfile, updateUserProfile, loading: authLoading } = useAuth();

    // --- Component State ---
    // Name fields
    const [firstName, setFirstName] = useState(userProfile?.firstName || "");
    const [lastName, setLastName] = useState(userProfile?.lastName || "");
    
    // New fields
    const [gender, setGender] = useState<GenderOption>(userProfile?.gender || ''); 
    const [bio, setBio] = useState(userProfile?.bio || "");
    // 🚀 UPDATED STATE: Initialized as an array
    const [targetCountries, setTargetCountries] = useState<CountryState>(userProfile?.targetCountries || []); 

    // Photo upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(userProfile?.photoURL || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // UI feedback state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const subscriptionPlan = userProfile?.subscription?.plan || 'free';
    const subscriptionStatus = userProfile?.subscription?.status || 'inactive';
    const subscriptionExpiration = userProfile?.subscription?.expirationDate || '';
    const planLabel = subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1);
    const statusLabel = subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1);
    const expirationLabel = subscriptionExpiration
        ? new Date(subscriptionExpiration).toLocaleDateString()
        : 'N/A';

    // Reset state when userProfile changes (e.g., after successful update)
    useEffect(() => {
        if (userProfile) {
            setFirstName(userProfile.firstName || "");
            setLastName(userProfile.lastName || "");
            setGender(userProfile.gender || ''); 
            setBio(userProfile.bio || "");
            // Reset target countries to the profile array or an empty array
            setTargetCountries(userProfile.targetCountries || []); 
            setImagePreview(userProfile.photoURL || null);
            setImageFile(null); // Clear image file when profile refreshes
        }
    }, [userProfile]);

    if (authLoading || !currentUser || !userProfile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="ml-3 text-gray-600">
                    {authLoading ? "Loading user data..." : "Please log in to view your profile."}
                </p>
            </div>
        );
    }

    // Handle file selection (unchanged)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); 
            setError(null);
        }
    };
    
    // 🚀 NEW HANDLER: For the custom multi-select country component (simplified signature)
    const handleTargetCountriesChange = (countries: string[]) => {
        setTargetCountries(countries);
    };

    // Check if any form fields have been modified
    const hasChanges = () => {
        const currentBio = bio.trim() || null;
        const currentGender = (gender === '' ? null : gender) || null;
        
        // Compare sorted arrays for country changes
        const currentCountriesSorted = [...targetCountries].sort().join(',');
        const profileCountriesSorted = [...(userProfile.targetCountries || [])].sort().join(',');

        const profileGender = userProfile.gender || null;
        const profileBio = userProfile.bio || null;

        return (
            firstName.trim() !== userProfile.firstName ||
            lastName.trim() !== userProfile.lastName ||
            currentGender !== profileGender ||
            currentBio !== profileBio ||
            currentCountriesSorted !== profileCountriesSorted || // UPDATED CHECK
            !!imageFile // True if an image file is selected
        );
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!hasChanges()) {
            setLoading(false);
            setSuccess("No changes to save.");
            return;
        }

        try {
            let newPhotoURL: string | null = userProfile.photoURL || null;

            // 1. Handle Image Upload
            if (imageFile) {
                setSuccess("Uploading new profile picture...");
                newPhotoURL = await uploadFile(imageFile, currentUser.uid); 
            }

            // 2. Prepare data for Context update (Partial<UserProfileSaveData>)
            const updateData: UserProfileUpdate = {};
            
            if (firstName.trim() !== userProfile.firstName) {
                updateData.firstName = firstName.trim();
            }
            if (lastName.trim() !== userProfile.lastName) {
                updateData.lastName = lastName.trim();
            }

            if (newPhotoURL !== userProfile.photoURL) {
                updateData.photoURL = newPhotoURL; 
            }
            
            const submittedGender = gender === '' ? null : gender;
            if (submittedGender !== (userProfile.gender || null)) {
                updateData.gender = submittedGender;
            }
            
            const submittedBio = bio.trim() || null;
            if (submittedBio !== (userProfile.bio || null)) {
                updateData.bio = submittedBio;
            }
            
            // Check and add targetCountries change
            const currentCountriesSorted = [...targetCountries].sort().join(',');
            const profileCountriesSorted = [...(userProfile.targetCountries || [])].sort().join(',');
            
            if (currentCountriesSorted !== profileCountriesSorted) {
                // If the array is empty, set it to null in the database, otherwise pass the array.
                updateData.targetCountries = targetCountries.length > 0 ? targetCountries : null; 
            }
            
            // 3. Update Firestore Profile and Firebase Auth
            await updateUserProfile(updateData);
            
            // Reset state
            setImageFile(null); 
            setImagePreview(newPhotoURL); 
            setSuccess("Profile updated successfully!");

        } catch (err) {
            console.error("Profile update error:", err);
            setImagePreview(userProfile.photoURL || null); 
            setError(`Failed to update profile: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const currentPhoto = imagePreview || userProfile.photoURL;

    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                    Update Profile
                </h1>
                <p className="text-lg text-gray-500 mb-10">
                    Manage your personal information, bio, and desired application <strong>countries.</strong>
                </p>

                <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl p-8 space-y-8">
                    
                    {/* Status Messages */}
                    {error && (
                        <div className="flex items-center p-4 bg-red-100 text-red-700 rounded-lg">
                            <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* 1. Profile Picture Section */}
                    <div className="flex flex-col items-center border-b pb-8">
                        <div className="relative group w-32 h-32">
                            {currentPhoto ? (
                                <img
                                    src={currentPhoto}
                                    alt="Profile"
                                    loading="lazy"
                                    className="w-full h-full rounded-full object-cover border-4 border-blue-500 shadow-md"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-500 shadow-md">
                                    <User size={64} className="text-gray-500" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                title="Change profile picture"
                            >
                                <Camera size={24} className="text-white" />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                            {imageFile && (
                                <p className="mt-2 text-sm text-gray-600">
                                    New file selected: <span className="font-medium">{imageFile.name}</span>
                                </p>
                            )}
                    </div>
                    
                    {/* 2. Form Fields */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* First Name Field */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Last Name Field */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Email Field (Disabled) */}
                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={currentUser.email || "N/A"}
                                    disabled
                                    className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-100 p-3 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Role Field (Display Only) */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                    User Role
                                </label>
                                <input
                                    type="text"
                                    id="role"
                                    value={userProfile.role || 'user'}
                                    disabled
                                    className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-100 p-3 text-blue-600 font-semibold capitalize cursor-not-allowed"
                                />
                            </div>

                            {/* Subscription Plan Field (Display Only) */}
                            <div>
                                <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subscription Plan
                                </label>
                                <input
                                    type="text"
                                    id="subscriptionPlan"
                                    value={planLabel}
                                    disabled
                                    className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-100 p-3 text-emerald-600 font-semibold capitalize cursor-not-allowed"
                                />
                            </div>

                            {/* Subscription Status Field (Display Only) */}
                            <div>
                                <label htmlFor="subscriptionStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subscription Status
                                </label>
                                <input
                                    type="text"
                                    id="subscriptionStatus"
                                    value={statusLabel}
                                    disabled
                                    className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-100 p-3 text-emerald-600 font-semibold capitalize cursor-not-allowed"
                                />
                            </div>

                            {/* Subscription Expiration Field (Display Only) */}
                            <div>
                                <label htmlFor="subscriptionExpiration" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subscription Expires
                                </label>
                                <input
                                    type="text"
                                    id="subscriptionExpiration"
                                    value={expirationLabel}
                                    disabled
                                    className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-100 p-3 text-emerald-600 font-semibold cursor-not-allowed"
                                />
                            </div>

                            {/* Gender Selection Field */}
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender (Optional)
                                </label>
                                <select
                                    id="gender"
                                    value={gender ?? ''} 
                                    onChange={(e) => setGender(e.target.value as GenderOption)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 bg-white"
                                    disabled={loading}
                                >
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-binary">Non-binary</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>

                            {/* Target Country Selection Field - REPLACED WITH CUSTOM COMPONENT */}
                            <div className="md:col-span-2"> 
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Application Countries (Optional)
                                </label>
                                <CountryMultiSelectDropdown 
                                    selectedCountries={targetCountries}
                                    onSelectionChange={handleTargetCountriesChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Bio/About Me Field */}
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                Bio / About Me (Optional)
                            </label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Tell us a little about yourself..."
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 resize-none"
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 text-right">{bio.length}/500</p>
                        </div>
                        
                        {/* Submit Button */}
                        <div className="pt-5 flex justify-end col-span-1 md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading || !hasChanges()}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-3" size={20} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-3" size={20} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
