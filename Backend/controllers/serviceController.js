import Service from '../models/Service.js';

// POST /api/services (provider only)
export const createService = async (req, res) => {
  try {
    const { title, description, category, price, images } = req.body;

    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Safely fallback to req.user._id if req.user.id is undefined
    const providerId = req.user.id || req.user._id;

    const service = await Service.create({
      providerId,
      title,
      description,
      category,
      price,
      images,
    });

    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('providerId', 'name email');
    res.status(200).json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/services/:id
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('providerId', 'name email');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/services/:id (owner provider only)
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // NOTE: Ownership validation check is handled by verifyOwnership middleware in routes!

    const { title, description, category, price, images } = req.body;

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (images !== undefined) service.images = images;

    const updatedService = await service.save();

    res.status(200).json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/services/:id (owner provider only)
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // NOTE: Ownership validation check is handled by verifyOwnership middleware in routes!

    await service.deleteOne();

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
