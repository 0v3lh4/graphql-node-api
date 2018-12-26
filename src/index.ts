import http from 'http';
import app from './app';
import { normalizePort, onListening, onError } from './utils/utils';
import db from './models';
import { ENV } from './constants/ENV';

const server = http.createServer(app);
const port = normalizePort(process.env.port || 3000);

const runServer = () => {
    server.listen(port);
    server.on('error', onError(server));
    server.on('listening', onListening(server));
}

if (process.env.NODE_ENV === ENV.NODE.DEVELOPMENT) {
    db.sequelize.sync().then(() => {
        runServer();
    });
}
