import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './graphql/schema';
import { ENV } from './constants/ENV';
import db from './models';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middleware();
    }

    middleware(): void {
        this.express.use('/graphql',
            (req, res, next) => {
                req['context'] = {};
                req['context'].db = db;
                next();
            },
            graphqlHTTP((req) => ({
                graphiql: process.env.NODE_ENV === ENV.NODE.DEVELOPMENT,
                schema,
                context: req['context']
            }))
        );
    }
}

export default new App().express;