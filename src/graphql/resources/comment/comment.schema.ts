const commentTypes: string = `
    type Comment {
        id: ID!
        comment: String!
        createdAt: String!
        updatedAt: String!
        user: User!
        post: Post!
    }

    input CommentCreateInput {
        comment: String!
        post: Int!
        user: Int!
    }
`;

const commentQueries: string = `
    commentsByPost(post: ID!, limit: Int, offset: Int): [ Comment! ]!
`;

const commentMutations: string = `
    createComment(input: CommentCreateInput!): Comment
    updateComment(id: ID!, input: CommentCreateInput!): Comment
    deleteComment(id: ID!): Boolean
`;

export {
    commentTypes,
    commentQueries,
    commentMutations
};