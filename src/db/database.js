import mongoose from 'mongoose';

 const connectDb = async () => {
  try {
   const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName:"notebook"  
    });
    console.log(`Mongo DB connected from db->database !! DB HOST : ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error('Error connecting to the database from db -> database.js: ', error);
  }
};

export default connectDb