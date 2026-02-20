import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>Page not found</h1>
      <p>The page you requested does not exist in this CRM workspace.</p>
      <Link to="/dashboard" className="crm-btn">Back to Dashboard</Link>
    </section>
  );
}

export default NotFoundPage;
