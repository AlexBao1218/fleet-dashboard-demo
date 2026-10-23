import React, {lazy, Suspense} from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import FuelConsumption from './pages/FuelConsumption/FuelConsumption';
const MaintenancePage = lazy(() => import('./pages/Maintenance/MaintenancePage'));
const AccidentPage = lazy(() => import('./pages/Accident/AccidentPage'));
const DataManagement = lazy(() => import('./pages/DataManagement/DataManagement'));
import NotFound from './pages/NotFound/NotFound';

const RoutesComponent = () => {
  return (
    <Suspense fallback={<div role="status" style={{padding:24}}>Loading…</div>}><Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/fuel-consumption" replace />} />
        <Route path="fuel-consumption" element={<FuelConsumption />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="accident" element={<AccidentPage />} />
        <Route path="data-management" element={<DataManagement />} />
        <Route
          path="upload-center"
          element={<Navigate to="/data-management?tab=upload" replace />}
        />
        <Route
          path="fuel-product-map"
          element={<Navigate to="/data-management?tab=reference" replace />}
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes></Suspense>
  );
};

export default RoutesComponent;
