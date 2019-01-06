import { DbConnection } from "../../interfaces/DbConnection";
import { DataLoaders } from "../../interfaces/DataLoaders";
import DataLoader from "dataloader";
import { UserLoader } from "./UserLoader";
import { UserInstance } from "../../models/UserModel";
import { PostInstance } from "../../models/PostModel";
import { PostLoader } from "./PostLoader";
import { RequestedFields } from "../ast/RequestedFields";
import { DataLoaderParam } from "../../interfaces/DataLoaderParam";

export class DataLoaderFactory {
    constructor(
        private db: DbConnection,
        private requestedFields: RequestedFields
    ) {}

    getLoaders(): DataLoaders {
        return {
            userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(
                (params: DataLoaderParam<number>[]) => UserLoader.batchUsers(this.db.User, params, this.requestedFields),
                { cacheKeyFn: (param: DataLoaderParam<number>) => param.key }
            ),
            postLoader: new DataLoader<DataLoaderParam<number>, PostInstance>(
                (params: DataLoaderParam<number>[]) => PostLoader.batchPosts(this.db.Post, params, this.requestedFields),
                { cacheKeyFn: (param: DataLoaderParam<number>) => param.key }
            )
        };
    }
}