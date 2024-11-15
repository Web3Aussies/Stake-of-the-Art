import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectToDatabase } from './services/database.services';
import bot from './bot';

dotenv.config();

const app: Express = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const port = process.env.PORT || 3100;

const tryCatch = async (req: Request, res: Response, next: NextFunction, func: any) => {
    try {
        await func(req, res);
    } catch (err: any) {
        next(err);
    }
}

connectToDatabase()
    .then(() => {
        app.get('/', (req: Request, res: Response) => {
            res.send("Express + Typescript server")
        });

        // Endpoints

        bot();

        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    })
    .catch((err: Error) => {
        console.error("Cannot connect to database", err);
        process.exit();
    });