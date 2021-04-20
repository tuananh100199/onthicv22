module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4006: { title: 'Bộ đề thi', link: '/user/drive-test' },
        },
    };
    app.permission.add({ name: 'driveTest:read', menu }, { name: 'driveTest:write' }, { name: 'driveTest:delete' });

    app.get('/user/drive-test', app.permission.check('driveTest:read'), app.templates.admin);
    app.get('/user/drive-test/:_id', app.permission.check('driveTest:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/drive-test/all', app.permission.check('driveTest:read'), (req, res) => {
        const condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.driveTest.getAll(condition, (error, list) => {
            res.send({ error, list })
        });
    });

    app.get('/api/drive-test/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { searchText, categories } = req.query,
            pageCondition = {};
        if (categories) {
            pageCondition.categories = [categories];
        }
        if (searchText) {
            pageCondition.title = new RegExp(searchText, 'i');
        }
        app.model.driveTest.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/drive-test', app.permission.check('driveTest:read'), (req, res) => {
        app.model.driveTest.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/drive-test', app.permission.check('driveTest:write'), (req, res) => {
        app.model.driveTest.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/drive-test', app.permission.check('driveTest:write'), (req, res) => {
        app.model.driveTest.update(req.body._id, Object.assign(req.body.changes, req.body.changes.questions && { questions: req.body.changes && req.body.changes.questions && req.body.changes.questions == 'empty' ? [] : req.body.changes.questions }), (error, item) => res.send({ error, item }));
    });

    app.put('/api/drive-test/swap', app.permission.check('driveTest:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.driveTest.swapPriority(req.body._id, isMoveUp, (error) => res.send({ error }));
    });

    app.delete('/api/drive-test', app.permission.check('driveTest:delete'), (req, res) => {
        app.model.driveTest.delete(req.body._id, error => res.send({ error }));
    });

    //Random Drive Test API ----------------------------------------------------------------------------------------------
    app.post('/api/drive-test/random', app.permission.check('driveTest:write'), (req, res) => {
        const user = req.session.user,
            today = new Date();
        if (user.driveTest && today < user.driveTest.expireDay ) {
            res.send(req.session.user.driveTest)
            // req.session.user.driveTest = {
            //     questions: [],
            //     expireDay: new Date(new Date().setHours(new Date().getHours() + 2))
            // }
        } else {
            app.model.category.getAll({type: 'drive-question'}, (error, items) => {
                if(error || items.length == 0) {
                    res.send({ error: error || 'Get drive-question categories failed!' });
                } else {
                    //items: tất cả danh mục
                    //list: tất cả câu hỏi theo 1 loại danh mục
                    const arrayRandom = items.map((category, index) => {
                        return new Promise((resolve, reject) => {
                            app.model.driveQuestion.getAll({categories: category._id},(error, list) => {
                                if (error || list == null) {
                                    reject(error);
                                } else {
                                    if (index == 0) {
                                        resolve(app.getRandom(list,1));
                                    } else if (index == 1) {
                                        resolve(app.getRandom(list,2));
                                    } else if (index == 2) {
                                        resolve(app.getRandom(list,1));
                                    } else if (index == 3) {
                                        resolve(app.getRandom(list,3));
                                    } else if (index == 4) {
                                        resolve(app.getRandom(list,2));
                                    } else if (index == 5) {
                                        resolve(app.getRandom(list,10));
                                    } else {
                                        resolve(app.getRandom(list,1));
                                    }
                                }
                            });
                        });
                    });
                    Promise.all(arrayRandom).then(final => {
                        req.session.user.driveTest = {
                                questions: final.filter(item => item).flat(),
                                expireDay: new Date(new Date().setHours(new Date().getHours() + 2))
                            }
                        res.send( req.session.user.driveTest )
                    }).catch(error => res.send({ error }));
                }
            });
        }
    
    });

    // Question APIs -----------------------------------------------------------------------------------------------------
    app.post('/api/drive-test/question', app.permission.check('driveTest:write'), (req, res) => {
        const { _driveTestId, _questionId } = req.body;
        app.model.driveQuestion.get(_questionId, (error, question) => {
            if (error || question == null) {
                res.send({ error: error || 'Invalid Id!' });
            } else {
                app.model.driveTest.addQuestion(_driveTestId, question, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/drive-test/question/swap', app.permission.check('driveTest:write'), (req, res) => {
        const { _driveTestId, _questionId, isMoveUp } = req.body;
        app.model.driveTest.get(_driveTestId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.questions.length; index < item.questions.length; index++) {
                    const questionTest = item.questions[index];
                    if (questionTest._id == _questionId) {
                        const newIndex = index + (isMoveUp == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.questions.splice(index, 1);
                            item.questions.splice(newIndex, 0, questionTest);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ item });
            }
        });
    });

    app.delete('/api/drive-test/question', app.permission.check('driveTest:write'), (req, res) => {
        const { _driveTestId, _questionId } = req.body;
        app.model.driveTest.deleteQuestion(_driveTestId, _questionId, (error, item) => res.send({ error, item }));
    });
};
