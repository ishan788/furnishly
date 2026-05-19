import React, { useState } from 'react';
import useSWR from 'swr';
import { adminAPI, fetcher } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned'];
const STATUS_COLORS = { placed:'#c9a96e',confirmed:'#c9a96e',processing:'#3498db',shipped:'#9b59b6',out_for_delivery:'#e67e22',delivered:'#27ae60',cancelled:'#e74c3c',returned:'#e74c3c' };

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const queryParams = new URLSearchParams({ page, limit: 15 });
  if (statusFilter) queryParams.append('status', statusFilter);
  if (search) queryParams.append('search', search);

  const { data, isLoading: loading, mutate } = useSWR(`/admin/orders?${queryParams.toString()}`, fetcher, { refreshInterval: 10000 });
  const orders = data?.orders || [];
  const total = data?.total || 0;

  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedOrder) return;
    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(selectedOrder._id, { status: newStatus, note: statusNote });
      toast.success('Order status updated');
      setSelectedOrder(null);
      setNewStatus(''); setStatusNote('');
      mutate();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Orders</h1>
        <p>{total} total orders</p>
      </div>

      <div className="admin-toolbar">
        <input placeholder="Search by order number..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="page-loader" style={{ padding: '60px 0' }}><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 500, fontFamily: 'var(--font-display)' }}>{order.orderNumber}</td>
                  <td>
                    <p style={{ fontWeight: 500, fontSize: 13 }}>{order.user?.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{order.user?.email}</p>
                  </td>
                  <td>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 500 }}>₹{order.pricing?.total?.toLocaleString()}</td>
                  <td>
                    <span style={{ fontSize: 12 }}>{order.paymentMethod?.toUpperCase()}</span>
                    <span style={{ display: 'block', fontSize: 11, color: order.paymentStatus === 'paid' ? 'var(--clr-green)' : 'var(--clr-text-muted)' }}>{order.paymentStatus}</span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: `${STATUS_COLORS[order.orderStatus]}22`, color: STATUS_COLORS[order.orderStatus], whiteSpace: 'nowrap' }}>
                      {order.orderStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => { setSelectedOrder(order); setNewStatus(order.orderStatus); }}>Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {Math.ceil(total / 15) > 1 && (
        <div className="pagination" style={{ marginTop: 24 }}>
          {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Status update modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 36, maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>Update Order Status</h3>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: 13, marginBottom: 24 }}>{selectedOrder.orderNumber}</p>
            <div className="form-group">
              <label className="form-label">New Status</label>
              <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-input" placeholder="e.g. Shipped via Delhivery" value={statusNote} onChange={e => setStatusNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={updating}>{updating ? 'Updating...' : 'Update Status'}</button>
              <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
