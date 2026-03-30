import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const initialAssignment = { staffId: '', vehicleId: '', note: '' };
const initialQuote = {
  staffId: '',
  estimatedAmount: '',
  finalAmount: '',
  serviceName: '',
  quantity: 1,
  unitPrice: '',
  subtotal: '',
  expiresAt: '',
};

export default function CompanyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);
  const [quoteForm, setQuoteForm] = useState(initialQuote);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [requestList, staffList, vehicleList] = await Promise.all([
        companyApi.getRequests(),
        companyApi.getStaff(),
        companyApi.getVehicles(),
      ]);
      setRequests(requestList);
      setStaff(staffList);
      setVehicles(vehicleList);
      if (!activeRequestId && requestList.length > 0) {
        setActiveRequestId(requestList[0].id);
      }
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignment = async (event) => {
    event.preventDefault();
    if (!activeRequestId) {
      return;
    }
    try {
      await companyApi.createAssignment(activeRequestId, {
        staffId: Number(assignmentForm.staffId),
        vehicleId: Number(assignmentForm.vehicleId),
        note: assignmentForm.note,
      });
      setNotice('Assignment updated successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleQuote = async (sendImmediately = false) => {
    if (!activeRequestId) {
      return;
    }
    try {
      const quote = await companyApi.createQuote(activeRequestId, {
        staffId: quoteForm.staffId ? Number(quoteForm.staffId) : null,
        estimatedAmount: quoteForm.estimatedAmount ? Number(quoteForm.estimatedAmount) : null,
        finalAmount: quoteForm.finalAmount ? Number(quoteForm.finalAmount) : null,
        serviceName: quoteForm.serviceName,
        quantity: quoteForm.quantity ? Number(quoteForm.quantity) : null,
        unitPrice: quoteForm.unitPrice ? Number(quoteForm.unitPrice) : null,
        subtotal: quoteForm.subtotal ? Number(quoteForm.subtotal) : null,
        expiresAt: quoteForm.expiresAt || null,
      });
      if (sendImmediately) {
        await companyApi.sendQuote(quote.id);
        setNotice('Quote created and sent successfully');
      } else {
        setNotice('Quote saved as draft successfully');
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const activeRequest = requests.find((request) => request.id === activeRequestId);

  return (
    <>
      <PageHeader
        title="Assigned Requests"
        subtitle="Select a request to dispatch staff and vehicles, then create a quote for the customer."
      />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <div className="card">
          <h2>Request Queue</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Incident</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.requestCode}</td>
                    <td>{request.incidentTypeName}</td>
                    <td><StatusBadge value={request.status} /></td>
                    <td>
                      <div className="actions-row">
                        <button className="button button-secondary" type="button" onClick={() => setActiveRequestId(request.id)}>
                          Select
                        </button>
                        <Link className="button button-secondary" to={`/requests/${request.id}`}>
                          View detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Selected Request</h2>
          {activeRequest ? (
            <>
              <p><strong>Request:</strong> {activeRequest.requestCode}</p>
              <p><strong>Incident:</strong> {activeRequest.incidentTypeName}</p>
              <p><strong>Status:</strong> <StatusBadge value={activeRequest.status} /></p>

              <form className="card" onSubmit={handleAssignment}>
                <h3>Assign Staff & Vehicle</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Staff</label>
                    <select value={assignmentForm.staffId} onChange={(e) => setAssignmentForm((p) => ({ ...p, staffId: e.target.value }))}>
                      <option value="">Select staff</option>
                      {staff.map((item) => (
                        <option key={item.id} value={item.id}>{item.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Vehicle</label>
                    <select value={assignmentForm.vehicleId} onChange={(e) => setAssignmentForm((p) => ({ ...p, vehicleId: e.target.value }))}>
                      <option value="">Select vehicle</option>
                      {vehicles.map((item) => (
                        <option key={item.id} value={item.id}>{item.vehicleCode} - {item.plateNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Note</label>
                  <input value={assignmentForm.note} onChange={(e) => setAssignmentForm((p) => ({ ...p, note: e.target.value }))} />
                </div>
                <button className="button button-primary" type="submit">Assign</button>
              </form>

              <div className="card" style={{ marginTop: '1rem' }}>
                <h3>Create Quote</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Staff</label>
                    <select value={quoteForm.staffId} onChange={(e) => setQuoteForm((p) => ({ ...p, staffId: e.target.value }))}>
                      <option value="">Optional</option>
                      {staff.map((item) => (
                        <option key={item.id} value={item.id}>{item.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Service Name</label>
                    <input value={quoteForm.serviceName} onChange={(e) => setQuoteForm((p) => ({ ...p, serviceName: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Estimated Amount</label>
                    <input value={quoteForm.estimatedAmount} onChange={(e) => setQuoteForm((p) => ({ ...p, estimatedAmount: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Final Amount</label>
                    <input value={quoteForm.finalAmount} onChange={(e) => setQuoteForm((p) => ({ ...p, finalAmount: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Quantity</label>
                    <input type="number" value={quoteForm.quantity} onChange={(e) => setQuoteForm((p) => ({ ...p, quantity: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Unit Price</label>
                    <input value={quoteForm.unitPrice} onChange={(e) => setQuoteForm((p) => ({ ...p, unitPrice: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Subtotal</label>
                    <input value={quoteForm.subtotal} onChange={(e) => setQuoteForm((p) => ({ ...p, subtotal: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Expires At</label>
                    <input type="datetime-local" value={quoteForm.expiresAt} onChange={(e) => setQuoteForm((p) => ({ ...p, expiresAt: e.target.value }))} />
                  </div>
                </div>
                <div className="actions-row">
                  <button className="button button-secondary" type="button" onClick={() => handleQuote(false)}>
                    Save Draft
                  </button>
                  <button className="button button-primary" type="button" onClick={() => handleQuote(true)}>
                    Create & Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p>No request selected.</p>
          )}
        </div>
      </div>
    </>
  );
}
