const postTypes: string = `
    type Post {
        id: ID!
        title: String!
        content: String!
        photo: String!
        createdAt: String!
        updatedAt: String!
        author: User!
        comments(limit: Int, offset: Int): [ Comment! ]!
    }

    input PostCreateInput {
        title: String!
        content: String!
        photo: String!
    }
`;

const postQueries: string = `
    posts(limit: Int, offset: Int): [ Post! ]!
    post(id: ID!): Post
`;

const postMutations: string = `
    createPost(input: PostCreateInput!): Post
    updatePost(id: ID!, input: PostCreateInput!): Post
    deletePost(id: ID!): Boolean
`;

export {
    postTypes,
    postQueries,
    postMutations
};