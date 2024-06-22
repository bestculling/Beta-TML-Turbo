import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies['access_token'];
    console.log("Token from cookie:", token);  // เพิ่ม console log ตรงนี้

    if (!token) {
        console.log("Token not found");  // เพิ่ม console log ตรงนี้
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        console.log("Token verified"); // เพิ่ม console log ตรงนี้
        next();
    } catch (error) {
        console.log("Token verification failed:", error.message); // เพิ่ม console log ตรงนี้
        res.status(401).json({ message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    }
};