import express from 'express';
import { ReservationsController } from '../controllers/reservations';
import { ApartmentsController } from '../controllers/apartments';

const router = express.Router();

export interface ErrorJSON {
  message: string;
}

// --- RESERVATIONS ROUTES ---
router.get('/reservations', async (_req, res) => {
  return res
    .status(200)
    .json(await new ReservationsController().getAllReservations());
});

router.get('/reservations/users/:userId', async (req, res) => {
  if (!req.params.userId) return res.status(400).json({ error: 'Missing id' });
  const controller = new ReservationsController();
  const response = await controller.getAllReservationsOfUser(
    parseInt(req.params.userId)
  );
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.get('/reservations/:reservationId', async (req, res) => {
  if (!req.params.reservationId)
    return res.status(400).json({ error: 'Missing id' });
  const controller = new ReservationsController();
  const response = await controller.getReservation(
    parseInt(req.params.reservationId)
  );
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.post('/reservations', async (req, res) => {
  const controller = new ReservationsController();
  const response = await controller.addReservation(req.body);
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.delete('/reservations/:reservationId', async (req, res) => {
  if (!req.params.reservationId)
    return res.status(400).json({ error: 'Missing id' });
  const controller = new ReservationsController();
  const response = await controller.removeReservation(
    parseInt(req.params.reservationId)
  );
  return res.status(controller.getStatus() ?? 200).send(response);
});

// --- APARTMENTS ROUTES ---
router.get('/apartments', async (req, res) => {
  const controller = new ApartmentsController();
  const response = await controller.getAllApartments(
    req.query.city as string,
    req.query.country as string,
    parseInt((req.query.minRooms as string) ?? 0),
    parseInt((req.query.maxRooms as string) ?? 999999999),
    parseInt((req.query.minPrice as string) ?? 0),
    parseInt((req.query.maxPrice as string) ?? 999999999)
  );
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.get('/apartments/:apartmentId', async (req, res) => {
  if (!req.params.apartmentId)
    return res.status(400).json({ error: 'Missing id' });
  const controller = new ApartmentsController();
  const response = await controller.getApartment(
    parseInt(req.params.apartmentId)
  );
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.post('/apartments', async (req, res) => {
  const controller = new ApartmentsController();
  const response = await controller.addApartment(req.body);
  return res.status(controller.getStatus() ?? 200).send(response);
});

router.delete('/apartments/:apartmentId', async (req, res) => {
  if (!req.params.apartmentId)
    return res.status(400).json({ error: 'Missing id' });
  const controller = new ApartmentsController();
  const response = await controller.removeApartment(
    parseInt(req.params.apartmentId)
  );
  return res.status(controller.getStatus() ?? 200).send(response);
});

export default router;
