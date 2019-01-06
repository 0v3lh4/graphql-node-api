import { AuthUser } from "./AuthUser";
import { DbConnection } from "./DbConnection";
import { DataLoaders } from "./DataLoaders";
import { RequestedFields } from "../graphql/ast/RequestedFields";

export interface ResolverContext {
    db?: DbConnection;
    authorization?: string;
    authUser?: AuthUser;
    dataLoaders?: DataLoaders;
    requestedFields?: RequestedFields;
}