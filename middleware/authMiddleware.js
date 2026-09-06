import jwt from 'jsonwebtoken';

async function protect(req,res,next) {
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message : 'invalid user'})
        }
        const verifiedUser = jwt.verify(token,(process.env.JWT_SECRET))
        req.user = verifiedUser;
        next();
    }
    catch(error){
        return res.status(401).json({message: error.message})
    }
}
export default protect;
