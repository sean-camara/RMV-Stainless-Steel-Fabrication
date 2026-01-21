import React from 'react';
import { Button } from '../../../../components/ui';
import { ShieldCheck, KeyRound, ExternalLink, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsSecurity: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto">
             <div className="border-b border-slate-200 pb-5 mb-8">
                <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                <p className="text-slate-500 text-sm mt-1">Manage your password and account security.</p>
             </div>

             <div className="space-y-6">
                
                {/* Security Overview */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4">
                    <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border border-blue-100">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">Account Protection</h3>
                        <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                            Your account is secured with end-to-end encryption. For your safety, sensitive actions require re-authentication.
                        </p>
                    </div>
                </div>

                {/* Password Section */}
                <div className="pt-4">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Login & Recovery</h3>
                    
                    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                        
                        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Password</h4>
                                    <p className="text-xs text-slate-500">Secure password management</p>
                                </div>
                             </div>
                             <Button 
                                variant="outline" 
                                onClick={() => navigate('/forgot-password')}
                                className="w-full sm:w-auto text-xs"
                            >
                                Reset Password
                                <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-900">Security Notice</p>
                            <p className="text-xs text-amber-700 mt-1">
                                We do not allow direct password changes from the dashboard to prevent unauthorized account takeovers. A secure reset link will be sent to your email.
                            </p>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default SettingsSecurity;
