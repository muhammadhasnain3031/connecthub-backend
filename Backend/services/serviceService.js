import BookingAnalytics from '../models/BookingAnalytics.js';
import serviceRepository from '../repositories/serviceRepository.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';
import mongoose from 'mongoose'; 

class ServiceService {
  async createService(providerId, serviceData) {
    // 1. Destructuring me 'images' ko bhi shamil kiya
    const { title, description, category, price, images } = serviceData;

    if (!title || !description || !category || price === undefined) {
      throw new BadRequestError('All fields are required');
    }
    
    // Yahan finalData me providerId aur serviceData (jis me images array hai) dono mix ho kar repository me jayenge
    const finalData = { ...serviceData, providerId };
    const createdService = await serviceRepository.create(finalData);

    try {
      const todayStr = new Date().toISOString().split('T')[0]; 
      
      await BookingAnalytics.findOneAndUpdate(
        { date: todayStr },
        { $inc: { totalServicesCreated: 1 } },
        { upsert: true }
      );
    } catch (analyticsError) {
      console.error('Analytics tracking failed silently:', analyticsError);
    }

    return createdService;
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
      sort: { createdAt: -1 },
      lean: true 
    });

    const optimizedServices = data.map(service => {
      const doc = service.toObject ? service.toObject({ virtuals: true }) : service;
      if (!doc.shortDescription && doc.description) {
        doc.shortDescription = doc.description.length > 60 ? doc.description.substring(0, 60) + '...' : doc.description;
      }
      return doc;
    });

    return {
      totalServices: total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      services: optimizedServices
    };
  }

  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    
    const doc = service.toObject ? service.toObject({ virtuals: true }) : service;
    return doc;
  }

  async updateService(id, updateFields) {
    const service = await serviceRepository.findById(id); 
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    const { title, description, category, price, images } = updateFields;
    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    
    // Cloudinary upload ke baad jab naya images array aayega to ye purane ko overwrite ya extend kar dega
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

  async getTopProviders() {
    const pipeline = [
      {
        $group: {
          _id: '$providerId',
          averagePrice: { $avg: '$price' },
          totalServices: { $sum: 1 },
        },
      },
      {
        $sort: { totalServices: -1, averagePrice: 1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users', 
          localField: '_id',
          foreignField: '_id',
          as: 'providerDetails',
        },
      },
      {
        $unwind: '$providerDetails',
      },
      {
        $project: {
          _id: 1,
          totalServices: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          'providerDetails.name': 1,
          'providerDetails.email': 1,
        },
      },
    ];

    return await serviceRepository.aggregate(pipeline);
  }
}

export default new ServiceService();
