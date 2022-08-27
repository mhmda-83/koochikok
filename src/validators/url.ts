import Validator from 'fastest-validator';

const v = new Validator();

const schema = {
  original_url: { type: 'url' },
};

const check = v.compile(schema);

export default check;
