import mongoose from 'mongoose';

interface IURL {
  original_url: string;
  shorten_identifier: string;
  created_at: Date;
  accessed_times: number;
}

const schema = new mongoose.Schema<IURL>({
  original_url: { type: String, required: true },
  shorten_identifier: { type: String, required: true },
  created_at: { type: Date, required: true },
  accessed_times: { type: Number, required: true },
});

const model = mongoose.model('URL', schema);

export default model;
