import { Server } from "http";
import { AddressInfo } from "net";
import jwt from "jsonwebtoken";
import { ENV } from "../constants/ENV";

const bind = (addr: AddressInfo | string): string =>
    (typeof addr === 'string') ? `pipe: ${addr}` : `port: ${addr.port}`;

export const normalizePort = (val: number | string): number | string | boolean => {
    let port: number = (typeof val === 'string') ? parseInt(val) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}

export const onError = (server: Server) => {
    return (error: NodeJS.ErrnoException): void => {
        let addr = server.address();
        if (error.syscall !== 'listen') throw error;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind(addr)} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind(addr)} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

export const onListening = (server: Server) => {
    return ():void => {
        let addr = server.address();
        console.log(`Listening at ${bind(addr)} ...`);
    }
}

export const handleError = (error: Error) => {
    const errorMessage: string = `${error.name}:${error.message}`;
    if(process.env.NODE_ENV !== ENV.NODE.TESTING) { console.error(errorMessage); }
    return Promise.reject(new Error(errorMessage));
}

export const throwError = (condition: Boolean, message: string) => {
    if(condition) {
        throw new Error(message);
    }
}

export const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET as string;