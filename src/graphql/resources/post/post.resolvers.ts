import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnection";
import { UserInstance } from "../../../models/UserModel";
import { PostInstance } from "../../../models/PostModel";
import { Transaction } from "sequelize";
import { handleError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { ResolverContext } from "../../../interfaces/ResolverContext";
import { AuthUser } from "../../../interfaces/AuthUser";
import { DataLoaders } from "../../../interfaces/DataLoaders";
import GraphQLFields from 'graphql-fields';
import { RequestedFields } from "../../ast/RequestedFields";

export const postResolvers = {
    Post: {
        author: (post, args, ctx: ResolverContext, info) => {
            const dataLoaders = ctx.dataLoaders as DataLoaders;
            return dataLoaders.userLoader
                .load({ key: post.get('author'), info })
                .catch(handleError);
        },

        comments: (post, { limit = 10, offset = 0 }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const requestedFields = ctx.requestedFields as RequestedFields;

            return db.Comment
                .findAll({
                    where: { post: post.get('id') },
                    limit,
                    offset,
                    attributes: requestedFields.getFields(info)
                })
                .catch(handleError);
        }
    },

    Query: {
        posts: (post, { limit = 10, offset = 0 }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const requestedFields = ctx.requestedFields as RequestedFields;

            return db.Post
                .findAll({
                    limit,
                    offset,
                    attributes: requestedFields.getFields(info, {keep: ['id'], exclude: ['comments']})
                })
                .catch(handleError);
        },

        post: (post, { id }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const requestedFields = ctx.requestedFields as RequestedFields;

            id = parseInt(id);

            return db.Post
                .findByPk(id, {
                    attributes: requestedFields.getFields(info, {keep: ['id'], exclude: ['comments']})
                })
                .then((post: PostInstance | null) => {
                    if (!post) throw new Error(`Post with id ${id} not found`);
                    return post;
                })
                .catch(handleError);
        }
    },

    Mutation: {
        createPost: compose(...authResolvers)((post, { input }, ctx: ResolverContext, info) => {
            const db = ctx.db as DbConnection;
            const authUser  = ctx.authUser as AuthUser;

            input.author = authUser.id;

            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .create(input, { transaction: t });
            })
                .catch(handleError);
        }),

        updatePost: compose(...authResolvers)((post, { id, input }, ctx: ResolverContext, info) => {
            id = parseInt(id);

            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;

            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findByPk(id)
                    .then((post: PostInstance | null) => {
                        if (!post) throw new Error(`Post with id ${id} not found`);
                        if(post.get('author') != authUser.id) throw new Error(`Unauthorized! You can only edit posts by youself!`);
                        input.author = authUser.id;
                        return post.update(input, { transaction: t });
                    });
            })
                .catch(handleError);
        }),

        deletePost: compose()((post, { id }, ctx: ResolverContext, info) => {
            id = parseInt(id);

            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;

            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findByPk(id)
                    .then((post: PostInstance | null) => {
                        if (!post) throw new Error(`Post with id ${id} not found`);
                        if(post.get('author') != authUser.id) throw new Error(`Unauthorized! You can only delete posts by youself!`);
                        return post.destroy({ transaction: t })
                            .then(() => true)
                            .catch(() => false);
                    });
            })
                .catch(handleError);
        })
    }
};