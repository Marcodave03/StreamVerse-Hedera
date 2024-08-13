import express from 'express';
import { getRooms, createRoom, joinRoom } from '../controllers/streamingController.js';

const router = express.Router();

router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.post('/join-room', joinRoom);

export default router;
