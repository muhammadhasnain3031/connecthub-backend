import Service from '../models/Service.js';

class ServiceRepository {
  async create(serviceData) {
    return await Service.create(serviceData);
  }

  async findById(id) {
    return await Service.findById(id).populate('providerId', 'name email');
  }

  async findByIdAndUpdate(id, updateData) {
    return await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(serviceInstance) {
    return await serviceInstance.deleteOne();
  }

  async findAll(queryObj, options) {
    const { skip, limit, sort } = options;
    
    const data = await Service.find(queryObj)
      .populate('providerId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(queryObj);

    return { data, total };
  }
}

export default new ServiceRepository();
