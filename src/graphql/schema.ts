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
import { tokenTypes } from './resources/token/token.schema';
import { tokenResolvers } from './resources/token/token.resolvers';

const SchemaDefinition:string = `
    type Schema {
        query: Query
        mutation: Mutation
    }
`;

const resolvers: any = merge(
    userResolvers,
    tokenResolvers,
    postResolvers,
    commentResolvers
);

export default makeExecutableSchema({
    typeDefs: [
        SchemaDefinition,
        Query,
        Mutation,
        tokenTypes,
        userTypes,
        postTypes,
        commentTypes
    ],
    resolvers
});