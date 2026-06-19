import { Wrench } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import AdminLookupCatalogPage from '../../components/admin/AdminLookupCatalogPage';

const initialForm = {
  serviceCode: '',
  serviceName: '',
  description: '',
  basePrice: '',
};

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
      extraColumns={[
        {
          key: 'basePrice',
          label: 'Base price',
          render: (item) => {
            const value = Number(item.basePrice ?? 0);
            return (
              <span className="lookup-code-chip">
                {Number.isFinite(value) ? value.toLocaleString('en-US') : '0'} VND
              </span>
            );
          },
        },
      ]}
      renderExtraFormFields={({ form, setForm }) => (
        <div className="field">
          <label htmlFor="service-type-base-price-input">Base price</label>
          <input
            id="service-type-base-price-input"
            type="number"
            min="0"
            step="1000"
            value={form.basePrice}
            onChange={(event) => setForm((previous) => ({ ...previous, basePrice: event.target.value }))}
            placeholder="e.g. 250000"
          />
          <span className="muted-line">Base service fee before distance and other fee adjustments.</span>
        </div>
      )}
      api={{
        list: adminApi.getServiceTypes,
        create: (payload) => adminApi.createServiceType({
          ...payload,
          basePrice: payload.basePrice === '' ? 0 : Number(payload.basePrice),
        }),
        update: (id, payload) => adminApi.updateServiceType(id, {
          ...payload,
          basePrice: payload.basePrice === '' ? 0 : Number(payload.basePrice),
        }),
        remove: adminApi.deleteServiceType,
      }}
    />
  );
}
