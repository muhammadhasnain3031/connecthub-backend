import jwt from 'jsonwebtoken';

async function protect(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'invalid user' });
        }
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verifiedUser;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
}

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not Allowed' });
        }
        next();
    };
};

const verifyOwnership = (model) => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);

            if (!resource) {
                return res.status(404).json({ message: 'Resource not found' });
            }

    const isOwner = resource.userId
    ? (resource.userId?.toString() === req.user?.id || resource.userId?.toString() === req.user?._id)
    : (resource.providerId?.toString() === req.user?.id || resource.providerId?.toString() === req.user?._id);


            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Access Denied: You do not own this resource' });
            }

            next();
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };
};

export { protect, authorizeRoles, verifyOwnership };