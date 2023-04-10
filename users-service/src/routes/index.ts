import express from 'express';
import { UsersController } from '../controllers/users';
import { authMiddleware } from '../middleware';
import { AuthController } from '../controllers/auth';

const router = express.Router();

export interface ErrorJSON {
  message: string;
}

router.get('/users', async (_req, res) => {
  const controller = new UsersController();
  const response = await controller.getAllUsers();
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.get('/users/:userId/exists', async (req, res) => {
  if (!req.params.userId) return res.status(400).json({ error: 'Missing id' });
  const controller = new UsersController();
  const response = await controller.checkUserExists(
    parseInt(req.params.userId)
  );
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.post('/auth/register', async (req, res) => {
  const controller = new AuthController();
  const response = await controller.register(req.body);
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.delete('/users/:userId', authMiddleware, async (req, res) => {
  if (!req.params.userId) return res.status(400).json({ error: 'Missing id' });
  const controller = new UsersController();
  const response = await controller.removeUser(parseInt(req.params.userId));
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.get('/users/:userId', authMiddleware, async (req, res) => {
  if (!req.params.userId) return res.status(400).json({ error: 'Missing id' });
  const controller = new UsersController();
  const response = await controller.getUser(parseInt(req.params.userId));
  return res.status(controller.getStatus() ?? 200).send(response);
});

export default router;
