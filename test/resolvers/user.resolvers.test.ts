import { db, app, expect, chai } from './../test-utils';

describe('User', () => {

    beforeEach(() => {
        return db.Comment.destroy({ where: {} })
            .then((row: number) => db.Post.destroy({ where: {} }))
            .then((row: number) => db.User.destroy({ where: {} }))
            .then((row: number) => db.User.create({
                name: 'Peter Quill',
                email: 'peter@guardians.com',
                password: '12345678'
            }));
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
                            expect(userList).to.be.an('array').of.length(1);
                            expect(userList[0]).to.not.have.keys('id', 'photo', 'createAt', 'updateAt', 'posts');
                            expect(userList[0]).to.have.keys('name', 'email');
                        });
                })
            })
        })
    })
})