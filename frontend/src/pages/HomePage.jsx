import { Link } from 'react-router-dom';
import {
  Clock3,
  Headphones,
  LifeBuoy,
  MapPinned,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Zap,
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

const TRUST_STATS = [
  { icon: Zap, label: 'Phản hồi', value: '< 5 phút' },
  { icon: Users, label: 'Đội cứu hộ', value: '24/7' },
  { icon: Headphones, label: 'Hỗ trợ', value: 'Trực tuyến' },
];

export default function HomePage() {
  return (
    <div className="hero landing-page">
      <div className="landing-orb landing-orb-1" aria-hidden="true" />
      <div className="landing-orb landing-orb-2" aria-hidden="true" />
      <div className="landing-orb landing-orb-3" aria-hidden="true" />

      <section className="hero-card landing-hero">
        <div>
          <span className="rescue-landing-badge">
            <Sparkles size={14} aria-hidden="true" />
            Vehicle Breakdown Assistance
          </span>
          <h1 className="rescue-hero-title">
            Cứu hộ xe nhanh,
            <br />
            an toàn, đáng tin cậy
          </h1>
          <p className="rescue-hero-copy">
            Hệ thống hỗ trợ sự cố xe trên đường — từ gửi yêu cầu, ghép đội cứu hộ,
            báo giá, thanh toán đến đánh giá dịch vụ. Thiết kế tối ưu cho tình huống khẩn cấp.
          </p>

          <div className="hero-actions" style={{ marginTop: '1.75rem' }}>
            <Link className="button button-sos" to="/register">
              <PhoneCall size={18} aria-hidden="true" />
              Yêu cầu hỗ trợ ngay
            </Link>
            <Link className="button button-primary" to="/login">
              <LifeBuoy size={18} aria-hidden="true" />
              Đăng nhập hệ thống
            </Link>
          </div>

          <div className="landing-trust-row">
            {TRUST_STATS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="landing-trust-item">
                  <Icon size={18} color="var(--primary)" aria-hidden="true" />
                  <div>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rescue-hero-panel">
          <div className="rescue-sos-card">
            <strong>Cần cứu hộ khẩn cấp?</strong>
            <p className="muted-line">
              Nhấn SOS để tạo yêu cầu và theo dõi tiến trình xử lý theo thời gian thực.
            </p>
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
