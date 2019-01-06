import { UserModel, UserInstance } from "../../models/UserModel";
import graphQLFields from 'graphql-fields';
import { DataLoaderParam } from "../../interfaces/DataLoaderParam";
import { RequestedFields } from "../ast/RequestedFields";

export class UserLoader {
    static batchUsers(user: UserModel, params: DataLoaderParam<number>[], requestedFields: RequestedFields): Promise<UserInstance[]> {
        const ids: number[] = params.map(param => param.key);

        return Promise.resolve(
            user
            .findAll({
                where: { id: { $in: ids} },
                attributes: requestedFields.getFields(params[0].info, { keep: ['id'], exclude: ['posts'] })
            })
        );
    }
}