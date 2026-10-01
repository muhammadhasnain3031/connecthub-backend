import Service from '../models/Service.js';

class ServiceRepository {
  async create(serviceData) {
    return await Service.create(serviceData);
  }

  async findById(id) {
    // Read operation optimized with .lean() to clear hydration overhead
    return await Service.findById(id)
      .populate('providerId', 'name email')
      .lean();
  }

  async findByIdAndUpdate(id, updateData) {
    return await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true, // Yeh custom validators ko trigger karega!
    });
  }

  async delete(serviceInstance) {
    return await serviceInstance.deleteOne();
  }

  async findAll(queryObj, options) {
    const { skip, limit, sort, lean } = options;
    
    // Dynamic Query Optimization chain
    let query = Service.find(queryObj)
      .populate('providerId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Agar service layer se optimize flag ('lean: true') aaya hai, to process run karein
    if (lean) {
      query = query.lean();
    }

    const data = await query;
    const total = await Service.countDocuments(queryObj);

    return { data, total };
  }

  // Day 19 Aggregation bridge (just in case service layer looks for it)
  async aggregate(pipeline) {
    return await Service.aggregate(pipeline);
  }
}

export default new ServiceRepository();
