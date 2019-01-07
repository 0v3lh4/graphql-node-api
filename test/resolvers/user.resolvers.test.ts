import { db, app, expect, chai, handlerError } from './../test-utils';
import { UserInstance } from '../../src/models/UserModel';

describe('User', () => {

    let userId: number;

    beforeEach(() => {
        return db.Comment.destroy({ where: {} })
            .then((row: number) => db.Post.destroy({ where: {} }))
            .then((row: number) => db.User.destroy({ where: {} }))
            .then((row: number) => db.User.bulkCreate([
                {
                    name: 'Peter Quill',
                    email: 'peter@guardians.com',
                    password: '12345678'
                },
                {
                    name: 'Gamora',
                    email: 'gamora@guardians.com',
                    password: '12345678'
                },
                {
                    name: 'Groot',
                    email: 'groot@guardians.com',
                    password: '12345678'
                },
            ]))
            .then((users: UserInstance[]) => {
                userId = users[0].get('id');
            });
    });

    describe('Queries', () => {
        describe('application/json', () => {
            describe('users', () => {
                it('should return a list of Users', () => {
                    const body = {
                        query: `
                            query {
                                users {
                                    name
                                    email
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const userList = res.body.data.users;
                            expect(res.body.data).to.be.an('object');
                            expect(userList).to.be.an('array').of.length(3);
                            expect(userList[0]).to.not.have.keys('id', 'photo', 'createAt', 'updateAt', 'posts');
                            expect(userList[0]).to.have.keys('name', 'email');
                        });
                });

                it('should return a paginate list of Users', () => {
                    const body = {
                        query: `
                            query getUsers($limit: Int, $offset: Int) {
                                users(limit: $limit, offset: $offset) {
                                    name
                                    email
                                    createdAt
                                }
                            }
                        `,
                        variables: {
                            limit: 2,
                            offset: 1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const userList = res.body.data.users;
                            expect(res.body.data).to.be.an('object');
                            expect(userList).to.be.an('array').of.length(2);
                            expect(userList[0]).to.not.have.keys('id', 'photo', 'updatedAt', 'posts');
                            expect(userList[0]).to.have.keys('name', 'email', 'createdAt');
                        })
                        .catch(handlerError);
                });
            })

            describe('User', () => {
                it('should return a single user', () => {
                    const body = {
                        query: `
                            query singleUser($id: ID!) {
                                user(id: $id) {
                                    id
                                    name
                                    email
                                    posts {
                                        title
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.keys('id', 'name', 'email', 'posts');
                            expect(singleUser.name).to.equal('Peter Quill');
                            expect(singleUser.email).to.equal('peter@guardians.com');
                        })
                        .catch(handlerError);
                });

                it('should return only "name" attribute', () => {
                    const body = {
                        query: `
                            query singleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.key('name')
                            expect(singleUser.name).to.equal('Peter Quill');
                            expect(singleUser.email).to.undefined;
                        })
                        .catch(handlerError);
                });

                it('should return an error if User not exists', () => {
                    const body = {
                        query: `
                            query singleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: -1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.user).to.be.null;
                            expect(res.body.errors).to.be.an('array');
                            expect(res.body).to.have.keys('data', 'errors');
                            expect(res.body.errors[0].message).to.equal('Error:User with id -1 not found!');
                        })
                        .catch(handlerError);
                });
            })
        })
    })
})