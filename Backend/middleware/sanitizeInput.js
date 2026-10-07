const sanitizeObject = (obj) => {
    if (obj && typeof obj === "object") {
        for (const key in obj) {
            if (key.startsWith("$") || key.includes(".")) {
                delete obj[key];
            } else if (typeof obj[key] === "object") {
                sanitizeObject(obj[key]);
            }
        }
    }
    return obj;
};

const sanitizeInput = (req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.params) sanitizeObject(req.params);
    if (req.query) sanitizeObject(req.query); 
    next();
};

export default sanitizeInput;