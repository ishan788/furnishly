import React from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Admin.css';

const StatCard = ({ label, value, sub, growth }) => (
  <div className="stat-card">
    <p className="stat-card__label">{label}</p>
    <p className="stat-card__value">{value}</p>
    {sub && <p className="stat-card__sub">{sub}</p>}
    {growth !== undefined && (
      <p className={`stat-card__growth ${Number(growth) >= 0 ? 'stat-card__growth--up' : 'stat-card__growth--down'}`}>
        {Number(growth) >= 0 ? '↑' : '↓'} {Math.abs(growth)}% vs last month
      </p>
    )}
  </div>
);

const STATUS_COLORS = { placed: '#c9a96e', confirmed: '#c9a96e', processing: '#3498db', shipped: '#9b59b6', out_for_delivery: '#e67e22', delivered: '#27ae60', cancelled: '#e74c3c', returned: '#e74c3c' };

export default function AdminDashboard() {
  const { data: resData, isLoading: loading } = useSWR('/admin/dashboard', fetcher, { refreshInterval: 10000 });
  const data = resData?.stats ? resData : null;

  if (loading && !data) return <div className="page-loader"><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, recentOrders, topProducts, orderStatusBreakdown, revenueByMonth } = data;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = revenueByMonth?.map(m => ({
    name: MONTHS[m._id.month - 1],
    Revenue: m.revenue
  })) || [];

  const orderStatusData = orderStatusBreakdown?.map(s => ({
    name: s._id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: s.count,
    color: STATUS_COLORS[s._id] || '#95a5a6'
  })) || [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back. Here's what's happening at Furnishly.</p>
      </div>

      <div className="admin-stats">
        <StatCard label="Total Revenue" value={`₹${(stats.revenue.total / 100000).toFixed(1)}L`} sub={`₹${stats.revenue.thisMonth?.toLocaleString()} this month`} />
        <StatCard label="Total Orders" value={stats.orders.total.toLocaleString()} sub={`${stats.orders.thisMonth} this month`} growth={stats.orders.growth} />
        <StatCard label="Total Users" value={stats.users.total.toLocaleString()} sub={`${stats.users.newThisMonth} new this month`} />
        <StatCard label="Active Products" value={stats.products.total} sub={`${stats.products.lowStock} low stock`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="admin-table-wrap" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Revenue Overview</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c9a96e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7f8c8d' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7f8c8d' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="Revenue" stroke="#c9a96e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Order Status</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatusData} innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value">
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Recent orders */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.slice(0, 8).map(order => (
                <tr key={order._id}>
                  <td><Link to={`/orders/${order._id}`} style={{ color: 'var(--clr-gold-dark)', fontWeight: 500 }}>{order.orderNumber}</Link></td>
                  <td>
                    <p style={{ fontWeight: 500 }}>{order.user?.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{order.user?.email}</p>
                  </td>
                  <td>₹{order.pricing?.total?.toLocaleString()}</td>
                  <td>
                    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: `${STATUS_COLORS[order.orderStatus]}22`, color: STATUS_COLORS[order.orderStatus] }}>
                      {order.orderStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--clr-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top products */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Top Products</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {topProducts?.map((p, i) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--clr-border)' }}>
                <span style={{ width: 24, height: 24, background: 'var(--clr-cream)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', flexShrink: 0 }}>{i + 1}</span>
                {p.image && <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, background: 'var(--clr-cream)', flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{p.totalSold} sold</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>₹{p.revenue?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
