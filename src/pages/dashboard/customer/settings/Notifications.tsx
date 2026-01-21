import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button } from '../../../../components/ui';
import { Save, Bell, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsNotifications: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Default to true if undefined
    const [emailNotifs, setEmailNotifs] = useState({
        marketing: user?.notifications?.email?.marketing ?? false,
        security: user?.notifications?.email?.security ?? true,
        updates: user?.notifications?.email?.updates ?? true, 
    });

    const handleToggle = (key: keyof typeof emailNotifs) => {
        setEmailNotifs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await updateProfile({
                notifications: {
                    email: emailNotifs
                }
            });
            toast.success('Notification preferences saved');
        } catch (error: any) {
            toast.error('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
             <div className="border-b border-slate-200 pb-5 mb-8">
                <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-slate-500 text-sm mt-1">Control how you receive updates and alerts.</p>
             </div>

             <div className="space-y-6">
                
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Email Notifications</h3>
                                <p className="text-xs text-slate-500">Manage your inbox preferences</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-slate-100 bg-white">
                        {/* Security */}
                         <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="font-semibold text-slate-900">Security Alerts</p>
                                <p className="text-sm text-slate-500 mt-0.5">Logins from new devices, password changes</p>
                            </div>
                            <div 
                                onClick={() => handleToggle('security')}
                                className={`w-12 h-7 rounded-full transition-all duration-300 cursor-pointer relative shadow-inner ${emailNotifs.security ? 'bg-slate-900' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${emailNotifs.security ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>

                         {/* Updates */}
                         <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="font-semibold text-slate-900">Order Updates</p>
                                <p className="text-sm text-slate-500 mt-0.5">Status changes, appointment confirmations, receipts</p>
                            </div>
                            <div 
                                onClick={() => handleToggle('updates')}
                                className={`w-12 h-7 rounded-full transition-all duration-300 cursor-pointer relative shadow-inner ${emailNotifs.updates ? 'bg-slate-900' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${emailNotifs.updates ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>

                         {/* Marketing */}
                         <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="font-semibold text-slate-900">Marketing & Promos</p>
                                <p className="text-sm text-slate-500 mt-0.5">New features, discounts, newsletters</p>
                            </div>
                            <div 
                                onClick={() => handleToggle('marketing')}
                                className={`w-12 h-7 rounded-full transition-all duration-300 cursor-pointer relative shadow-inner ${emailNotifs.marketing ? 'bg-slate-900' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${emailNotifs.marketing ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <Button onClick={handleSubmit} loading={loading} className="px-6">
                            <Save className="w-4 h-4 mr-2" />
                            Save Preferences
                        </Button>
                    </div>
                </div>

             </div>
        </div>
    );
};

export default SettingsNotifications;
