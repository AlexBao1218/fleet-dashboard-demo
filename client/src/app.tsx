import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import FuelConsumption from './pages/FuelConsumption/FuelConsumption';
import MaintenancePage from './pages/Maintenance/MaintenancePage';
import AccidentPage from './pages/Accident/AccidentPage';
import DataManagement from './pages/DataManagement/DataManagement';
import NotFound from './pages/NotFound/NotFound';

const RoutesComponent = () => {
  return (
    <Routes>
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
    </Routes>
  );
};

export default RoutesComponent;
