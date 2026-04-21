import React from 'react';
import { FiTrash2, FiUsers } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
  const { showToast } = useToast();
  const users = [
    { name: 'Sujal', role: 'Student', email: 'sujal@lpu.com' },
    { name: 'Aman', role: 'Instructor', email: 'aman@lpu.com' },
  ];

  return (
    <section className="table-section">
      <h2 className="page-title">
        <FiUsers /> User Management
      </h2>

      <div className="table-shell">
        <table className="table-ui">
        <thead>
            <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
              <tr key={i}>
              <td>{u.name}</td>
              <td>{u.email}</td>
                <td>
                  <span className="role-chip">{u.role}</span>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => showToast(`User ${u.name} deleted successfully!`, 'success')}>
                    <FiTrash2 /> Delete
                  </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
};

export default AdminUsers;