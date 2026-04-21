const Progress = ({ value }) => (
  <div className="progress-track">
    <div className="progress-fill" style={{ width: `${value}%` }}></div>
  </div>
);
export default Progress;