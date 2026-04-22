import { FiBookOpen, FiHeart } from 'react-icons/fi';

const Footer = () => (
  <footer className="footer">
    <p>
      <FiBookOpen /> © {new Date().getFullYear()} LMS Pro. Built with <FiHeart color="#dc2626" /> for learning.
    </p>
  </footer>
);

export default Footer;