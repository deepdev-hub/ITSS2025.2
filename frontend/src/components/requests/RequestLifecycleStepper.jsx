import Stepper from '../common/Stepper';

const TRACKING_STEPS = [
  { id: 'submitted', label: 'Request Submitted', hint: 'Received and searching for a rescue team' },
  { id: 'matched', label: 'Staff Matched', hint: 'A staff member has accepted the request' },
  { id: 'progress', label: 'In Progress', hint: 'Staff has checked in and is assisting the customer' },
  { id: 'completed', label: 'Completed', hint: 'The request has ended' },
];

function getTrackingStep(status, hasPaidPayment) {
  if (hasPaidPayment) {
    return 5;
  }
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
      return 5;
    case 'CANCELED':
      return 1;
    default:
      return 1;
  }
}

export default function RequestLifecycleStepper({ status, hasPaidPayment }) {
  const currentStep = getTrackingStep(status, hasPaidPayment);
  const isCanceled = status === 'CANCELED';

  return (
    <div className={`request-lifecycle ${isCanceled ? 'request-lifecycle-canceled' : ''}`}>
      <div className="request-lifecycle-header">
        <div>
          <span className="request-lifecycle-eyebrow">Rescue Progress</span>
          <h2>{isCanceled ? 'Request canceled' : 'Track service status'}</h2>
        </div>
        {isCanceled ? <span className="status-badge status-canceled">CANCELED</span> : null}
      </div>
      <Stepper steps={TRACKING_STEPS} currentStep={currentStep} />
    </div>
  );
}
