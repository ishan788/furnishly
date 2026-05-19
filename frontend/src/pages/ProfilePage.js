import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, loadUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password updated!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update password'); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await userAPI.addAddress(addressForm);
      await loadUser();
      setShowAddressForm(false);
      setAddressForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await userAPI.deleteAddress(addrId);
      await loadUser();
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete address'); }
  };

  const tabs = ['profile', 'security', 'addresses'];

  return (
    <div style={{ paddingTop: 'var(--header-height)' }}>
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 40, alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div>
            <div style={{ background: 'var(--clr-ink)', borderRadius: 'var(--radius-md)', padding: 28, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 72, height: 72, background: 'rgba(201,169,110,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--clr-gold-light)' }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--clr-gold-light)', marginBottom: 4 }}>{user?.name}</p>
              <p style={{ fontSize: 13, color: '#888885' }}>{user?.email}</p>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: 'block', width: '100%', padding: '14px 20px', textAlign: 'left', fontSize: 14, fontWeight: activeTab === tab ? 500 : 400, background: activeTab === tab ? 'var(--clr-cream)' : 'white', borderLeft: activeTab === tab ? '3px solid var(--clr-ink)' : '3px solid transparent', border: 'none', borderBottom: '1px solid var(--clr-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', textTransform: 'capitalize', color: 'var(--clr-ink)', transition: 'var(--transition)' }}>
                  {tab === 'profile' ? 'My Profile' : tab === 'security' ? 'Password & Security' : 'Saved Addresses'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: 36 }}>
            {activeTab === 'profile' && (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 28 }}>My Profile</h2>
                <form onSubmit={handleProfileSave}>
                  <div className="grid grid-2" style={{ marginBottom: 20 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    <p className="form-error" style={{ color: 'var(--clr-text-muted)' }}>Email cannot be changed</p>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                </form>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 28 }}>Password & Security</h2>
                <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
                  {[
                    { name: 'currentPassword', label: 'Current Password' },
                    { name: 'newPassword', label: 'New Password' },
                    { name: 'confirmPassword', label: 'Confirm New Password' },
                  ].map(({ name, label }) => (
                    <div className="form-group" key={name}>
                      <label className="form-label">{label}</label>
                      <input type="password" className="form-input" value={passwordForm[name]} onChange={e => setPasswordForm(f => ({ ...f, [name]: e.target.value }))} required minLength={name !== 'currentPassword' ? 6 : undefined} />
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
                </form>
              </>
            )}

            {activeTab === 'addresses' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Saved Addresses</h2>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(v => !v)}>
                    {showAddressForm ? 'Cancel' : '+ Add Address'}
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddAddress} style={{ background: 'var(--clr-cream)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24 }}>
                    <div className="grid grid-2">
                      {[
                        { name: 'fullName', label: 'Full Name', type: 'text' },
                        { name: 'phone', label: 'Phone', type: 'tel' },
                        { name: 'addressLine1', label: 'Address Line 1', type: 'text' },
                        { name: 'city', label: 'City', type: 'text' },
                        { name: 'state', label: 'State', type: 'text' },
                        { name: 'pincode', label: 'Pincode', type: 'text' },
                      ].map(({ name, label, type }) => (
                        <div className="form-group" key={name}>
                          <label className="form-label">{label}</label>
                          <input type={type} className="form-input" value={addressForm[name]} onChange={e => setAddressForm(f => ({ ...f, [name]: e.target.value }))} required />
                        </div>
                      ))}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14, cursor: 'pointer' }}>
                      <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))} style={{ accentColor: 'var(--clr-ink)' }} />
                      Set as default address
                    </label>
                    <button type="submit" className="btn btn-primary">Save Address</button>
                  </form>
                )}

                {user?.addresses?.length === 0 ? (
                  <p style={{ color: 'var(--clr-text-muted)', padding: '24px 0' }}>No saved addresses yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {user?.addresses?.map(addr => (
                      <div key={addr._id} style={{ border: `1.5px solid ${addr.isDefault ? 'var(--clr-ink)' : 'var(--clr-border)'}`, borderRadius: 'var(--radius-md)', padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <strong style={{ fontSize: 15 }}>{addr.fullName}</strong>
                            {addr.isDefault && <span className="badge badge-gold">Default</span>}
                          </div>
                          <button onClick={() => handleDeleteAddress(addr._id)} style={{ fontSize: 13, color: 'var(--clr-red)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                          {addr.city}, {addr.state} – {addr.pincode}<br />
                          {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
