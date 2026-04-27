import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiDownload } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const History = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiRequest('/payment/history', 'GET');
        if (res.success) {
          setTransactions(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const downloadReceipt = (txn) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('ScholarHub', 105, 20, null, null, 'center');
      
      doc.setFontSize(14);
      doc.text('Transaction Receipt', 105, 30, null, null, 'center');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 105, 40, null, null, 'center');
      
      // Transaction Info
      doc.setFontSize(12);
      doc.text(`Student Name: ${user?.name || 'Learner'}`, 20, 60);
      doc.text(`Transaction ID: ${txn.id}`, 20, 70);
      doc.text(`Payment Date: ${new Date(txn.date).toLocaleDateString()}`, 20, 80);
      doc.text(`Payment Status: ${txn.status}`, 20, 90);

      // jsPDF default fonts don't support the ₹ symbol, so we replace it with 'Rs. ' for the PDF
      const pdfPrice = txn.price.replace('₹', 'Rs. ');

      // Items Table
      autoTable(doc, {
        startY: 100,
        head: [['Description', 'Amount']],
        body: [
          [txn.course, pdfPrice],
        ],
        foot: [
          ['Total Paid', pdfPrice]
        ],
        theme: 'grid',
        headStyles: { fillColor: [93, 64, 55] },
        footStyles: { fillColor: [248, 250, 252], textColor: [0, 0, 0] }
      });

      // Footer
      const finalY = doc.lastAutoTable?.finalY || 150;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Thank you for learning with ScholarHub!', 105, finalY + 20, null, null, 'center');

      // Save
      doc.save(`Receipt_${txn.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <section className="table-section">
      <h2 className="page-title">
        <FiCreditCard /> Payment History
      </h2>
      <div className="table-shell">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>No transactions found.</div>
        ) : (
          <table className="table-ui">
            <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Course</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.id.slice(-8).toUpperCase()}</td>
                <td>{txn.course}</td>
                <td>{new Date(txn.date).toLocaleDateString()}</td>
                <td className="table-strong">{txn.price}</td>
                <td>
                  <span className={`status-chip ${txn.status === 'Success' ? 'success' : 'neutral'}`}>
                    {txn.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => downloadReceipt(txn)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.4rem 0.8rem', background: '#f3f4f6', 
                      border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer'
                    }}
                  >
                    <FiDownload /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </section>
  );
};

export default History;