import { PostModel, PostInstance } from "../../models/PostModel";
import { DataLoaderParam } from "../../interfaces/DataLoaderParam";
import { RequestedFields } from "../ast/RequestedFields";

export class PostLoader {
    static batchPosts(post: PostModel, params: DataLoaderParam<number>[], requestedFields: RequestedFields): Promise<PostInstance[]> {
        const ids: number[] = params.map(param => param.key);

        return Promise.resolve(
            post.findAll({
                where: { id: { $in: ids } },
                attributes: requestedFields.getFields(params[0].info, { keep: ['id'], exclude: ['comments'] })
            })
        )
    }
}