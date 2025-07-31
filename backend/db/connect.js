import mongoose from 'mongoose';

connect().then(() => console.log('Database connected')).catch(err => console.log(err));

async function connect() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
}
export default connect;