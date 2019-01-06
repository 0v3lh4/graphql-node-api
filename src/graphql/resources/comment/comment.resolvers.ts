import { DbConnection } from "../../../interfaces/DbConnection";
import { GraphQLResolveInfo } from "graphql";
import PostModel from "../../../models/PostModel";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";
import { handleError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { ResolverContext } from "../../../interfaces/ResolverContext";
import { AuthUser } from "../../../interfaces/AuthUser";
import { DataLoaders } from "../../../interfaces/DataLoaders";
import { RequestedFields } from "../../ast/RequestedFields";

export const commentResolvers = {
    Comment: {
        post: (comment, args, ctx: ResolverContext, info) => {
            const dataLoaders = ctx.dataLoaders as DataLoaders;

            return dataLoaders.postLoader
                .load({ key: comment.get('post'), info })
                .catch(handleError);
        },

        user: (comment, args, ctx: ResolverContext, info) => {
            const dataLoaders = ctx.dataLoaders as DataLoaders;

            return dataLoaders.userLoader
                .load({ key: comment.get('user'), info })
                .catch(handleError);
        }
    },

    Query: {
        commentsByPost: (comment, { postId, limit = 10, offset = 0 }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const requestedFields = ctx.requestedFields as RequestedFields;

            postId = parseInt(postId);

            return db.Comment
                .findAll({
                    where: { post: postId },
                    limit,
                    offset,
                    attributes: requestedFields.getFields(info)
                })
                .catch(handleError);
        }
    },

    Mutation: {
        createComment: compose(...authResolvers)((comment, { input }, ctx: ResolverContext, info) => {
            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;

            input.user = authUser.id;

            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, { transaction: t });
            }).catch(handleError);
        }),

        updateComment: compose()((comment, { id, input }, ctx: ResolverContext, info) => {
            id = parseInt(id);

            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;

            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findByPk(id)
                    .then((comment: CommentInstance | null) => {
                        if (!comment) throw new Error(`Comment with id ${id} not found`);
                        if(comment.get('user') != authUser.id) throw new Error(`Unauthorized! You can only edit comments by youself!`);
                        return comment.update(input, { transaction: t });
                    });
            }).catch(handleError);
        }),

        deleteComment: compose()((comment, { id }, ctx: ResolverContext, info) => {
            id = parseInt(id);

            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;

            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findByPk(id)
                    .then((comment: CommentInstance | null) => {
                        if (!comment) throw new Error(`Comment with id ${id} not found`);
                        if(comment.get('user') != authUser.id) throw new Error(`Unauthorized! You can only delete comments by youself!`);
                        return comment.destroy({ transaction: t })
                            .then(() => true)
                            .catch(() => false);
                    });
            }).catch(handleError);
        }),
    }
};