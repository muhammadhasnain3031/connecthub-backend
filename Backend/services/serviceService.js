import BookingAnalytics from '../models/BookingAnalytics.js';
import serviceRepository from '../repositories/serviceRepository.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';
import mongoose from 'mongoose'; 

class ServiceService {
  async createService(providerId, serviceData) {
    const { title, description, category, price } = serviceData;

    if (!title || !description || !category || price === undefined) {
      throw new BadRequestError('All fields are required');
    }
    
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

    // Lean Execution Hint: Repository ko options bhej rahe hain taaki queries hydrated na hon (Lean optimization)
    const { data, total } = await serviceRepository.findAll(queryObj, {
      skip: skipValue,
      limit: limitNumber,
      sort: { createdAt: -1 },
      lean: true // Repository layer is lean flat flag ko parse kar ke data optimize karegi
    });

    // POJO mapping: Agar repository direct lean object return kar rahi hai to custom virtual mapping apply ho sakay
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
    // Agar read operations perform karne hain to repository layer mein .lean() default implement hona chahiye
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    
    // Mongoose Hydrated documents check and formatting
    const doc = service.toObject ? service.toObject({ virtuals: true }) : service;
    return doc;
  }

  async updateService(id, updateFields) {
    // Update operation ke liye fully dynamic mongoose instance chahiye (No lean here, hooks triggers are active)
    const service = await serviceRepository.findById(id); 
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    const { title, description, category, price, images } = updateFields;
    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (images !== undefined) service.images = images;

    // Is save execution ke sath hi humara 'pre-save slug validation hook' trigger hoga!
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

    // Aggregations default out-of-the-box plain objects (lean) hi return karte hain!
    return await serviceRepository.aggregate(pipeline);
  }
}

export default new ServiceService();
