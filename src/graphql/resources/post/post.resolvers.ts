import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnection";
import { UserInstance } from "../../../models/UserModel";
import { error } from "util";
import { PostInstance } from "../../../models/PostModel";
import { Transaction } from "sequelize";
import { handleError } from "../../../utils/utils";

export const postResolvers = {
    Post: {
        author: (post, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findByPk(post.get('author'))
                .then((user: UserInstance | null) => {
                    if (!user) throw new error(`Author with id ${post.get('author')} not found`);
                    return user;
                })
                .catch(handleError);
        },

        comments: (post, { limit = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Comment
                .findAll({
                    where: { post: post.get('id') },
                    limit,
                    offset
                })
                .catch(handleError);
        }
    },

    Query: {
        posts: (post, { limit = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    limit,
                    offset
                })
                .catch(handleError);
        },

        post: (post, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.Post
                .findByPk(id)
                .then((post: PostInstance | null) => {
                    if (!post) throw new error(`Post with id ${id} not found`);
                    return post;
                })
                .catch(handleError);
        }
    },

    Mutation: {
        createPost: (post, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .create(input, { transaction: t });
            })
                .catch(handleError);
        },

        updatePost: (post, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findByPk(id)
                    .then((post: PostInstance | null) => {
                        if (!post) throw new error(`Post with id ${id} not found`);
                        return post.update(input, { transaction: t });
                    });
            })
                .catch(handleError);
        },

        deletePost: (post, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findByPk(id)
                    .then((post: PostInstance | null) => {
                        if (!post) throw new error(`Post with id ${id} not found`);
                        return post.destroy({ transaction: t })
                            .then(() => true)
                            .catch(() => false);
                    });
            })
                .catch(handleError);
        }
    }
};