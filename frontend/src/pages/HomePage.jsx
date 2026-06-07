import { Link } from 'react-router-dom';
import {
  Clock3,
  LifeBuoy,
  MapPinned,
  PhoneCall,
  ShieldCheck,
  Truck,
} from 'lucide-react';

const FEATURES = [
  {
    icon: PhoneCall,
    title: 'Yêu cầu SOS nhanh',
    copy: 'Gửi yêu cầu cứu hộ chỉ vài bước, ưu tiên tình huống khẩn cấp.',
  },
  {
    icon: MapPinned,
    title: 'Định vị chính xác',
    copy: 'Chọn vị trí trên bản đồ để đội cứu hộ tìm đến nhanh nhất.',
  },
  {
    icon: Clock3,
    title: 'Theo dõi realtime',
    copy: 'Xem tiến trình xử lý, chat và cập nhật trạng thái liên tục.',
  },
  {
    icon: ShieldCheck,
    title: 'Đội ngũ chuyên nghiệp',
    copy: 'Admin, công ty cứu hộ và nhân viên phối hợp trên cùng một luồng.',
  },
];

export default function HomePage() {
  return (
    <div className="hero">
      <section className="hero-card">
        <div>
          <span className="rescue-landing-badge">
            <LifeBuoy size={14} aria-hidden="true" />
            Vehicle Breakdown Assistance
          </span>
          <h1 className="rescue-hero-title">Cứu hộ xe nhanh, an toàn, đáng tin cậy</h1>
          <p className="rescue-hero-copy">
            Hệ thống hỗ trợ sự cố xe trên đường — từ gửi yêu cầu, ghép đội cứu hộ,
            báo giá, thanh toán đến đánh giá dịch vụ. Thiết kế tối ưu cho tình huống khẩn cấp.
          </p>

          <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
            <Link className="button button-sos" to="/register">
              <PhoneCall size={18} aria-hidden="true" />
              Yêu cầu hỗ trợ ngay
            </Link>
            <Link className="button button-primary" to="/login">
              Đăng nhập hệ thống
            </Link>
          </div>
        </div>

        <div className="rescue-hero-panel">
          <div className="rescue-sos-card">
            <strong>Cần cứu hộ khẩn cấp?</strong>
            <p className="muted-line">Nhấn SOS để tạo yêu cầu và theo dõi tiến trình xử lý theo thời gian thực.</p>
            <Link className="button button-sos" to="/register">
              <Truck size={18} aria-hidden="true" />
              SOS — Gửi yêu cầu
            </Link>
          </div>

          <div className="rescue-feature-grid">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rescue-feature-item">
                  <span className="rescue-feature-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{feature.title}</strong>
                    <p className="muted-line">{feature.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
