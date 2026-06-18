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
    title: 'Fast SOS Request',
    copy: 'Send a rescue request in a few steps, with priority for urgent situations.',
  },
  {
    icon: MapPinned,
    title: 'Accurate Location',
    copy: 'Pick a location on the map so the rescue team can reach you quickly.',
  },
  {
    icon: Clock3,
    title: 'Realtime Tracking',
    copy: 'Follow progress, chat, and receive continuous status updates.',
  },
  {
    icon: ShieldCheck,
    title: 'Professional Team',
    copy: 'Admins, rescue companies, and staff coordinate in one service flow.',
  },
];

const TRUST_STATS = [
  { icon: Zap, label: 'Response', value: '< 5 minutes' },
  { icon: Users, label: 'Rescue Teams', value: '24/7' },
  { icon: Headphones, label: 'Support', value: 'Online' },
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
            Fast vehicle rescue,
            <br />
            safe and reliable
          </h1>
          <p className="rescue-hero-copy">
            A vehicle breakdown support system for the road, from request creation and team matching
            to quotes, payments, and service reviews. Built for urgent situations.
          </p>

          <div className="hero-actions" style={{ marginTop: '1.75rem' }}>
            <Link className="button button-sos" to="/register">
              <PhoneCall size={18} aria-hidden="true" />
              Request Help Now
            </Link>
            <Link className="button button-primary" to="/login">
              <LifeBuoy size={18} aria-hidden="true" />
              Sign In
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
            <strong>Need urgent rescue?</strong>
            <p className="muted-line">
              Press SOS to create a request and track the service flow in real time.
            </p>
            <Link className="button button-sos" to="/register">
              <Truck size={18} aria-hidden="true" />
              SOS - Send Request
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
