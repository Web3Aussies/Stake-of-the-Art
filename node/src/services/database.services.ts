import * as mongoDB from "mongodb";
import dotenv from "dotenv";
import { User } from "../models/user";

export const collections: {
    users?: mongoDB.Collection<User>;
    documents?: mongoDB.Collection;
    schemas?: mongoDB.Collection;
    shared?: mongoDB.Collection; 
} = {};

export async function connectToDatabase() {
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(
        process.env.DB_CONN_STRING!
    );

    await client.connect();

    const db: mongoDB.Db = client.db("stakingart-node");

    collections.users = db.collection<User>("users");

    console.log(`Successfully connected to the database: ${db.databaseName}`);
}