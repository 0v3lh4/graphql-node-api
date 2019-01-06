import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnection";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import { handleError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { AuthUser } from "../../../interfaces/AuthUser";
import { ResolverContext } from "../../../interfaces/ResolverContext";
import { authResolvers } from "../../composable/auth.resolver";
import { RequestedFields } from "../../ast/RequestedFields";

export const userResolvers = {
    User: {
        posts: (parent, { limit = 10, offset = 0 }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const requestedFields = ctx.requestedFields as RequestedFields;

            return db.Post
                .findAll({
                    where: { author: parent.get('id') },
                    limit,
                    offset,
                    attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
                })
                .catch(handleError);
        },
    },

    Query: {
        users: (parent, { limit = 10, offset = 0 }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const requestedFields = ctx.requestedFields as RequestedFields;

            return db.User.findAll({
                limit,
                offset,
                attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
            })
                .catch(handleError);
        },

        user: (parent, { id }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            const db = ctx.db as DbConnection;
            const requestedFields = ctx.requestedFields as RequestedFields;

            return db.User
                .findByPk(id, {
                    attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                })
                .then((user: UserInstance | null) => {
                    if (!user) throw new Error(`User with id ${id} not found!`);
                    return user;
                })
                .catch(handleError);
        },

        currentUser: compose(...authResolvers)((parent, args, ctx: ResolverContext, info) => {
            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;
            const requestedFields = ctx.requestedFields as RequestedFields;

            return db.User
                .findByPk(authUser.id, {
                    attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                })
                .then((user: UserInstance | null) => {
                    if (!user) throw new Error(`User with id ${authUser.id} not found!`);
                    return user;
                })
                .catch(handleError);
        })
    },

    Mutation: {
        createUser: (parent, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(input, { transaction: t });
            })
                .catch(handleError);
        },

        updateUser: compose(...authResolvers)((parent, { input }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findByPk(authUser.id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new Error(`User with id ${authUser.id} not found!`);
                        return user.update(input, { transaction: t });
                    });
            })
                .catch(handleError);
        }),

        updateUserPassword: compose(...authResolvers)((parent, { input }, ctx: ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findByPk(authUser.id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new Error(`User with id ${authUser.id} not found!`);

                        return user.update(input, { transaction: t })
                            .then((user: UserInstance) => !!user);
                    });
            })
                .catch(handleError);
        }),

        deleteUser: compose(...authResolvers)((parent, { input }, ctx:ResolverContext, info: GraphQLResolveInfo) => {
            const db = ctx.db as DbConnection;
            const authUser = ctx.authUser as AuthUser;

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findByPk(authUser.id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new Error(`User with id ${authUser.id} not found!`);
                        return user
                            .destroy({ transaction: t })
                            .then(() => true)
                            .catch(() => false);
                    });
            })
                .catch(handleError);
        })
    }
};