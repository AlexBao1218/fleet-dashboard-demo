import ManualEntriesTable from '../UploadCenter/ManualEntriesTable';
import ManualEntryCard from '../UploadCenter/ManualEntryCard';
import { useManualEntries } from '../UploadCenter/useManualEntries';

const ManualEntryTab = () => {
  const { items, loading, refresh } = useManualEntries();

  return (
    <div className="flex flex-col gap-6">
      <ManualEntryCard onSaved={refresh} />
      <ManualEntriesTable
        items={items}
        loading={loading}
        onRefresh={refresh}
      />
    </div>
  );
};

export default ManualEntryTab;
