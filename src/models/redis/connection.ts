import { Client } from 'redis-om';

const client = new Client();

const redisUri = process.env.REDIS_URI;

const connect = () => {
  return client.open(redisUri);
};

export { client, connect };
