import express from 'express';
import { createUrl } from '../controllers/url';

const router = express.Router();

router.route('/').post(createUrl);

export default router;
