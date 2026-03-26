import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Loader } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface LocationSelectorProps {
  onLocationSelect?: (location: { address: string; coordinates?: { lat: number; lng: number } }) => void;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  className = ""
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Select delivery location');
  const [customAddress, setCustomAddress] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const { latitude, longitude, error, loading, getCurrentPosition, getAddressFromCoordinates } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      getAddressFromCoordinates(latitude, longitude).then(address => {
        if (address) {
          const locationText = `${address.city}, ${address.state}`;
          setSelectedLocation(locationText);
          onLocationSelect?.({
            address: address.address,
            coordinates: { lat: latitude, lng: longitude }
          });
        }
      });
    }
  }, [latitude, longitude]);

  const handleLocationRequest = () => {
    getCurrentPosition();
    setShowDropdown(false);
  };

  const handleCustomLocation = () => {
    setShowCustomInput(true);
    setShowDropdown(false);
  };

  const handleCustomLocationSave = () => {
    if (customAddress.trim()) {
      setSelectedLocation(customAddress);
      onLocationSelect?.({ address: customAddress });
      setShowCustomInput(false);
    }
  };

  const popularLocations = [
    'Mumbai, Maharashtra',
    'Delhi, Delhi',
    'Bangalore, Karnataka',
    'Hyderabad, Telangana',
    'Chennai, Tamil Nadu',
    'Kolkata, West Bengal',
    'Pune, Maharashtra',
    'Ahmedabad, Gujarat',
  ];

  return (
    <div className={`relative ${className}`}>
      {showCustomInput ? (
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-300">
          <MapPin className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            placeholder="Enter your address..."
            className="flex-1 outline-none text-sm"
            autoFocus
          />
          <button
            onClick={handleCustomLocationSave}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setShowCustomInput(false)}
            className="px-2 py-1 text-gray-500 text-sm hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 text-white hover:text-green-100 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium truncate max-w-40">
            {selectedLocation}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Choose your location</h3>
            
            <button
              onClick={handleLocationRequest}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors mb-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {loading ? 'Getting location...' : 'Use current location'}
              </span>
            </button>

            {error && (
              <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">
                {error}
              </p>
            )}

            <button
              onClick={handleCustomLocation}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-2"
            >
              Enter custom address
            </button>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Popular locations</p>
              <div className="space-y-1">
                {popularLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      setSelectedLocation(location);
                      onLocationSelect?.({ address: location });
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};