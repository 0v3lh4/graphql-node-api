import Sequelize from "sequelize";
import { Models } from "./Models";

export interface DbConnection extends Models {
    sequelize: Sequelize.Sequelize;
}