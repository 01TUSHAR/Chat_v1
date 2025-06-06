import express from 'express'
import { signup, login, logout, updateProfile, checkAuth } from '../controllers/auth.controller.js'
import { protectedRoute } from '../middlewares/auth.middleware.js';
 
const router = express.Router()

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check',protectedRoute, checkAuth)
router.patch('/update-profile', protectedRoute, updateProfile)


export default router