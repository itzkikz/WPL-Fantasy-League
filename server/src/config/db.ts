import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '', { dbName: 'fantasy' });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Pre-warm player listings cache in background so first user request is instant
    import('../controllers/players').then(({ warmPlayersCache }) => {
      warmPlayersCache();
    }).catch(() => {});
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
