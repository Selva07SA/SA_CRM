import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import useAsyncData from '../hooks/useAsyncData';
import { createEmployee, getEmployees } from '../services/crmApi';

function TeamPage() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'sales',
    phone: ''
  });
  const [submitState, setSubmitState] = useState({ loading: false, error: '', success: '' });

  const { loading, error, data, reload } = useAsyncData(
    (signal) => getEmployees(token, 'page=1&limit=20&includeTotal=false', { signal }),
    [token]
  );

  const rows = data?.data?.employees || [];
  const isAdmin = user?.role === 'admin';

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({ loading: true, error: '', success: '' });
    try {
      await createEmployee(token, form);
      setSubmitState({ loading: false, error: '', success: 'Employee registered successfully.' });
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'sales',
        phone: ''
      });
      reload();
    } catch (submitError) {
      setSubmitState({ loading: false, error: submitError.message, success: '' });
    }
  };

  return (
    <section>
      <PageHeader
        title="Team"
        subtitle={isAdmin ? 'Admin can register and manage employee accounts.' : 'View your organization members.'}
        actions={<button className="crm-btn crm-btn-secondary" onClick={reload}>Reload</button>}
      />

      {isAdmin ? (
      <Panel title="Register Employee">
        <form className="inline-form-grid" onSubmit={onSubmit}>
          <input name="firstName" placeholder="First name" value={form.firstName} onChange={onChange} required />
          <input name="lastName" placeholder="Last name" value={form.lastName} onChange={onChange} required />
          <input name="email" type="email" placeholder="Work email" value={form.email} onChange={onChange} required />
          <input name="password" type="password" placeholder="Temporary password" value={form.password} onChange={onChange} required />
          <select name="role" value={form.role} onChange={onChange}>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="admin">Admin</option>
          </select>
          <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={onChange} />
          <button className="crm-btn" type="submit" disabled={submitState.loading}>
            {submitState.loading ? 'Registering...' : 'Register Employee'}
          </button>
        </form>
        {submitState.error ? <p className="crm-error">{submitState.error}</p> : null}
        {submitState.success ? <p className="crm-success">{submitState.success}</p> : null}
      </Panel>
      ) : null}

      <Panel>
        {error ? <p className="crm-error">{error}</p> : null}
        {loading ? <p className="crm-loading">Loading team members...</p> : null}
        {!loading && rows.length === 0 ? <EmptyState message="No employees found." /> : null}

        {!loading && rows.length > 0 ? (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.firstName} {item.lastName}</td>
                  <td>{item.email}</td>
                  <td><span className="pill pill-neutral">{item.role}</span></td>
                  <td><span className={`pill ${item.isActive ? 'pill-active' : 'pill-inactive'}`}>{item.isActive ? 'active' : 'inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </section>
  );
}

export default TeamPage;
