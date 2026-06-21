import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';

// --- CONFIG ICONS BY STATUS ---
const createIcon = (url) => new L.Icon({
  iconUrl: url,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const icons = {
  STAFF: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995562.png',
    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
  }),
  // Newly created or searching (hazard warning)
  CREATED: createIcon('https://cdn-icons-png.flaticon.com/512/179/179386.png'),
  SEARCHING: createIcon('https://cdn-icons-png.flaticon.com/512/179/179386.png'),
  // Matched and waiting for staff response (clock/pending)
  MATCHED: createIcon('https://cdn-icons-png.flaticon.com/512/3582/3582012.png'),
  // Staff accepted (handshake/accepted)
  ACCEPTED: createIcon('https://cdn-icons-png.flaticon.com/512/11529/11529555.png'),
  // Repair in progress (tools/in progress)
  IN_PROGRESS: createIcon('https://cdn-icons-png.flaticon.com/512/1013/1013374.png'),
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [activeStaff, setActiveStaff] = useState([]);
  const [hoveredStaff, setHoveredStaff] = useState(null);
  const [hoveredRequest, setHoveredRequest] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'ALL', incidentType: 'ALL' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestList, staffList] = await Promise.all([
        adminApi.getRequests(),
        adminApi.getActiveStaffLocations(),
      ]);
      setRequests(requestList);
      setActiveStaff(staffList.filter(s => s.currentLatitude && s.currentLongitude));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredRequests = useMemo(() => {
    const kw = filters.search.trim().toLowerCase();
    return requests.filter(r => 
      (kw === '' || r.requestCode.toLowerCase().includes(kw) || r.customerName.toLowerCase().includes(kw)) &&
      (filters.status === 'ALL' || r.status === filters.status) &&
      (filters.incidentType === 'ALL' || r.incidentTypeName === filters.incidentType)
    );
  }, [filters, requests]);

  const incidentTypes = useMemo(() => {
    const types = new Set(requests.map(r => r.incidentTypeName).filter(Boolean));
    return Array.from(types);
  }, [requests]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, requests]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + pageSize);

  if (loading && requests.length === 0) return <Loader label="Loading Command Center..." />;

  return (
    <div className="admin-command-center">
      <section style={{ height: '75vh', position: 'relative' }}>
        <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {requests
            .filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELED')
            .map(req => (
              req.location?.latitude && (
                <Marker 
                  key={req.id} 
                  position={[req.location.latitude, req.location.longitude]} 
                  icon={icons[req.status] || icons.CREATED}
                  eventHandlers={{
                    mouseover: () => setHoveredRequest(req),
                    mouseout: () => setHoveredRequest(null)
                  }}
                >
                  <Popup>
                    <strong>{req.requestCode}</strong><br/>
                    <small>Note: {req.description || 'N/A'}</small><br/>
                    {req.status === 'MATCHED' ? (
                      <div className="muted-line" style={{ marginTop: '8px' }}>
                        Waiting for staff response
                      </div>
                    ) : null}
                  </Popup>
                </Marker>
              )
            ))}

          {activeStaff.map(staff => (
            <Marker key={staff.id} position={[staff.currentLatitude, staff.currentLongitude]} icon={icons.STAFF}
              eventHandlers={{ mouseover: () => setHoveredStaff(staff), mouseout: () => setHoveredStaff(null) }}
            >
              <Popup><strong>{staff.fullName}</strong></Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* HOVER CARDS */}
        {hoveredStaff && (
          <div className="hover-card staff-side">
            <h4>{hoveredStaff.fullName}</h4>
            <p className="staff-id">Staff ID: {hoveredStaff.id}</p>
            <p><strong>JobTitle:</strong> {hoveredStaff.jobTitle}</p>
            <p className="status">ACTIVE</p>
          </div>
        )}

        {hoveredRequest && (
          <div className="hover-card request-side">
            <h4>{hoveredRequest.requestCode}</h4>
            <p><StatusBadge value={hoveredRequest.status} /></p>
            <p><strong>Customer:</strong> {hoveredRequest.customerName}</p>
            <p className="note-text"><strong>Note:</strong> {hoveredRequest.description || 'N/A'}</p>
            {hoveredRequest.status === 'MATCHED' && <p className="timer">Timeout: {hoveredRequest.timeoutSeconds}s</p>}
          </div>
        )}
      </section>

      {/* --- EXPLANATION LEGEND (OUTSIDE MAP) --- */}
      <div className="map-legend">
        <div className="legend-item">
          <img src="https://cdn-icons-png.flaticon.com/512/179/179386.png" alt="new" />
            <span>System searching staff</span>
        </div>
        <div className="legend-item">
          <img src="https://cdn-icons-png.flaticon.com/512/3582/3582012.png" alt="matched" />
          <span>Pending Staff Response</span>
        </div>
        <div className="legend-item">
          <img src="https://cdn-icons-png.flaticon.com/512/11529/11529555.png" alt="accepted" />
          <span>Staff Accepted</span>
        </div>
        <div className="legend-item">
          <img src="https://cdn-icons-png.flaticon.com/512/1013/1013374.png" alt="progress" />
          <span>Rescue In Progress</span>
        </div>
        <div className="legend-item">
          <img src="https://cdn-icons-png.flaticon.com/512/1995/1995562.png" alt="staff" />
          <span>Available Staff</span>
        </div>
      </div>

      <section style={{ padding: '20px', background: '#f8f9fa' }}>
        <PageHeader title="Dispatcher Command Center" subtitle="Real-time monitoring of requests the system is assigning automatically." />
        {error && <div className="notice error">{error}</div>}
        
        <div className="card">
          <div className="filters-row" style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search by code or customer..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="input-field"
            />
            <select name="status" value={filters.status} onChange={handleFilterChange} className="select-field">
              <option value="ALL">All Status</option>
              <option value="CREATED">Created</option>
              <option value="SEARCHING">Searching</option>
              <option value="MATCHED">Matched</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
            <select name="incidentType" value={filters.incidentType} onChange={handleFilterChange} className="select-field">
              <option value="ALL">All Incidents</option>
              {incidentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th><th>Customer</th><th>Incident</th><th>Note</th><th>Status</th><th>Action</th><th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr key={request.id}>
                    <td><strong>{request.requestCode}</strong></td>
                    <td>{request.customerName}</td>
                    <td>{request.incidentTypeName}</td>
                    <td className="note-cell">{request.description || 'N/A'}</td>
                    <td><StatusBadge value={request.status} /></td>
                    <td>
                      <span className="muted-line italic">
                        {['CREATED', 'SEARCHING'].includes(request.status)
                          ? 'Searching staff'
                          : request.status === 'MATCHED'
                            ? `Wait(${request.timeoutSeconds}s)`
                            : 'Assigned'}
                      </span>
                    </td>
                    <td><Link className="button button-secondary" to={`/requests/${request.id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </section>

      <style>{`
        .map-legend {
          display: flex; justify-content: center; gap: 25px; 
          padding: 15px; background: #f8f9fa; border-bottom: 1px solid #ddd;
        }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #444; }
        .legend-item img { width: 22px; height: 22px; }
        
        .hover-card {
          position: absolute; z-index: 1000; background: white; padding: 15px;
          border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); width: 240px;
        }
        .staff-side { top: 20px; right: 20px; border-top: 4px solid #3498db; }
        .request-side { top: 20px; left: 20px; border-top: 4px solid #f1c40f; }
        
        .status { color: #2ecc71; font-weight: bold; font-size: 0.75rem; }
        .timer { color: #e67e22; font-weight: bold; }
        .note-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.8rem; color: #666; }
        .btn-sm { padding: 4px 10px; font-size: 0.8rem; }
      `}</style>
    </div>
  );
}
