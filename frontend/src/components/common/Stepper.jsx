import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep, className = '' }) {
  return (
    <div className={`stepper ${className}`.trim()} role="list" aria-label="Workflow progress">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const stateClass = isComplete ? 'stepper-step-complete' : isActive ? 'stepper-step-active' : 'stepper-step-upcoming';

        return (
          <div key={step.id || step.label} className={`stepper-step ${stateClass}`} role="listitem">
            <div className="stepper-step-indicator" aria-hidden="true">
              {isComplete ? <Check size={16} strokeWidth={3} /> : stepNumber}
            </div>
            <div className="stepper-step-copy">
              <strong>{step.label}</strong>
              {step.hint ? <span>{step.hint}</span> : null}
            </div>
            {index < steps.length - 1 ? <div className="stepper-connector" aria-hidden="true" /> : null}
          </div>
        );
      })}
    </div>
  );
}
