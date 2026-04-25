import React, { useState, useEffect, useRef } from 'react';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { uploadFile } from '../firebase/storageUtils'; // Assuming this utility is available
import { User, Camera, Loader2, Globe, ChevronDown, Check } from 'lucide-react';

// Mock list of countries for the multiselect
const COUNTRIES_LIST = [
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

// Keep the state type definition as you had it.
type GenderOption = UserProfile['gender'] | '';

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

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
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
            onSelectionChange([...selectedCountries, country].sort());
        }
    };

    const handleToggleDropdown = () => {
        if (!disabled) {
            setIsOpen(prev => !prev);
        }
    };

    const filteredCountries = COUNTRIES_LIST.filter(country =>
        country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayValue = selectedCountries.length === 0
        ? 'Select target countries...'
        : selectedCountries.length === COUNTRIES_LIST.length
            ? 'All Countries Selected'
            : `${selectedCountries.length} selected`;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Display Button */}
            <button
                type="button"
                onClick={handleToggleDropdown}
                className={`flex justify-between items-center w-full p-2 border rounded-lg bg-white text-left transition ${
                    disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={disabled}
            >
                <span className={selectedCountries.length === 0 ? 'text-gray-500' : 'text-gray-800'}>
                    {displayValue}
                </span>
                <ChevronDown size={18} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search countries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    {/* Checkbox List */}
                    {filteredCountries.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No countries found.</div>
                    ) : (
                        filteredCountries.map(country => (
                            <div
                                key={country}
                                onClick={() => toggleCountry(country)}
                                className={`flex items-center justify-between p-2 cursor-pointer text-sm ${
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
            {/* Display selected tags below the dropdown (optional but helpful) */}
            {selectedCountries.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {selectedCountries.slice(0, 5).map(country => (
                        <span key={country} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
                            {country}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleCountry(country); }}
                                className="ml-1 text-blue-800 hover:text-blue-900"
                                disabled={disabled}
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                    {selectedCountries.length > 5 && (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                            +{selectedCountries.length - 5} more
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

const ProfileSetupModal: React.FC = () => {
    const { currentUser, showProfileModal, setShowProfileModal, saveUserData, userProfile } = useAuth();

    // State initialization
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Profile Picture States
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [gender, setGender] = useState<GenderOption>('');
    const [bio, setBio] = useState('');

    // State for Target Countries (same as before)
    const [targetCountries, setTargetCountries] = useState<string[]>([]);

    // State for notification preferences
    const [receiveEmailNotifications, setReceiveEmailNotifications] = useState(true);
    const [receivePushNotifications, setReceivePushNotifications] = useState(false);

    const [loading, setLoading] = useState(false);

    // Pre-populate fields
    useEffect(() => {
        if (userProfile) {
            setFirstName(userProfile.firstName || '');
            setLastName(userProfile.lastName || '');
            setImagePreview(userProfile.photoURL || null);
            setGender(userProfile.gender || '');
            setBio(userProfile.bio || '');
            // Initialize target countries
            setTargetCountries(userProfile.targetCountries || []);
            setReceiveEmailNotifications(userProfile.notificationSettings?.email ?? true);
            setReceivePushNotifications(userProfile.notificationSettings?.push ?? false);
        } else if (currentUser) {
            // Set initial name/email from Firebase Auth if profile is new
            const [first, ...rest] = (currentUser.displayName || '').split(' ');
            setFirstName(first || '');
            setLastName(rest.join(' ') || '');
            setImagePreview(currentUser.photoURL || null);
        }
    }, [currentUser, userProfile]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    // Handler for the new custom dropdown (same signature as before, just passed to the new component)
    const handleTargetCountriesChange = (countries: string[]) => {
        setTargetCountries(countries);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const email = currentUser?.email;

        if (!currentUser || !firstName || !lastName || !email) {
            alert('Please fill out all required fields.');
            return;
        }

        setLoading(true);
        try {
            let newPhotoURL: string | null = userProfile?.photoURL || null;

            // Handle Image Upload
            if (imageFile) {
                // Ensure uploadFile utility is available and correct
                newPhotoURL = await uploadFile(imageFile, currentUser.uid); 
            }

            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email,
                photoURL: newPhotoURL || null,
                gender: (gender === '' ? null : gender) as UserProfile['gender'] | null,
                bio: bio.trim() || null,
                targetCountries: targetCountries,
                notificationSettings: {
                    email: receiveEmailNotifications,
                    push: receivePushNotifications,
                },
            };

            await saveUserData(currentUser.uid, payload);
            setShowProfileModal(false);
        } catch (error) {
            console.error('Failed to save user profile:', error);
            alert('Failed to save your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!showProfileModal || !currentUser) return null;

    const currentPhoto = imagePreview;
    const currentEmail = currentUser.email || '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
                <p className="text-gray-600 mb-6">
                    Let's get to know you better. Please provide your details and preferences to get started.
                </p>

                <form onSubmit={handleSubmit}>

                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center border-b pb-8 mb-6">
                        {/* Hidden file input */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
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
                                disabled={loading}
                            >
                                <Camera size={24} className="text-white" />
                            </button>
                        </div>
                        {imageFile && (
                            <p className="mt-2 text-sm text-gray-600">
                                New file selected: <span className="font-medium">{imageFile.name}</span>
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={currentEmail}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Gender Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender (Optional)</label>
                        <select
                            value={gender ?? ''}
                            onChange={(e) => setGender(e.target.value as GenderOption)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                            disabled={loading}
                        >
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    {/* 🚀 REPLACED: Target Countries with Custom Checkbox Dropdown 🚀 */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Globe size={16} /> Target Countries (Optional)
                        </label>
                        <CountryMultiSelectDropdown 
                            selectedCountries={targetCountries}
                            onSelectionChange={handleTargetCountriesChange}
                            disabled={loading}
                        />
                    </div>

                    {/* Bio/About Me */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About Me (Optional)</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Tell us a little about your background, goals, or what you hope to achieve."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 text-right">{bio.length}/500</p>
                    </div>

                    {/* Notification Settings */}
                    <div className="mb-6 border-t pt-4 border-gray-200">
                        <p className="text-md font-semibold text-gray-800 mb-3">Notification Preferences</p>
                        <div className="flex items-center mb-3">
                            <input
                                type="checkbox"
                                id="receiveEmailNotifications"
                                checked={receiveEmailNotifications}
                                onChange={(e) => setReceiveEmailNotifications(e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={loading}
                            />
                            <label htmlFor="receiveEmailNotifications" className="text-sm font-medium text-gray-700">
                                Receive Email Notifications
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="receivePushNotifications"
                                checked={receivePushNotifications}
                                onChange={(e) => setReceivePushNotifications(e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={loading}
                            />
                            <label htmlFor="receivePushNotifications" className="text-sm font-medium text-gray-700">
                                Receive Push Notifications
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !firstName || !lastName}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? (
                            <div className="flex justify-center items-center">
                                <Loader2 className="animate-spin mr-3" size={20} />
                                Saving Profile...
                            </div>
                        ) : (
                            'Save and Continue'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetupModal;