import chai from "chai";
import chaiHttp from "chai-http";

import app from "./../src/app";
import db from "./../src/models";

chai.use(chaiHttp);
const expect = chai.expect;

const handlerError = error => {
    const message: string = (error.response) ? error.response.res.text : error.message || error;
    return Promise.reject(`${error.name}: ${message}`);
};

export {
    app,
    db,
    chai,
    expect,
    handlerError
};
