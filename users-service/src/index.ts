import express, { Application, json, urlencoded } from 'express';
import swaggerUi from 'swagger-ui-express';

import Router from './routes';
import { connectQueue } from './rabbit';

const PORT = process.env.PORT || 8000;

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
