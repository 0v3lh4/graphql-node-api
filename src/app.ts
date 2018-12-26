import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './graphql/schema';
import { ENV } from './constants/ENV';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middleware();
    }

    middleware(): void {
        this.express.use('/graphql', graphqlHTTP({
            schema,
            graphiql: process.env.NODE_ENV === ENV.NODE.DEVELOPMENT
        }));
    }
}

export default new App().express;