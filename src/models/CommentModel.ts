import Sequelize from 'sequelize';
import { BaseModel } from '../interfaces/BaseModel';
import { Models } from '../interfaces/Models';

export interface CommentAttributes {
   id?: number;
   comment?: string;
   post?: number;
   user?: number;
   createdAt?: string;
   updatedAt?: string;
}

export interface CommentInstance extends Sequelize.Instance<CommentAttributes> {}

export interface CommentModel extends BaseModel, Sequelize.Model<CommentInstance, CommentAttributes> {}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): CommentModel => {
    const Comment: CommentModel =
        sequelize.define<CommentInstance, CommentAttributes>('Comment', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        }, {
            tableName: 'comments'
        });

    Comment.associates = (models: Models): void => {
        Comment.belongsTo(models.Post, {
            foreignKey: {
                allowNull: false,
                field: 'post',
                name: 'post'
            }
        });

        Comment.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                field: 'user',
                name: 'user'
            }
        });
    }

    return Comment;
}