import React, { useState, useRef } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button, Input } from '../../../../components/ui';
import { Camera, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../../../api/auth';
import { getFullImageUrl } from '../../../../utils/image';

const SettingsProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || user?.firstName || '',
    lastName: user?.profile?.lastName || user?.lastName || '',
  });

  // Prioritize top-level avatar, then profile.avatar, OR fallback if undefined
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar || user?.profile?.avatar || null
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only .jpg, .jpeg, .png, and .webp formats are allowed.');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    // Immediate upload
    const toastId = toast.loading('Uploading profile picture...');
    try {
      const response = await authApi.uploadAvatar(file);
      const newAvatarUrl = response.data.avatar;
      setAvatarPreview(newAvatarUrl);
      
      // Update global user state immediately with the new avatar
      if (user) {
          // Manually construct the new user object with the new avatar to ensure immediate UI update
          // This bypasses the need to wait for updateProfile response to contain the avatar
          const updatedProfile = { ...user.profile, avatar: newAvatarUrl };
          const updatedUser = { ...user, profile: updatedProfile, avatar: newAvatarUrl };
          
          // Update the session directly first (optimistic update)
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Then call the API to sync mostly for the side effect of refreshing the context
          // But since updateProfile calls updateMe which might not technically "update" the avatar key in its logic 
          // (it only reads it back), we must ensure the local state is correct.
          await updateProfile({}); 
      }
      
      toast.success('Profile picture updated', { id: toastId });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload image', { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarPreview) {
      toast.error('Profile picture is REQUIRED.');
      return;
    }

    setLoading(true);
    try {
      // updateProfile handles the PUT /auth/me
      await updateProfile(formData);
      toast.success('Identity updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b border-slate-200 pb-5 mb-8">
        <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
        <p className="text-slate-500 text-sm mt-1">Update your photo and personal details.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 w-full md:w-auto">
            <div className="relative group cursor-pointer transition-transform hover:scale-105" onClick={() => fileInputRef.current?.click()}>
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white ring-2 ring-slate-100 shadow-xl bg-slate-50">
                {avatarPreview ? (
                  <img 
                    src={getFullImageUrl(avatarPreview) || ''} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-slate-100');
                      // Create a text node or similar fallback if needed, but for now just hiding the broken image
                      // A better approach is to set state to null, but infinite loops can occur.
                    }} 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                    <Camera className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">No Photo</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
                <Camera className="w-8 h-8 text-white mb-1" />
                <span className="text-white text-xs font-medium">Change Photo</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-center">
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Photo</p>
                 <p className="text-[10px] text-slate-400 mt-1">Accepts JPG, PNG, WEBP (Max 5MB)</p>
                 {!avatarPreview && <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 px-2 py-1 rounded-md inline-block">Required *</p>}
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">First Name</label>
                <Input 
                  variant="light"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="bg-white border-slate-300 focus:border-slate-500 text-slate-900 transition-colors"
                  placeholder="e.g. Juan"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Last Name</label>
                <Input 
                  variant="light"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="bg-white border-slate-300 focus:border-slate-500 text-slate-900 transition-colors"
                  placeholder="e.g. Dela Cruz"
                />
              </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                    <Input 
                        variant="light"
                        value={user?.email || ''}
                        disabled
                        className="bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed pl-3"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                         <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Verified</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400">To change your email, please contact support.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" loading={loading} className="w-full sm:w-auto px-8">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default SettingsProfile;
