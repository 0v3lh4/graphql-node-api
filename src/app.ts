import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './graphql/schema';
import { ENV } from './constants/ENV';
import db from './models';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';

class App {
    public express: express.Application;
    private dataLoader: DataLoaderFactory;
    private requestedFields:  RequestedFields;

    constructor() {
        this.express = express();
        this.middleware();
        this.requestedFields = new RequestedFields();
        this.dataLoader = new DataLoaderFactory(db, this.requestedFields);
    }

    middleware(): void {
        this.express.use('/graphql',

            extractJwtMiddleware(),

            (req, res, next) => {
                req['context']['db'] = db;
                req['context']['dataLoaders'] = this.dataLoader.getLoaders();
                req['context']['requestedFields'] = this.requestedFields;
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