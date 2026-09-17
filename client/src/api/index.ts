import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

export * as uploadLogApi from './upload-log';
export * as fuelProductMapApi from './fuel-product-map';
export * as fleetVehicleApi from './fleet-vehicle';
export * as dashboardApi from './dashboard';
export * as fuelTransactionApi from './fuel-transaction';
export * as elogbookTripApi from './elogbook-trip';
export * as evMonthlyApi from './ev-monthly';
export * as maintenanceApi from './maintenance';
export * as accidentApi from './accident';
export * as exportApi from './export';
export * as appDocApi from './app-doc';


// Add more API functions here, use axios instance (`axiosForBackend`) to make requests.
// 
// 使用示例：
// export async function getUserData(userId: string) {
//   try {
//     const response = await axiosForBackend({
//       url: `/api/users/${userId}`,
//       method: 'GET'
//     });
//     return response.data;
//   } catch (error) {
//     logger.error('获取用户数据失败', error);
//     throw error;
//   }
// }
