module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4006: { title: 'Bộ đề thi', link: '/user/drive-test' },
        },
    };

    const driveTest = {
        parentMenu: app.parentMenu.driveTest,
        menus: {
            6010: { title: 'Bộ đề thi ngẫu nhiên', link: '/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien' },
            6020: { title: 'Bộ đề thi thử', link: '/user/hoc-vien/khoa-hoc/bo-de-thi-thu' },
        },
    };

    app.permission.add({ name: 'driveTest:read', menu: driveTest }, { name: 'driveTest:write', menu }, { name: 'driveTest:delete' });

    app.get('/user/drive-test', app.permission.check('driveTest:read'), app.templates.admin);
    app.get('/user/drive-test/:_id', app.permission.check('driveTest:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien', app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien/:_id', app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-thu', app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-thu/:_id', app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-thu/chi-tiet/:_id', app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/drive-test/all', (req, res) => {
        const condition = req.query.condition;
        app.model.driveTest.getAll(condition, (error, list) => {
            res.send({ error, list });
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

    app.get('/api/drive-test', (req, res) => {
        app.model.driveTest.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/drive-test/student', (req, res) => {
        app.model.driveTest.get(req.query._id, (error, item) => {
            if (item && item.questions) {
                item.questions.forEach(question => question.trueAnswer = null);
            }
            res.send({ error, item });
        });
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
    app.post('/api/drive-test/random', (req, res) => {
        req.session.driveTest = null;
        const _courseTypeId = req.body._courseTypeId,
            driveTest = req.session.driveTest,
            today = new Date().getTime();
        if (driveTest && today < driveTest.expireDay) {
            res.send({ driveTest });
        } else {
            app.model.courseType.get(_courseTypeId, (error, item) => {
                if (error || item == null) {
                    res.send({ error });
                } else {
                    if (item.questionTypes) {
                        const randomQuestions = item.questionTypes.map(type => {
                            return new Promise((resolve, reject) => {
                                const condition = {};
                                condition.categories = [type.category];
                                app.model.driveQuestion.getAll(condition, (error, list) => {
                                    if (error || list.length == 0) {
                                        reject(error);
                                    } else {
                                        resolve(app.getRandom(list, type.amount));
                                    }
                                });
                            });
                        });
                        Promise.all(randomQuestions).then(questions => {
                            const driveTest = {
                                questions: questions.flat(),
                                expireDay: new Date().setHours(new Date().getHours() + 2),
                            };
                            req.session.driveTest = driveTest;
                            res.send({ driveTest });
                        }).catch(error => res.send({ error }));
                    }
                }
            });
        }
    });
    app.post('/api/drive-test/student/submit', (req, res) => {
        const { answers } = req.body,
            _driveTestId = req.body._id;
        let score = 0,
            importanceScore = null;

        app.model.driveTest.get(_driveTestId, (error, test) => {
            if (error) {
                res.send({ error });
            } else {
                const questionMapper = {},
                    trueAnswer = {};
                test.questions && test.questions.forEach(item => {
                    questionMapper[item._id] = item;
                    trueAnswer[item._id] = item.trueAnswer;
                });
                if (answers) {
                    for (const [key, value] of Object.entries(answers)) {
                        if (questionMapper[key]) {
                            if (questionMapper[key].trueAnswer == value) {
                                score = score + 1;
                            }
                            else {
                                if (questionMapper[key]._id == key) {
                                    importanceScore = key;
                                }
                            }
                        } else {
                            error = 'Không tìm thấy câu hỏi!';
                        }
                    }
                }
                res.send({ error, result: { score, trueAnswer, answers, importanceScore } });
            }
        });
    });
    app.post('/api/drive-test/random/submit', (req, res) => {
        const { answers } = req.body,
            randomTest = req.session.driveTest;
        let score = 0,
            error = null,
            importanceScore = null;

        const questionMapper = {},
            trueAnswer = {};
        randomTest.questions && randomTest.questions.forEach(item => {
            questionMapper[item._id] = item;
            trueAnswer[item._id] = item.trueAnswer;
        });
        if (answers) {
            for (const [key, value] of Object.entries(answers)) {
                if (questionMapper[key]) {
                    if (questionMapper[key].trueAnswer == value) {
                        score = score + 1;
                    }
                    else {
                        if (questionMapper[key]._id == key) {
                            importanceScore = key;
                        }
                    }
                } else {
                    error = 'Không tìm thấy câu hỏi!';
                }
            }
        }
        res.send({ error, result: { score, trueAnswer, answers, importanceScore } });

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
