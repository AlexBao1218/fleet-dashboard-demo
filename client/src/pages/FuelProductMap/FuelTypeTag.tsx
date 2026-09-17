import type { FuelType } from '@shared/fuel-product-map';

interface FuelTypeTagProps {
  fuelType: FuelType;
}

const FUEL_TYPE_TAG_CLASSES: Record<FuelType, string> = {
  Petrol:
    'bg-tag-petrol-bg text-tag-petrol-foreground border-tag-petrol-border',
  Diesel:
    'bg-tag-diesel-bg text-tag-diesel-foreground border-tag-diesel-border',
};

const FuelTypeTag = ({ fuelType }: FuelTypeTagProps) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${FUEL_TYPE_TAG_CLASSES[fuelType]}`}
  >
    {fuelType}
  </span>
);

export default FuelTypeTag;
