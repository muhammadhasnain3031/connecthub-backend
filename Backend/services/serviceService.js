import serviceRepository from '../repositories/serviceRepository.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

class ServiceService {
  async createService(providerId, serviceData) {
    const { title, description, category, price } = serviceData;

    // Field Validation (Purani Logic)
    if (!title || !description || !category || price === undefined) {
      throw new BadRequestError('All fields are required');
    }
    
    const finalData = { ...serviceData, providerId };
    return await serviceRepository.create(finalData);
  }

    async getServices(queryParams) {
    const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = queryParams;
    
    const andConditions = [];

    if (search) {
      andConditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (category) {
      andConditions.push({ category });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceQuery = {};
      if (minPrice !== undefined) priceQuery.$gte = Number(minPrice);
      if (maxPrice !== undefined) priceQuery.$lte = Number(maxPrice);
      
      andConditions.push({ price: priceQuery });
    }

   
    const queryObj = andConditions.length > 0 ? { $and: andConditions } : {};

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skipValue = (pageNumber - 1) * limitNumber;

    const { data, total } = await serviceRepository.findAll(queryObj, {
      skip: skipValue,
      limit: limitNumber,
      sort: { createdAt: -1 }
    });

    return {
      totalServices: total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      services: data
    };
  }


  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    return service;
  }

  async updateService(id, updateFields) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    // Dynamic property updating logic (Purani Logic)
    const { title, description, category, price, images } = updateFields;
    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (images !== undefined) service.images = images;

    return await service.save();
  }

  async deleteService(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    await serviceRepository.delete(service);
    return true;
  }
}

export default new ServiceService();
