module.exports = app => {
    app.get('/api/answer/page/:formId/:pageNumber/:pageSize', app.permission.check('form:read'), (req, res) => {
        const formId = req.params.formId, pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
        app.model.answer.getPage(pageNumber, pageSize, { formId }, (error, page) => res.send({ error, page }));
    });

    app.get('/api/answer/count/:formId', (req, res) => {
        app.model.answer.count({ formId: req.params.formId }, (error, total) => {
            res.send({error, total});
        })
    });

    app.get('/api/answer/item/:answerId', app.permission.check('form:read'), (req, res) =>
        app.model.answer.get(req.params.answerId, (error, item) => res.send({ error, item })));

    app.post('/api/answer', app.permission.check('form:write'), (req, res) => {
        const body = req.body.newData;
        app.model.answer.get({ user: body.user, formId: body.formId }, (error, answer) => {
           if (error) {
               res.send({error});
           } else if (answer) {
               res.send({ exist: true });
           } else {
               app.model.answer.create(body, (error, item) => res.send({ error, item }));
           }
        });
    });

    app.post('/api/answer/import', app.permission.check('form:write'), (req, res) => {
        const participants = req.session.participants ? req.session.participants : [], { formId, questions } = req.body;
        const createAnswer = (participants, index = 0) => {
            if (index === participants.length) {
                delete req.session.participants;
                res.send({ error: null, success: true });
            } else {
                app.model.user.create(participants[index], (error, user) => {
                    if (user == null) {
                        res.send({error: 'Đã xảy ra lỗi', success: false});
                    } else {
                        const answerData = { user: user._id, formId, attendance: false,
                            record: (questions ? questions : []).map(question => ({
                                    questionId: question._id,
                                    answer: (question.typeName === 'choice' || question.typeName === 'multiChoice') ? question.typeValue[0] : (question.typeName === 'date' ? app.date.viDateFormat(new Date()) : question.defaultAnswer)
                                })
                            )
                        };
                        app.model.answer.get({ user: answerData.user, formId: answerData.formId }, (error, answer) => {
                            if (error) {
                                res.send({ error });
                            } else if (answer) {
                                createAnswer(participants, index + 1);
                            } else {
                                app.model.answer.create(answerData, (error, item) => {
                                    if (error || !item) {
                                        res.send({ error: 'Đã xảy ra lỗi', success: false });
                                    } else {
                                        createAnswer(participants, index + 1);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        };
        createAnswer(participants);
    });

    app.get('/api/answer/export/:formId', app.permission.check('form:write'), (req, res) => {
        const { formId } = req.params;
        app.model.form.get(formId, { select: '_id questions', populate: true }, (error, form) => {
            if (!error && form) {
                app.model.answer.getAll({ formId }, (error, items) => {
                    if (error) {
                        res.send({error});
                    } else {
                        const workbook = app.excel.create(),
                            registrationQuestions = form.questions,
                            worksheet = workbook.addWorksheet('RegistrationResult');
                        let cells = [
                            {cell: 'A1', value: '#', bold: true, border: '1234'},
                            {cell: 'B1', value: 'Thời gian đăng ký', bold: true, border: '1234'},
                            {cell: 'C1', value: 'Họ và tên lót', bold: true, border: '1234'},
                            {cell: 'D1', value: 'Tên', bold: true, border: '1234'},
                            {cell: 'E1', value: 'Có mặt', bold: true, border: '1234'},
                        ];

                        worksheet.columns = [
                            {header: '#', key: 'number', width: 5},
                            {header: 'Thời gian đăng ký', key: 'text', width: 20},
                            {header: 'Họ và tên lót', key: 'text', width: 30},
                            {header: 'Tên', key: 'text', width: 10},
                            {header: 'Có mặt', key: 'text', width: 15},
                        ];

                        registrationQuestions.forEach((question, index) => {
                            cells.push({cell: app.excel.numberToExcelColumn(index + 6) + '1', value: question.title, bold: true, border: '1234'});
                        });

                        for (let index = 0; index <= items.length; index++) {
                            if (index == items.length) {
                                app.excel.write(worksheet, cells);
                                app.excel.attachment(workbook, res);
                            } else {
                                const user = items[index].user;
                                cells.push({ cell: 'A' + (index + 2), border: '1234', number: (index + 1) });
                                cells.push({ cell: 'B' + (index + 2), border: '1234',
                                    value: app.date.viDateFormat(items[index].answeredDate) + ' ' + app.date.viTimeFormat(items[index].answeredDate)
                                });
                                if (user && user != {}) {
                                    cells.push({ cell: 'C' + (index + 2), border: '1234', value: user.lastname });
                                    cells.push({ cell: 'D' + (index + 2), border: '1234', value: user.firstname });
                                }

                                cells.push({ cell: 'E' + (index + 2), border: '1234', value: items[index].attendance ? 'x' : '' });
                                let answerValue = {};
                                items[index].record.forEach((record) => {
                                    answerValue[record.questionId] = record.answer;
                                });
                                for (let index2 = 0; index2 <= registrationQuestions.length; index2++) {
                                    if (index2 === registrationQuestions.length) {
                                        break;
                                    } else {
                                        cells.push({cell: app.excel.numberToExcelColumn(index2 + 6) + (index + 2), border: '1234', value: answerValue[registrationQuestions[index2]._id]});
                                    }
                                }
                            }
                        }
                    }
                });
            } else {
                res.send({error});
            }
        });
    });

    app.put('/api/answer', app.permission.check('form:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.record && changes.record == 'empty') changes.record = [];
        app.model.answer.update(req.body._id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/answer', app.permission.check('form:write'), (req, res) =>
        app.model.answer.delete(req.body._id, (error) => res.send({ error })));

    // User ============================================================================================================
    app.post('/answer', (req, res) => {
        const { newData } = req.body;
        app.model.form.get(newData.formId, (error, item) => {
            if (error || !item) {
                res.send({error: 'Invalid form id!'});
            } else {
                const maxRegisterUsers = item.maxRegisterUsers ? item.maxRegisterUsers : -1;
                app.model.answer.count({ formId: newData.formId }, (error1, total) => {
                    if (error1) {
                        res.send({ error: 'Count registration has error!' });
                    } else if (maxRegisterUsers != -1 && total >= maxRegisterUsers) {
                        res.send({ error: 'Enough number of participants!' });
                    } else {
                        if (req.session.user) {
                            const user = req.session.user;
                            app.model.answer.get({ user: user._id, formId: newData.formId }, (error, answer) => {
                                if (error) {
                                    res.send({ error });
                                } else if (answer) {
                                    res.send({ exist: true, item: answer });
                                } else {
                                    app.model.answer.create(newData, (error, item) => res.send({ error, item }));
                                }
                            });
                        } else {
                            if (newData.userEmail) {
                                app.model.answer.get({ userEmail: newData.userEmail }, (error, answer) => {
                                    if (error) {
                                        res.send({ error });
                                    } else if (answer) {
                                        res.send({ exist: true, item: answer });
                                    } else {
                                        app.model.answer.create(newData, (error, item) => res.send({ error, item }));
                                    }
                                })
                            } else {
                                res.send({ error: 'Invalid email' })
                            }
                        }
                    }
                });
            }
        });
    });
    
    app.put('/answer', app.permission.check(), (req, res) => {
        const { _id, changes } = req.body;
        const user = req.session.user;
        app.model.answer.get({ _id, user: user._id }, (error, answer) => {
            if (error) {
                res.send({ error });
            } else if (!answer) {
                res.send({ error: 'Invalid answer id!' });
            } else {
                app.model.answer.update(_id, changes, (error, item) => res.send({ error, item }));
            }
        });
    });
    
    app.get('/api/user-answer/:formId', (req, res) => {
        if (req.session.user && req.session.user._id) {
            const userId = req.session.user._id;
            app.model.answer.get({ user: userId, formId: req.params.formId }, (error, answer) => {
                res.send({ error, answer });
            });
        } else {
            res.send({ error: null, answer: null })
        }
    });

    app.delete('/api/answer/clear-participants-session', app.permission.check(), (req, res) => {
        req.session.participants && delete req.session.participants;
        res.send({});
    });

    // Hook upload files ---------------------------------------------------------------------------------------------------------------------------s
    const importRegistration = (req, srcPath, sendResponse) => {
        const workbook = app.excel.create();
        workbook.xlsx.readFile(srcPath).then(() => {
            app.deleteFile(srcPath);
            const worksheet = workbook.getWorksheet(1);
            let index = 1, participants = [];
            while (true) {
                index++;
                let organizationId = worksheet.getCell('A' + index).value;
                if (organizationId) {
                    organizationId = organizationId.toString().trim();
                    const lastname = worksheet.getCell('B' + index).value.toString().trim();
                    const firstname = worksheet.getCell('C' + index).value.toString().trim();
                    const email = worksheet.getCell('D' + index).value.toString().trim();
                    participants.push({ lastname, firstname, email, organizationId, active: true });
                } else {
                    req.session.participants = participants;
                    sendResponse({ number: participants.length });
                    break;
                }
            }
        });
    };
    const registrationImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'registrationImportData' && files.RegistrationImportData && files.RegistrationImportData.length > 0) {
            console.log('Hook: registrationImportData');
            importRegistration(req, files.RegistrationImportData[0].path, done);
        }
    };
    app.uploadHooks.add('registrationImportData', (req, fields, files, params, done) => registrationImportData(req, fields, files, params, done));
};
