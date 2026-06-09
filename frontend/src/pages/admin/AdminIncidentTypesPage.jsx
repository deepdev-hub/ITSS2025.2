import { AlertTriangle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import AdminLookupCatalogPage from '../../components/admin/AdminLookupCatalogPage';

const initialForm = { incidentCode: '', incidentName: '', description: '' };

export default function AdminIncidentTypesPage() {
  return (
    <AdminLookupCatalogPage
      title="Incident Types"
      subtitle="Define standardized incident categories used when customers create rescue requests and when staff triage emergencies."
      eyebrow="System Catalog"
      icon={<AlertTriangle size={28} />}
      rowIcon={AlertTriangle}
      codeKey="incidentCode"
      nameKey="incidentName"
      initialForm={initialForm}
      codeLabel="Incident code"
      nameLabel="Display name"
      descriptionLabel="Guidance"
      entityLabel="incident type"
      api={{
        list: adminApi.getIncidentTypes,
        create: adminApi.createIncidentType,
        update: adminApi.updateIncidentType,
        remove: adminApi.deleteIncidentType,
      }}
    />
  );
}
