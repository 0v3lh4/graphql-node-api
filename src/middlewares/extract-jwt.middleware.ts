import { RequestHandler, Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../utils/utils";
import db from "./../models"
import { UserInstance } from "../models/UserModel";

export const extractJwtMiddleware = (): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authorization: string | undefined = req.get('authorization');
        const token: string | undefined = authorization ? authorization.split(' ')[1] : undefined;

        req['context'] = {};
        req['context']['authorization'] = authorization;

        if(!token) return next();

        jwt.verify(token, JWT_SECRET as string, (err, decoded: any) => {
            if(err) { return next(); }

            db.User
                .findByPk(decoded.sub, {
                    attributes: ['id', 'email']
                })
                .then((user: UserInstance | null) => {
                    if(user) {
                        req['context']['authUser'] = {
                            id: user.get('id'),
                            email: user.get('email')
                        };
                    }

                    return next();
                });
        });
    }
};