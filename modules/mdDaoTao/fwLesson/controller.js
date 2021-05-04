module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.trainning,
        menus: {
            4030: { title: 'Bài học', link: '/user/dao-tao/bai-hoc' },
        },
    };
    app.permission.add({ name: 'lesson:read' }, { name: 'lesson:write', menu }, { name: 'lesson:delete' });

    app.get('/user/dao-tao/bai-hoc', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/dao-tao/bai-hoc/:_id', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/:_id', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/thong-tin/:_id', app.permission.check('lesson:read'), app.templates.admin);
    app.get('/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/cau-hoi/:_id', app.permission.check('lesson:read'), app.templates.admin);

    // Lesson APIs ----------------------------------------------------------------------------------------------------
    app.get('/api/lesson/page/:pageNumber/:pageSize', app.permission.check('lesson:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = {},
            searchText = req.query.searchText;
        if (searchText) {
            condition.title = new RegExp(searchText, 'i');
        }
        app.model.lesson.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error: error || page == null ? 'Danh sách bài học không sẵn sàng!' : null });
        });
    });

    app.get('/api/lesson', app.permission.check('lesson:read'), (req, res) => {
        const { _id } = req.query;
        app.model.lesson.get(_id, (error, item) => res.send({ error, item }));
    });

    app.get('/api/lesson/student', app.permission.check('lesson:read'), (req, res) => {
        const { _id } = req.query;
        const currentCourse = req.session.user.currentCourse,
            currentSubject = req.session.user.currentSubject;
        app.model.lesson.get(_id, (error, item) => {
            if (item && item.questions) {
                item.questions.forEach(question => question.trueAnswer = null);
            }
            res.send({ error, item, currentCourse, currentSubject });
        });
    });

    app.post('/api/question/student/submit', app.permission.check('lesson:read'), (req, res) => {
        const { lessonId, answers } = req.body;
        let questionIds = answers ? Object.keys(answers) : [],
            score = 0;
        app.model.question.getAll({ _id: { $in: questionIds } }, (error, questions) => {
            if (error) {
                res.send({ error });
            } else {
                const questionMapper = {},
                    trueAnswer = {},
                    subjectId = req.session.user.currentSubject,
                    courseId = req.session.user.currentCourse;
                questions.forEach(item => {
                    questionMapper[item._id] = item;
                    trueAnswer[item._id] = item.trueAnswer;
                });
                if (answers) {
                    for (const [key, value] of Object.entries(answers)) {
                        if (questionMapper[key]) {
                            if (questionMapper[key].trueAnswer == value) {
                                score = score + 1;
                            }
                        } else {
                            error = 'Không tìm thấy câu hỏi!';
                        }
                    }
                }
                app.model.student.getAll({ user: req.session.user._id, course: courseId }, (error, students) => {
                    if (error || !students.length) {
                        res.send({ error });
                    } else {
                        app.model.student.addStudiedLesson(students[0]._id, subjectId, lessonId, trueAnswer, answers, (error, item) => {
                            res.send({ error, result: { score }, item });
                        });
                    }
                });
            }
        });
    });

    app.post('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
        const { data } = req.body;
        data.author = req.session.user._id;
        app.model.lesson.create(data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/lesson', app.permission.check('lesson:write'), (req, res) => {
        const { _id, changes } = req.body;
        app.model.lesson.update(_id, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/lesson', app.permission.check('lesson:delete'), (req, res) => {
        const { _id } = req.body;
        app.model.lesson.delete(_id, (error) => res.send({ error }));
    });

    // Video APIs -----------------------------------------------------------------------------------------------------
    app.post('/api/lesson/video', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, data } = req.body;
        app.model.lessonVideo.create(data, (error, item) => {
            if (error || item == null) {
                res.send({ error: error || 'Hệ thống bị lỗi!' });
            } else if (item.image == null) {
                app.model.lesson.addVideo(_lessonId, item, (error, item) => {
                    res.send({ error, videos: item && item.videos ? item.videos : [] });
                });
            } else {
                app.uploadImage('lesson-video', app.model.lessonVideo.get, item._id, item.image, data => {
                    if (data.error) {
                        res.send({ error: data.error, item });
                    } else {
                        app.model.lesson.addVideo(_lessonId, item, (error, item) => {
                            res.send({ error, videos: item && item.videos ? item.videos : [] });
                        });
                    }
                });
            }
        });
    });

    app.put('/api/lesson/video', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonVideoId, data } = req.body;
        app.model.lessonVideo.update(_lessonVideoId, data, (error) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lesson.get(_lessonId, (error, item) => res.send({ error, videos: item && item.videos ? item.videos : [] }));
            }
        });
    });

    app.put('/api/lesson/video/swap', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonVideoId, isMoveUp } = req.body;
        app.model.lesson.get(_lessonId, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                for (let index = 0, length = item.videos.length; index < item.videos.length; index++) {
                    const lessonVideo = item.videos[index];
                    if (lessonVideo._id == _lessonVideoId) {
                        const newIndex = index + (isMoveUp == 'true' ? -1 : +1);
                        if (0 <= index && index < length && 0 <= newIndex && newIndex < length) {
                            item.videos.splice(index, 1);
                            item.videos.splice(newIndex, 0, lessonVideo);
                            item.save();
                        }
                        break;
                    }
                }
                res.send({ videos: item.videos });
            }
        });
    });

    app.delete('/api/lesson/video', app.permission.check('lesson:write'), (req, res) => {
        const { _lessonId, _lessonVideoId } = req.body;
        app.model.lessonVideo.delete(_lessonVideoId, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.lesson.deleteVideo(_lessonId, _lessonVideoId, (error, item) => {
                    res.send({ error, videos: item && item.videos ? item.videos : [] });
                });
            }
        });
    });

    // Hook readyHooks  -----------------------------------------------------------------------------------------------
    app.readyHooks.add('createLessonQuestionManager', {
        ready: () => app.model && app.model.lesson && app.hookQuestion,
        run: () => app.hookQuestion('lesson', app.model.lesson),
    });

    // Hook permissionHooks  ------------------------------------------------------------------------------------------
    app.permissionHooks.add('courseAdmin', 'lession', (user) => new Promise(resolve => {
        app.permissionHooks.pushUserPermission(user, 'lesson:read');
        resolve();
    }));

    // Hook upload images ---------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/lesson-video'));

    const uploadLessonVideo = (fields, files, done) => {
        if (fields.userData && fields.userData[0].startsWith('lessonVideoImage:') && files.lessonVideoImage && files.lessonVideoImage.length > 0) {
            console.log('Hook: uploadLessonVideo =>lesson video image upload');
            const _id = fields.userData[0].substring('lessonVideoImage:'.length);
            app.uploadImage('lesson-video', app.model.lessonVideo.get, _id, files.lessonVideoImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadLessonVideo', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadLessonVideo(fields, files, done), done, 'lesson:write'));
};
