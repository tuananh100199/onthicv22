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
    app.get('/api/drive-test/all', app.permission.check('studentCourse:read'), (req, res) => {
        const condition = req.query.condition;
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
    app.post('/api/drive-test/random', app.permission.check('studentCourse:read'), (req, res) => {
        req.session.user.driveTest = null;
        const _courseTypeId = req.body._courseTypeId,
            user = req.session.user,
            today = new Date().getTime();
        if (user.driveTest && today < user.driveTest.expireDay ) {
            res.send(user.driveTest)
        } else {
            app.model.courseType.get( _courseTypeId, (error, item) => {
                if(error || item == null) {
                    res.send({ error })
                } else {
                    if( item.questionTypes ) { 
                        const randomQuestions = item.questionTypes.map((type) => {
                            return new Promise((resolve, reject) => {
                                app.model.driveQuestion.getAll({categories: type.category},(error, list) => {
                                    if (error || list == null) {
                                        reject(error);
                                    } else {
                                        resolve(app.getRandom(list,type.amount));
                                    }
                                });
                            });
                        });
                        Promise.all(randomQuestions).then(questions => {
                            req.session.user.driveTest = {
                                    questions: questions.filter(item => item).flat(),
                                    expireDay: new Date().setHours(new Date().getHours() + 2),
                                }
                            res.send( req.session.user.driveTest )
                        }).catch(error => res.send({ error }));
                    }
                }
            });
        }
       
       
    });

    app.post('/api/drive-test/student/submit', app.permission.check('driveQuestion:read'), (req, res) => {
        const { _id, answers } = req.body;
        let score = 0,
            err = null;
        app.model.driveTest.get( _id, (error, test) => {
            if (error) {
                res.send({ error })
            } else {
                const questionMapper = {};
                test.questions && test.questions.forEach(item => questionMapper[item._id] = item);
                answers.map(answer => {
                    if (questionMapper[answer.questionId]) {
                        if (questionMapper[answer.questionId].trueAnswer == answer.answer) {
                            score = score + 1;
                        }
                    } else {
                        err = 'Không tìm thấy câu hỏi!';
                    }
                })
                res.send({ error: err, result: { score: score, total: answers.length } })
            }
        })
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
