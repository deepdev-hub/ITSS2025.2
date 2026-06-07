import Stepper from '../common/Stepper';

const TRACKING_STEPS = [
  { id: 'submitted', label: 'Đã gửi yêu cầu', hint: 'Tiếp nhận & tìm đội cứu hộ' },
  { id: 'matched', label: 'Ghép đội cứu hộ', hint: 'Công ty nhận nhiệm vụ' },
  { id: 'progress', label: 'Đang xử lý', hint: 'Nhân viên đang hỗ trợ' },
  { id: 'completed', label: 'Hoàn tất', hint: 'Yêu cầu kết thúc' },
];

function getTrackingStep(status) {
  switch (status) {
    case 'CREATED':
    case 'SEARCHING':
      return 1;
    case 'MATCHED':
    case 'ACCEPTED':
      return 2;
    case 'IN_PROGRESS':
      return 3;
    case 'COMPLETED':
      return 4;
    case 'CANCELED':
      return 1;
    default:
      return 1;
  }
}

export default function RequestLifecycleStepper({ status }) {
  const currentStep = getTrackingStep(status);
  const isCanceled = status === 'CANCELED';

  return (
    <div className={`request-lifecycle ${isCanceled ? 'request-lifecycle-canceled' : ''}`}>
      <div className="request-lifecycle-header">
        <div>
          <span className="request-lifecycle-eyebrow">Tiến trình cứu hộ</span>
          <h2>{isCanceled ? 'Yêu cầu đã bị hủy' : 'Theo dõi trạng thái xử lý'}</h2>
        </div>
        {isCanceled ? <span className="status-badge status-canceled">CANCELED</span> : null}
      </div>
      <Stepper steps={TRACKING_STEPS} currentStep={currentStep} />
    </div>
  );
}
