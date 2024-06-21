import express from 'express';
import { addUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

router
    .post('/cadastro', addUser)
    .post('/login', loginUser)
    
export default router;