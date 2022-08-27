import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import app from './app';
import { connect as redisConnect } from './models/redis/connection';
import getUrlRepository from './models/redis/url';

redisConnect()
  .then(async () => {
    console.log('redis connected');
    await getUrlRepository().createIndex();

    mongoose
      .connect(process.env.MONGODB_URI!, {
        authSource: 'admin',
        auth: {
          username: process.env.MONGODB_USERNAME,
          password: process.env.MONGODB_PASSWORD,
        },
      })
      .then(() => {
        console.log('mongodb connected');

        const port = +process.env.PORT!;
        const host = process.env.HOST!;
        app.listen(port, host, () => {
          console.log(`project is up and running on ${host}:${port}`);
        });
      });
  })
  .catch((error) => {
    console.error('error on connecting to redis', { error });
  });
