import React from 'react';

const Footer = () => (
  <footer className="footer" style={{ 
    padding: '0.8rem 1.5rem 0.2rem 1.5rem', 
    backgroundColor: '#fffaf5', 
    borderTop: '1px solid #e5e7eb',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 'auto',
  }}>
    <div style={{ width: '100%' }}>
      <h3 style={{ 
        fontFamily: "'Georgia', serif", 
        fontSize: '1rem', 
        color: '#2e2117', 
        margin: '0 0 0.5rem 0',
        lineHeight: '0.1'
      }}>
        ScholarHub
      </h3>
      <p style={{ 
        fontSize: '0.6rem', 
        color: '#9ca3af', 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        margin: 0,
        lineHeight: '0.1'
      }}>
        © {new Date().getFullYear()} SCHOLARHUB ACADEMY. ALL RIGHTS RESERVED.
      </p>
    </div>
  </footer>
);

export default Footer;