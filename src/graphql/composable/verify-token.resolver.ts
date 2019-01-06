import { ComposableResolver } from "./composable.resolver";
import { ResolverContext } from "../../interfaces/ResolverContext";
import { GraphQLFieldResolver } from "graphql";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../utils/utils";

export const verifyTokenResolver: ComposableResolver<any, ResolverContext> =
    (resolver: GraphQLFieldResolver<any, ResolverContext>): GraphQLFieldResolver<any, ResolverContext> => {
        return (parent, args, context: ResolverContext, info) => {
            const token = context.authorization ? context.authorization.split(' ')[1] : undefined;

            return jwt.verify(token as string, JWT_SECRET as string, (err, decoded: any) => {
                if (!err) {
                    return resolver(parent, args, context, info);
                }

                throw new Error(`${err.name}: ${err.message}`);
            });
        };
    };