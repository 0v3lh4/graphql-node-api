import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnection";
import { UserInstance } from "../../../models/UserModel";
import { error } from "util";
import { Transaction } from "sequelize";

export const userResolvers = {
    Users: {
        posts: (parent, {limit = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    where: {author: parent.get('id')},
                    limit,
                    offset
                });
        },
    },

    Query: {
        users: (parent, {limit = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.User.findAll({
                limit,
                offset
            });
        },

        user: (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.User
                .findById(id)
                .then((user: UserInstance | null) => {
                    if (!user) throw new error(`User with id ${id} not found!`);
                    return user;
                });
        }
    },

    Mutation: {
        createUser: (parent, {input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(input, { transaction: t });
            });
        },

        updateUser: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new error(`User with id ${id} not found!`);
                        return user.update(id, input, { transaction: t });
                    });
            });
        },

        updateUserPassword: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new error(`User with id ${id} not found!`);

                        return user.update(id, input, { transaction: t })
                            .then((user: UserInstance) => !!user);
                    });
            });
        },

        deleteUser: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new error(`User with id ${id} not found!`);
                        user.destroy({ transaction: t });
                        return true;
                    });
            });
        }
    }
};