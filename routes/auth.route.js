import express from 'express';
import { google, signout } from '../controllers/auth.controller.js'

const router = express.Router();

router.post('/google', google);
router.get('/signout', signout);

export default router;