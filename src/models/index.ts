import fs from 'fs';
import Sequelize, { Models } from 'sequelize';
import path from 'path';
import { ENV } from '../constants/ENV';
import { DataBaseConfig } from '../config/DataBaseConfig';
import { BaseModel } from '../interfaces/BaseModel';
import { DbConnection } from '../interfaces/DbConnection';

const basename = path.basename(module.filename);
const env: string = process.env.NODE_ENV || ENV.NODE.DEVELOPMENT;
let config: DataBaseConfig = require(path.join(__dirname, '..', 'config', 'config.json'))[env];

let db: any = {};

const operatorsAliases = {
    $in: Sequelize.Op.in,
};

config = Object.assign({operatorsAliases}, config);

const sequelize: Sequelize.Sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

fs.readdirSync(__dirname)
    .filter((file: string) => {
        const fileSlice = file.slice(-3);
        return file.indexOf('.') !== 0 && file !== basename && (fileSlice === '.js' || fileSlice === '.ts');
    })
    .forEach((file: string) => {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName: string) => {
    const baseModel = (db[modelName] as BaseModel);
    if (baseModel.associates) {
        baseModel.associates(db);
    }
});

db.sequelize = sequelize;

export default <DbConnection>db;