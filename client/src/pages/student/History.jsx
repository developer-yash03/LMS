import React from 'react';
import { FiCreditCard } from 'react-icons/fi';

const History = () => {
  const transactions = [
    { id: 'TXN1024', course: 'MERN Stack', date: '2026-03-15', price: '₹499', status: 'Success' },
    { id: 'TXN0988', course: 'UI/UX Design', date: '2026-02-10', price: '₹0', status: 'Free' },
  ];

  return (
    <section className="table-section">
      <h2 className="page-title">
        <FiCreditCard /> Payment History
      </h2>
      <div className="table-shell">
        <table className="table-ui">
          <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Course</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id}>
              <td>{txn.id}</td>
              <td>{txn.course}</td>
              <td>{txn.date}</td>
              <td className="table-strong">{txn.price}</td>
              <td>
                <span className={`status-chip ${txn.status === 'Success' ? 'success' : 'neutral'}`}>
                  {txn.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
};

export default History;