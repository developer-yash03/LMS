const Review = ({ rating }) => (
  <div className="rating">
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    <span className="rating-value">({rating})</span>
  </div>
);
export default Review;