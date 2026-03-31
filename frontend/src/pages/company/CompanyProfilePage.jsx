import { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
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
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCompany() {
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
    try {
      await companyApi.updateMyCompany({
        ...form,
        ownerAccountId: form.ownerAccountId ? Number(form.ownerAccountId) : null,
      });
      setNotice('Company profile updated successfully');
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Company Profile" subtitle="Maintain the company information used for rescue dispatch and quoting." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <form className="card" onSubmit={handleSubmit}>
        <div className="actions-row" style={{ justifyContent: 'space-between' }}>
          <h2>Profile</h2>
          <StatusBadge value={form.status} />
        </div>
        <div className="form-grid">
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
            <input name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>
        <button className="button button-primary" type="submit">Save company profile</button>
      </form>
    </>
  );
}
