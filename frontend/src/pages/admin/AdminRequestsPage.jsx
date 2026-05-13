import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

// Fix lỗi icon mặc định của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icon tùy chỉnh cho Nhân viên cứu hộ (Màu xanh/Vàng)
const staffIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995562.png', 
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component hỗ trợ di chuyển bản đồ đến tọa độ sự cố khi click chọn request
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14);
  }, [center, map]);
  return null;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [activeStaff, setActiveStaff] = useState([]); // Chứa tọa độ các Staff đang ACTIVE
  const [filters, setFilters] = useState({ search: '', status: 'ALL' });
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null); // Request đang được xem để gán
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      // Gọi song song danh sách request và tọa độ staff
      const [requestList, staffList] = await Promise.all([
        adminApi.getRequests(),
        adminApi.getActiveStaff(), // API mới bạn cần thêm vào adminApi.js
      ]);
      setRequests(requestList);
      setActiveStaff(staffList);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh vị trí staff mỗi 30 giây
    const timer = setInterval(() => loadData(true), 30000);
    return () => clearInterval(timer);
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.requestCode.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.customerName?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'ALL' || r.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [requests, filters]);

  const handleAssignDirectly = async (staffId) => {
    if (!selectedRequest) return;
    
    setAssigningId(selectedRequest.id);
    setError('');
    setNotice('');
    try {
      // API mới: PUT /api/admin/requests/{id}/assign-staff
      await adminApi.assignStaff(selectedRequest.id, { staffId });
      setNotice(`Đã gán yêu cầu ${selectedRequest.requestCode} cho nhân viên thành công!`);
      setSelectedRequest(null);
      await loadData(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) return <Loader label="Đang tải dữ liệu điều phối..." />;

  return (
    <>
      <PageHeader 
        title="Điều phối Cứu hộ" 
        subtitle="Quản lý yêu cầu và theo dõi vị trí nhân viên real-time trên bản đồ"
      />

      {notice ? <div className="notice success">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="admin-dispatch-layout" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 200px)' }}>
        
        {/* CỘT TRÁI: DANH SÁCH REQUEST */}
        <div className="request-sidebar card" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Tìm mã request, khách hàng..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CREATED">Mới tạo (Chờ gán)</option>
              <option value="SEARCHING">Đang tìm (Timeout gán)</option>
              <option value="MATCHED">Đã gán (Chờ Staff xác nhận)</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
            </select>
          </div>

          <div className="request-items-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            {filteredRequests.length === 0 ? (
              <p className="muted-line">Không tìm thấy yêu cầu nào.</p>
            ) : (
              filteredRequests.map((req) => (
                <div 
                  key={req.id} 
                  className={`dispatch-item ${selectedRequest?.id === req.id ? 'active' : ''}`}
                  onClick={() => setSelectedRequest(req)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    background: selectedRequest?.id === req.id ? 'var(--secondary)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>{req.requestCode}</strong>
                    <StatusBadge value={req.status} />
                  </div>
                  <div className="muted-line" style={{ fontSize: '0.85rem' }}>
                    👤 {req.customerName} | 🚗 {req.vehicleLabel}
                  </div>
                  <div className="muted-line" style={{ fontSize: '0.85rem' }}>
                    📍 {getRequestLocationLabel(req)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT PHẢI: BẢN ĐỒ ĐIỀU PHỐI */}
        <div className="map-container card" style={{ flex: 1, padding: '0', overflow: 'hidden', position: 'relative' }}>
          <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Tự động chuyển vùng bản đồ khi chọn Request */}
            {selectedRequest && selectedRequest.location?.latitude && (
              <MapRecenter center={[selectedRequest.location.latitude, selectedRequest.location.longitude]} />
            )}

            {/* Hiển thị Marker sự cố (Màu đỏ) */}
            {selectedRequest && selectedRequest.location?.latitude && (
              <Marker position={[selectedRequest.location.latitude, selectedRequest.location.longitude]}>
                <Popup>
                  <strong>Sự cố: {selectedRequest.requestCode}</strong> <br />
                  Loại: {selectedRequest.incidentTypeName} <br />
                  Ưu tiên: {selectedRequest.priorityLevel}
                </Popup>
                {/* Vẽ vòng tròn bán kính 5km xung quanh sự cố */}
                <Circle 
                  center={[selectedRequest.location.latitude, selectedRequest.location.longitude]} 
                  radius={5000} 
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }} 
                />
              </Marker>
            )}

            {/* Hiển thị tất cả Staff đang ACTIVE trên bản đồ */}
            {activeStaff.map((staff) => (
              <Marker 
                key={staff.id} 
                position={[staff.currentLatitude, staff.currentLongitude]} 
                icon={staffIcon}
              >
                <Popup>
                  <div style={{ minWidth: '150px' }}>
                    <strong>{staff.fullName}</strong> <br />
                    <span className="muted-line">{staff.jobTitle || 'Kỹ thuật viên'}</span> <br />
                    SĐT: {staff.phone} <br />
                    {selectedRequest && ['CREATED', 'SEARCHING'].includes(selectedRequest.status) && (
                      <button 
                        className="button button-primary" 
                        style={{ marginTop: '10px', width: '100%' }}
                        disabled={assigningId === selectedRequest.id}
                        onClick={() => handleAssignDirectly(staff.id)}
                      >
                        {assigningId === selectedRequest.id ? 'Đang gán...' : 'Gán ca này'}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Overlay hiển thị thông tin request đang chọn */}
          {selectedRequest && (
            <div style={{ 
              position: 'absolute', bottom: '20px', left: '20px', right: '20px', 
              zIndex: 1000, background: 'white', padding: '15px', borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0 }}>Đang điều phối: {selectedRequest.requestCode}</h3>
                <p style={{ margin: '5px 0 0', color: 'var(--muted)' }}>
                  Hãy chọn một nhân viên (icon thợ sửa xe) trên bản đồ để gán việc.
                </p>
              </div>
              <button className="button button-secondary" onClick={() => setSelectedRequest(null)}>Hủy chọn</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}