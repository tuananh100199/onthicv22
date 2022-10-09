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

    app.permission.add({ name: 'driverTest:view', menu: driveTest }, { name: 'driveTestUser:read' }, { name: 'driveTest:write', menu }, { name: 'driveTest:delete' }, { name: 'driveTest:read' });

    app.get('/user/drive-test', app.permission.check('driveTest:read'), app.templates.admin);
    app.get('/user/drive-test/:_id', app.permission.check('driveTest:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien', app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien/:_id', app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-thu', app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/bo-de-thi-thu/:_id', app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------
    app.get('/api/drive-test/all', (req, res) => {//mobile
        const condition = req.query.condition;
        app.model.driveTest.getAll(condition, (error, list) => res.send({ error, list }));
    });

    app.get('/api/drive-test/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            { searchText, courseType } = req.query,
            pageCondition = {};
        courseType && (pageCondition.courseType = courseType);
        searchText && (pageCondition.title = new RegExp(searchText, 'i'));
        app.model.driveTest.getPage(pageNumber, pageSize, pageCondition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/drive-test', (req, res) => {//mobile
        app.model.driveTest.get(req.query._id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/drive-test/student', (req, res) => {
        app.model.driveTest.get(req.query._id, (error, item) => {
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
    app.post('/api/drive-test/random', (req, res) => {//mobile
        req.session.driveTest = null;
        const _courseTypeId = req.body._courseTypeId,
            driveTest = req.session.driveTest,
            today = new Date().getTime();
        if (driveTest && today < driveTest.expireDay) {
            res.send({ driveTest });
        } else {
            app.getRandom = (arr, n) => {
                if (n < 1) {
                    return null;
                }
                let result = new Array(n),
                    len = arr.length,
                    taken = new Array(len);
                if (n > len) {
                    return null;
                }
                while (n--) {
                    let x = Math.floor(Math.random() * len);
                    result[n] = arr[x in taken ? taken[x] : x];
                    taken[x] = --len in taken ? taken[len] : len;
                }
                return result;
            };

            app.model.courseType.get(_courseTypeId, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Lấy loại khóa học bị lỗi!' });
                } else {
                    if (item.questionTypes) {
                        app.model.driveQuestion.getAll((error, list) => {
                            if (error || list.length == 0) {
                                res.send({ error: 'Lấy câu hỏi thi bị lỗi!' });
                            } else {
                                const questionMapper = {};
                                list.forEach(question => {
                                    questionMapper[question.categories[0]] ?
                                        questionMapper[question.categories[0]].push(question) :
                                        (questionMapper[question.categories[0]] = [question]);
                                });

                                const randomQuestions = [];
                                console.log(' item.questionTypes',  item.questionTypes);
                                item.questionTypes.forEach(type => {
                                    randomQuestions.push(app.getRandom(questionMapper[type.category], type.amount));
                                });
                                const driveTest = {
                                    questions: randomQuestions.filter(item => item != null).flat(),
                                    expireDay: new Date().setHours(new Date().getHours() + 2),
                                    totalTime: item.totalTime
                                };
                                req.session.driveTest = driveTest;
                                res.send({ driveTest, courseType: item });
                            }
                        });
                    } else {
                        res.send({ error: 'Lấy loại câu hỏi thi bị lỗi!' });
                    }
                }
            });
        }
    });


    app.post('/api/drive-test/student/submit', (req, res) => {//mobile
        const { _id, answers } = req.body;
        let score = 0,
            importanceScore = null;

        app.model.driveTest.get(_id, (error, test) => {
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
                            } else {
                                if (questionMapper[key]._id == key) {
                                    importanceScore = key;
                                }
                            }
                        } else {
                            error = 'Không tìm thấy câu hỏi!';
                        }
                    }
                }
                app.model.courseType.get(test.courseType, (error, item) => {
                    if (error || !item) {
                        error = 'Không tìm thấy loại khóa học của bộ đề!';
                    }
                    res.send({ error, result: { score, trueAnswer, answers, importanceScore, pass: score < Number(item.soLuongCauDat) ? false : true } });
                });
            }
        });
    });

    app.post('/api/drive-test/random/submit', (req, res) => {//mobile
        const { answers, courseType } = req.body,
            randomTest = req.session.driveTest;
        let score = 0,
            err = null,
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
                    } else {
                        if (questionMapper[key]._id == key) {
                            importanceScore = key;
                        }
                    }
                } else {
                    err = 'Không tìm thấy câu hỏi!';
                }
            }
        }
        app.model.courseType.get(courseType, (error, item) => {
            if (error || !item) {
                err = 'Không tìm thấy loại khóa học của bộ đề!';
            }
            res.send({ error: err, result: { score, trueAnswer, answers, importanceScore, pass: score < Number(item.soLuongCauDat) ? false : true } });
        });
    });

    // Question APIs -----------------------------------------------------------------------------------------------------
    app.post('/api/drive-test/question', app.permission.check('driveTest:write'), (req, res) => {
        const { driveTestId, questionId } = req.body;
        app.model.driveQuestion.get(questionId, (error, question) => {
            if (error || question == null) {
                res.send({ error: error || 'Invalid Id!' });
            } else {
                app.model.driveTest.addQuestion(driveTestId, question, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/drive-test/question/swap', app.permission.check('driveTest:write'), (req, res) => {
        const { driveTestId, questionId, isMoveUp } = req.body;
        app.model.driveTest.get(driveTestId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.questions.length; index < item.questions.length; index++) {
                    const questionTest = item.questions[index];
                    if (questionTest._id == questionId) {
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
        const { driveTestId, questionId } = req.body;
        app.model.driveTest.deleteQuestion(driveTestId, questionId, (error, item) => res.send({ error, item }));
    });
};
