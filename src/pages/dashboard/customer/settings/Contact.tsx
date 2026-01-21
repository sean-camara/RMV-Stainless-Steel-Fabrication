import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button, Input } from '../../../../components/ui';
import { Save, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import MapSelector from '../../../../components/MapSelector';
import axios from 'axios';

const SettingsContact: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Address derived from user profile or empty
  const [address, setAddress] = useState(user?.profile?.address?.street || '');
  const [city, setCity] = useState(user?.profile?.address?.city || '');
  const [province, setProvince] = useState(user?.profile?.address?.province || '');
  const [zip, setZip] = useState(user?.profile?.address?.zipCode || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  
  // Coordinates from user.coordinates OR default fallback (e.g. Manila)
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(
    user?.profile?.address?.coordinates || null
  );

  const handleLocationSelect = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    
    // Reverse Geocode to fill address fields if possible
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const addr = data.address;
      
      setAddress(addr.road || addr.house_number || '');
      setCity(addr.city || addr.town || addr.village || '');
      setProvince(addr.state || addr.region || '');
      setZip(addr.postcode || '');
    } catch (e) {
      console.error("Failed to reverse geocode", e);
      // Don't toast error here to avoid annoyance, just let user type manually
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinates) {
      toast.error('Please pin your location on the map.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        phone: phone,
        address: {
            street: address,
            city,
            province,
            zipCode: zip,
            country: 'Philippines',
            coordinates: coordinates // { lat, lng }
        }
      });
      toast.success('Contact details updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update contact info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="border-b border-slate-200 pb-5 mb-8">
        <h2 className="text-xl font-bold text-slate-900">Contact & Location</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your service address and contact information.</p>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
           {/* Section 1: Map */}
           <div className="space-y-4">
                <div>
                     <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Service Location</h3>
                     <p className="text-xs text-slate-500 mt-1">Pin the exact location for project visits.</p>
                </div>
                
                <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-inner">
                    <MapSelector 
                        initialLat={coordinates?.lat} 
                        initialLng={coordinates?.lng}
                        onLocationSelect={handleLocationSelect}
                    />
                </div>
                 {!coordinates && (
                     <div className="text-amber-600 text-xs flex items-center font-medium bg-amber-50 p-2 rounded border border-amber-100">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        Please pin your location on the map above.
                     </div>
                 )}
           </div>

           {/* Section 2: Form */}
           <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                     <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Contact Information</h3>
                     
                     <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                <Input 
                                    variant="light"
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    className="pl-9 bg-white border-slate-300 focus:border-slate-500 text-slate-900 transition-colors"
                                    placeholder="Enter your mobile number"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">Address Details</label>
                                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Auto-filled from Map</span>
                            </div>
                            
                            <div className="space-y-3">
                                <Input 
                                    variant="light"
                                    placeholder="Street / Building / House No." 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="bg-white border-slate-300 focus:border-slate-500 text-slate-900"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input 
                                        variant="light"
                                        placeholder="City / Municipality" 
                                        value={city} 
                                        onChange={(e) => setCity(e.target.value)}
                                        className="bg-white border-slate-300 focus:border-slate-500 text-slate-900"
                                        required
                                    />
                                    <Input 
                                        variant="light"
                                        placeholder="Province" 
                                        value={province} 
                                        onChange={(e) => setProvince(e.target.value)}
                                        className="bg-white border-slate-300 focus:border-slate-500 text-slate-900"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input 
                                        variant="light"
                                        placeholder="Zip Code" 
                                        value={zip} 
                                        onChange={(e) => setZip(e.target.value)}
                                        className="bg-white border-slate-300 focus:border-slate-500 text-slate-900"
                                    />
                                    <Input 
                                        variant="light"
                                        value="Philippines" 
                                        disabled 
                                        className="bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                     </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <Button type="submit" loading={loading} className="w-full sm:w-auto px-6">
                        <Save className="w-4 h-4 mr-2" />
                        Save Details
                    </Button>
                </div>
           </form>
       </div>
    </div>
  );
};

export default SettingsContact;
