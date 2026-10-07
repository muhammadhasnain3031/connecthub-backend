import serviceService from '../services/serviceService.js';

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export const createService = catchAsync(async (req, res, next) => {
  const providerId = req.user.id || req.user._id;

  // 1. Agar multiple files upload hui hain (req.files), to unke cloud paths (URLs) ka array banayein
  const imageUrls = req.files ? req.files.map(file => file.path) : [];

  // 2. req.body ke andar 'images' ka array inject karein taake service layer ko mil sake
  const serviceData = {
    ...req.body,
    images: imageUrls
  };

  // 3. Purane req.body ki jagah ab updated serviceData pass karein
  const service = await serviceService.createService(providerId, serviceData);

  res.status(201).json({ 
    message: 'Service created successfully', 
    service 
  });
});


// Read All Services - 
export const getAllServices = catchAsync(async (req, res, next) => {
  const result = await serviceService.getServices(req.query);
  res.status(200).json(result);
});

// Read Single Service By ID
export const getServiceById = catchAsync(async (req, res, next) => {
  const service = await serviceService.getServiceById(req.params.id);
  res.status(200).json({ service });
});

export const updateService = catchAsync(async (req, res, next) => {
  const updatedService = await serviceService.updateService(req.params.id, req.body);
  res.status(200).json({ 
    message: 'Service updated successfully', 
    service: updatedService 
  });
});

export const deleteService = catchAsync(async (req, res, next) => {
  await serviceService.deleteService(req.params.id);
  res.status(200).json({ message: 'Service deleted successfully' });
});

export const getTopProvidersMetrics = catchAsync(async (req, res, next) => {
  const analyticsData = await serviceService.getTopProviders();
  
  res.status(200).json({
    success: true,
    message: 'Top analytics pipeline metrics fetched successfully',
    data: analyticsData
  });
});
