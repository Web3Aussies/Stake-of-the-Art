import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Express = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const port = process.env.PORT || 3100;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});