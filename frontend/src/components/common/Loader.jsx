export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="loader-card">
      <div className="loader-spinner" />
      <p>{label}</p>
    </div>
  );
}
