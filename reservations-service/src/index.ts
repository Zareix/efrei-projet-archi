import express, { Application, json, urlencoded } from 'express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import Router from './routes';
import { addConsumer, setMessageConsumed } from './rabbit';
import { ReservationsController } from './controllers/reservations';

dotenv.config();

const PORT = process.env.PORT || 8001;

addConsumer('delete-user-reservations', async (channel, msg) => {
  const controller = new ReservationsController();
  const data = JSON.parse(msg?.content.toString() || '');
  console.log(data);
  if (!data.userId) return;
  const res = await controller.removeAllReservationsOfUser(data.userId);
  console.log(res);
  setMessageConsumed(channel, msg);
});

const app: Application = express();

app.use(express.json());
app.use(express.static('public'));
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/swagger.json',
    },
  })
);

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});

app.use(Router);
