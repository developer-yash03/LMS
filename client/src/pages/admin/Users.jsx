import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiRefreshCw } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/users', 'GET');
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSuspension = async (userId, currentStatus, userName) => {
    try {
      const res = await apiRequest(`/admin/users/${userId}/suspend`, 'PUT');
      if (res.success) {
        showToast(`User ${userName} ${currentStatus ? 'reactivated' : 'suspended'} successfully`, 'success');
        fetchUsers();
      }
    } catch (error) {
      showToast(error.message || 'Action failed', 'error');
    }
  };

  return (
    <section className="table-section">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>
          <FiUsers /> User Management
        </h2>
        <button className="btn-clear" onClick={fetchUsers} title="Refresh">
          <FiRefreshCw />
        </button>
      </div>

      <div className="table-shell">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
        ) : (
          <table className="table-ui">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="table-strong">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-chip ${u.role === 'instructor' ? 'instructor' : 'student'}`}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-chip ${u.isSuspended ? 'neutral' : 'success'}`}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn ${u.isSuspended ? 'btn-success' : 'btn-danger'} btn-sm`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}
                      onClick={() => toggleSuspension(u._id, u.isSuspended, u.name)}
                    >
                      {u.isSuspended ? (
                        <><FiUserCheck /> Reactivate</>
                      ) : (
                        <><FiUserX /> Suspend</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default AdminUsers;