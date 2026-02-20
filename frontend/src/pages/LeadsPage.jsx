import { useMemo, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import useAsyncData from '../hooks/useAsyncData';
import { createLead, getLeads, updateLead } from '../services/crmApi';

function LeadsPage() {
  const { token, user } = useAuth();
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    notes: ''
  });
  const [submitState, setSubmitState] = useState({ loading: false, error: '', success: '' });
  const [actionError, setActionError] = useState('');

  const { loading, error, data, reload } = useAsyncData(
    (signal) => getLeads(token, 'page=1&limit=20&includeTotal=false', { signal }),
    [token]
  );

  const rows = data?.data?.leads || [];
  const filtered = useMemo(() => {
    if (!query) {
      return rows;
    }
    const q = query.toLowerCase();
    return rows.filter((row) =>
      [row.firstName, row.lastName, row.email, row.company, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [rows, query]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateLead = async (event) => {
    event.preventDefault();
    setSubmitState({ loading: true, error: '', success: '' });
    try {
      await createLead(token, {
        ...form,
        assignedTo: user?.id
      });
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        source: '',
        notes: ''
      });
      setSubmitState({ loading: false, error: '', success: 'Lead created and assigned.' });
      reload();
    } catch (submitError) {
      setSubmitState({ loading: false, error: submitError.message, success: '' });
    }
  };

  const moveToNextStage = async (lead) => {
    setActionError('');
    const stages = ['new', 'contacted', 'qualified', 'converted'];
    const currentIndex = stages.indexOf(lead.status);
    const nextStatus = stages[Math.min(currentIndex + 1, stages.length - 1)];

    if (nextStatus === lead.status) {
      return;
    }

    try {
      await updateLead(token, lead.id, { status: nextStatus });
      reload();
    } catch (updateError) {
      setActionError(updateError.message);
    }
  };

  return (
    <section>
      <PageHeader
        title="Leads"
        subtitle={
          user?.role === 'admin'
            ? 'Track, assign, and review team lead pipeline.'
            : 'Add your leads and follow up through pipeline stages.'
        }
        actions={<button className="crm-btn crm-btn-secondary" onClick={reload}>Reload</button>}
      />

      <Panel title="Add Lead">
        <form className="inline-form-grid" onSubmit={handleCreateLead}>
          <input name="firstName" placeholder="First name" value={form.firstName} onChange={onChange} required />
          <input name="lastName" placeholder="Last name" value={form.lastName} onChange={onChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
          <input name="company" placeholder="Company" value={form.company} onChange={onChange} />
          <input name="source" placeholder="Source (website/referral)" value={form.source} onChange={onChange} />
          <input className="full-width" name="notes" placeholder="Follow-up notes" value={form.notes} onChange={onChange} />
          <button className="crm-btn" type="submit" disabled={submitState.loading}>
            {submitState.loading ? 'Saving...' : 'Save Lead'}
          </button>
        </form>
        {submitState.error ? <p className="crm-error">{submitState.error}</p> : null}
        {submitState.success ? <p className="crm-success">{submitState.success}</p> : null}
      </Panel>

      <Panel>
        <div className="table-tools">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search leads by name, email, company..."
          />
        </div>
        {actionError ? <p className="crm-error">{actionError}</p> : null}

        {error ? <p className="crm-error">{error}</p> : null}
        {loading ? <p className="crm-loading">Loading leads...</p> : null}

        {!loading && filtered.length === 0 ? <EmptyState message="No leads found." /> : null}

        {!loading && filtered.length > 0 ? (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.firstName} {lead.lastName}</td>
                  <td>{lead.email}</td>
                  <td>{lead.company || '-'}</td>
                  <td><span className={`pill pill-${lead.status || 'default'}`}>{lead.status || '-'}</span></td>
                  <td>{lead.assignedEmployee ? `${lead.assignedEmployee.firstName} ${lead.assignedEmployee.lastName}` : '-'}</td>
                  <td>
                    <button
                      className="crm-btn crm-btn-sm"
                      onClick={() => moveToNextStage(lead)}
                      disabled={lead.status === 'converted'}
                    >
                      {lead.status === 'converted' ? 'Done' : 'Next Stage'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </section>
  );
}

export default LeadsPage;
