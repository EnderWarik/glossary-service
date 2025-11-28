import express from 'express';
import cors from 'cors';
import { config } from './config';
import { bearerAuthMiddleware } from './middleware';
import termsRouter from './routes/terms';
import relationsRouter from './routes/relations';

const app = express();

app.use(cors({
  origin: ['*'],
  methods: ['*'],
  allowedHeaders: ['*'],
}));

app.use(express.json());
app.use(bearerAuthMiddleware);

app.use('/api', termsRouter);
app.use('/api', relationsRouter);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

