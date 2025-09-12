import create from './create.js';
import {
  approveCompany,
  rejectCompany,
  getPendingCompanies,
  getAllCompanies,
  getCompany,
} from './company.js';
import {
  getAllPaymentsWithDeployment,
  updateWorkerDeploymentStatus,
  getPaymentDeploymentDetails,
  getDeploymentStats,
} from './payment.js';

export default {
  create,
  approveCompany,
  rejectCompany,
  getPendingCompanies,
  getAllCompanies,
  getAllPaymentsWithDeployment,
  updateWorkerDeploymentStatus,
  getPaymentDeploymentDetails,
  getDeploymentStats,
  getCompany,
};
