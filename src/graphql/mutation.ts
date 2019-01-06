import { userMutations } from "./resources/user/user.schema";
import { postMutations } from "./resources/post/post.schema";
import { commentMutations } from "./resources/comment/comment.schema";
import { tokenMutations } from "./resources/token/token.schema";

const Mutation: string = `
    type Mutation {
        ${tokenMutations}
        ${postMutations}
        ${userMutations}
        ${commentMutations}
    }
`;

export {
    Mutation
};