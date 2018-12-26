import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { CommentModel } from "../models/CommentModel";
import Sequelize = require("sequelize");

export interface Models {
    Comment: CommentModel;
    User: UserModel;
    Post: PostModel;
}