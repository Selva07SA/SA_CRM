import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leads', label: 'Leads' },
  { to: '/clients', label: 'Clients' },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/team', label: 'Team', adminOnly: true },
  { to: '/settings', label: 'Settings' }
];

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <h2 className="crm-brand">SA CRM</h2>
        <p className="crm-brand-sub">Sales Command Center</p>
        <nav className="crm-nav">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `crm-nav-link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="crm-main">
        <header className="crm-topbar">
          <div>
            <p className="crm-topbar-caption">Authenticated Session</p>
            <strong>{user ? `${user.firstName} ${user.lastName}` : 'CRM User'}</strong>
          </div>
          <button className="crm-btn crm-btn-secondary" onClick={onLogout}>Logout</button>
        </header>
        {children}
      </main>
    </div>
  );
}

export default AppShell;
