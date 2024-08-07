import express, { Application } from 'express';
import cors from 'cors';
import mongoose, { ConnectOptions } from 'mongoose';

import config from './config';
import router from './routes';
// import errorMiddleware from './middlewares/error.middleware';

const connectToDatabase = async () => {
    try {
        console.log(`Connecting to MongoDB at ${config.mongoURI}`)
        await mongoose.connect(config.mongoURI, {
            
        } as ConnectOptions);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB Connection Error:, ", err);
    }
};
connectToDatabase();

const app: Application = express();

app.use(cors());
app.use(express.json());

 app.use('/api', router);
// app.use(errorMiddleWare);

const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

