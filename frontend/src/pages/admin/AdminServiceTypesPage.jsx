import { Wrench } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import AdminLookupCatalogPage from '../../components/admin/AdminLookupCatalogPage';

const initialForm = { serviceCode: '', serviceName: '', description: '' };

export default function AdminServiceTypesPage() {
  return (
    <AdminLookupCatalogPage
      title="Service Types"
      subtitle="Manage rescue service offerings that companies can assign to vehicles, staff, and customer requests."
      eyebrow="System Catalog"
      icon={<Wrench size={28} />}
      rowIcon={Wrench}
      codeKey="serviceCode"
      nameKey="serviceName"
      initialForm={initialForm}
      codeLabel="Service code"
      nameLabel="Display name"
      descriptionLabel="Guidance"
      entityLabel="service type"
      api={{
        list: adminApi.getServiceTypes,
        create: adminApi.createServiceType,
        update: adminApi.updateServiceType,
        remove: adminApi.deleteServiceType,
      }}
    />
  );
}
