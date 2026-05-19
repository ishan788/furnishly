import React, { useState } from 'react';
import useSWR from 'swr';
import { adminAPI, fetcher } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams({ page, limit: 20 });
  if (search) queryParams.append('search', search);

  const { data: resData, isLoading: loading, mutate } = useSWR(`/admin/users?${queryParams.toString()}`, fetcher, { refreshInterval: 15000 });
  const users = resData?.users || [];
  const total = resData?.total || 0;

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      mutate();
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update user status'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
        <p>{total} registered users</p>
      </div>

      <div className="admin-toolbar">
        <input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="page-loader" style={{ padding: '60px 0' }}><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Phone</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, background: 'var(--clr-ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-gold-light)', fontFamily: 'var(--font-display)', fontSize: 16, flexShrink: 0 }}>
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{user.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>{user.phone || '—'}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>{user.role}</span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    {user.role !== 'admin' && (
                      <button className="btn btn-outline btn-sm" style={{ borderColor: user.isActive ? 'var(--clr-red)' : 'var(--clr-green)', color: user.isActive ? 'var(--clr-red)' : 'var(--clr-green)' }} onClick={() => handleToggleStatus(user._id, user.isActive)}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {Math.ceil(total / 20) > 1 && (
        <div className="pagination" style={{ marginTop: 24 }}>
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
