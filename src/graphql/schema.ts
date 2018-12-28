import { makeExecutableSchema } from 'graphql-tools'
import { Query } from './query';
import { Mutation } from './mutation';
import { userTypes } from './resources/user/user.schema';
import { postTypes } from './resources/post/post.schema';
import { commentTypes } from './resources/comment/comment.schema';
import { merge } from 'lodash';
import { commentResolvers } from './resources/comment/comment.resolvers';
import { userResolvers } from './resources/user/user.resolvers';
import { postResolvers } from './resources/post/post.resolvers';

const SchemaDefinition:string = `
    type Schema {
        query: Query
        mutation: Mutation
    }
`;

const resolvers: any = merge(
    userResolvers,
    postResolvers,
    commentResolvers
);

export default makeExecutableSchema({
    typeDefs: [
        SchemaDefinition,
        Query,
        Mutation,
        userTypes,
        postTypes,
        commentTypes
    ],
    resolvers
});