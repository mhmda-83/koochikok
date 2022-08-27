import { Entity, Schema } from 'redis-om';
import { client } from '../redis/connection';

class URL extends Entity {}

const schema = new Schema(URL, {
  original_url: { type: 'string' },
  shorten_identifier: { type: 'string', indexed: true },
  created_at: { type: 'date', sortable: true },
  accessed_times: { type: 'number', sortable: true },
});

const getRepository = () => {
  return client.fetchRepository(schema);
};

export { schema };
export default getRepository;
