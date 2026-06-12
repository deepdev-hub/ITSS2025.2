import { useEffect, useState } from 'react';
import { BadgeCheck, Building2, FileText, Hash, Mail, Phone, Save, ShieldCheck } from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const initialForm = {
  companyName: '',
  taxCode: '',
  licenseNumber: '',
  email: '',
  phone: '',
  description: '',
  status: 'PENDING',
  ownerAccountId: '',
};

export default function CompanyProfilePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCompany() {
      setLoading(true);
      setError('');
      try {
        const company = await companyApi.getMyCompany();
        setForm({
          companyName: company.companyName || '',
          taxCode: company.taxCode || '',
          licenseNumber: company.licenseNumber || '',
          email: company.email || '',
          phone: company.phone || '',
          description: company.description || '',
          status: company.status || 'PENDING',
          ownerAccountId: company.ownerAccount?.id || '',
        });
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    setSaving(true);

    try {
      const updatedCompany = await companyApi.updateMyCompany({
        companyName: form.companyName,
        taxCode: form.taxCode,
        licenseNumber: form.licenseNumber,
        email: form.email,
        phone: form.phone,
        description: form.description,
        status: form.status || 'PENDING',
        ownerAccountId: form.ownerAccountId ? Number(form.ownerAccountId) : null,
      });

      setForm((previous) => ({
        ...previous,
        ...updatedCompany,
        ownerAccountId: updatedCompany.ownerAccount?.id || previous.ownerAccountId,
      }));
      setNotice('Company profile updated successfully.');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const companyInitial = (form.companyName || 'C').trim().charAt(0).toUpperCase();

  return (
    <>
      <PageHeader
        icon={<Building2 size={22} />}
        title="Company Profile"
        subtitle="Maintain the company information used for rescue dispatch and quoting."
      />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? (
        <Loader label="Loading company profile..." />
      ) : (
        <div className="company-profile-page">
          <section className="company-profile-hero card">
            <div className="company-profile-mark">{companyInitial}</div>
            <div className="company-profile-heading">
              <span className="company-profile-eyebrow">
                <ShieldCheck size={15} aria-hidden="true" />
                Rescue Company
              </span>
              <h2>{form.companyName || 'Company Name'}</h2>
              <div className="company-profile-meta">
                <span><Mail size={15} aria-hidden="true" /> {form.email || 'Email not set'}</span>
                <span><Phone size={15} aria-hidden="true" /> {form.phone || 'Phone not set'}</span>
                <span><Hash size={15} aria-hidden="true" /> {form.taxCode || 'Tax code not set'}</span>
              </div>
            </div>
            <div className="company-profile-status">
              <StatusBadge value={form.status} />
            </div>
          </section>

          <div className="company-profile-layout">
            <form className="card company-profile-form" onSubmit={handleSubmit}>
              <div className="section-header">
                <div>
                  <h2>Profile</h2>
                  <p>Update the public contact and registration details for this company.</p>
                </div>
              </div>

              <div className="form-grid company-profile-form-grid">
                <div className="field">
                  <label>Company Name</label>
                  <input name="companyName" value={form.companyName} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label>Tax Code</label>
                  <input name="taxCode" value={form.taxCode} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>License Number</label>
                  <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="field company-profile-description">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the company's service area, rescue capabilities, or dispatch notes..."
                />
              </div>

              <div className="actions-row company-profile-actions">
                <button className={`button button-primary ${saving ? 'button-loading' : ''}`} type="submit" disabled={saving}>
                  <Save size={16} aria-hidden="true" />
                  {saving ? 'Saving...' : 'Save company profile'}
                </button>
              </div>
            </form>

            <aside className="company-profile-side">
              <section className="card company-profile-summary-card">
                <h3>Registration</h3>
                <div className="company-profile-status-row">
                  <BadgeCheck size={18} aria-hidden="true" />
                  <div>
                    <span>Status</span>
                    <strong><StatusBadge value={form.status} /></strong>
                  </div>
                </div>
                <div className="company-profile-status-row">
                  <FileText size={18} aria-hidden="true" />
                  <div>
                    <span>License Number</span>
                    <strong>{form.licenseNumber || 'Not set'}</strong>
                  </div>
                </div>
                <div className="company-profile-status-row">
                  <Hash size={18} aria-hidden="true" />
                  <div>
                    <span>Tax Code</span>
                    <strong>{form.taxCode || 'Not set'}</strong>
                  </div>
                </div>
              </section>

              <section className="card company-profile-summary-card">
                <h3>Contact</h3>
                <div className="company-profile-status-row">
                  <Mail size={18} aria-hidden="true" />
                  <div>
                    <span>Email</span>
                    <strong>{form.email || 'Not set'}</strong>
                  </div>
                </div>
                <div className="company-profile-status-row">
                  <Phone size={18} aria-hidden="true" />
                  <div>
                    <span>Phone</span>
                    <strong>{form.phone || 'Not set'}</strong>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
