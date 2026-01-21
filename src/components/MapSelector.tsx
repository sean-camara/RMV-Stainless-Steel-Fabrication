import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Search, MapPin, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input, Button } from './ui';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

const MapEvents = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16);
  }, [center, map]);
  return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({ initialLat, initialLng, onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number]>([initialLat || 14.5995, initialLng || 120.9842]); // Default to Manila
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [address, setAddress] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const markerRef = useRef<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
        }
      },
    }),
    [onLocationSelect]
  );

  // Debounce search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setSearching(true);
        try {
          // Limit to Philippines (countrycodes=ph) and limit results to 5
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ph&limit=5`
          );
          const data = await response.json();
          setSearchResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectResult = (result: any) => {
    const { lat, lon, display_name } = result;
    const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
    setPosition(newPos);
    setAddress(display_name);
    setSearchQuery(display_name); // Set input to selected address
    setShowResults(false); // Hide dropdown
    onLocationSelect(newPos[0], newPos[1], display_name);
  };

  const handleManualSearch = async () => {
    // Keep manual search just in case, but rely on autocomplete mostly.
    // Trigger the same logic as if the top result was clicked if available, or force a fetch
    if (!searchQuery) return;
    setSearching(true);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ph&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
            handleSelectResult(data[0]);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setSearching(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };
  
  // Try to geolocate if no initial position
  useEffect(() => {
      if (!initialLat && !initialLng && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
              setPosition([pos.coords.latitude, pos.coords.longitude]);
              onLocationSelect(pos.coords.latitude, pos.coords.longitude);
          });
      }
  }, [initialLat, initialLng]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 relative z-10">
        <div className="relative w-full">
            <Input 
            variant="light"
            placeholder="Search location (e.g. Street, Barangay, City)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
            icon={<Search className="w-4 h-4" />}
            className="bg-white border-slate-300 focus:border-slate-500 text-slate-900"
            />
             {/* Autocomplete Dropdown */}
             {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                        <div 
                            key={index}
                            className="p-3 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-100 last:border-0 text-slate-700"
                            onClick={() => handleSelectResult(result)}
                        >
                            {result.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
        <Button onClick={handleManualSearch} disabled={searching}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={position} 
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
          />
          <MapEvents onSelect={handleMapClick} />
          <MapUpdater center={position} />
        </MapContainer>
      </div>
      
      <p className="text-xs text-slate-500 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {address ? `Selected: ${address}` : 'Drag marker to pin exact location'}
      </p>
    </div>
  );
};

export default MapSelector;
