import { User } from '../model/model.js';
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const google = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: hashedPassword, ...rest } = user._doc;
            const expiryDate = new Date(Date.now() + 21600000);
            res.cookie('access_token', token, {
                httpOnly: true,
                expires: expiryDate,
            })
            res.status(200)
            res.json(rest);
        } else {
            const generatedPassword =
                Math.random().toString(36).slice(-8) +
                Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username:
                    req.body.name.split(' ').join('').toLowerCase() +
                    Math.random().toString(36).slice(-8),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                profilePicture: req.body.photo,
            });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: hashedPassword2, ...rest } = newUser._doc;
            const expiryDate = new Date(Date.now() + 21600000);
            res.cookie('access_token', token, {
                httpOnly: true,
                expires: expiryDate,
            })
            res.status(200)
            res.json(rest);
        }
    } catch (error) {
        next(error);
    }
};

export const signout = (req, res) => {
    res.clearCookie('access_token').status(200).json('Signout success!');
};