import express from 'express';
import { redirect } from './controllers/url';
import urlRouter from './routers/url';

const app = express();

app.use(express.json({ limit: '2KB' }));
app.set('etag', true);

app.use('/url', urlRouter);
app.get('/:identifier', redirect);

export default app;
