import getAll from './getAll.js';
import getOne from './getOne.js';
import getByRegion from './getByRegion.js';
import create from './create.js';
import update from './update.js';
import deletePricing from './delete.js';
import getStats from './getStats.js';

export default {
  getAll,
  getOne,
  getByRegion,
  create,
  update,
  delete: deletePricing,
  getStats,
};
