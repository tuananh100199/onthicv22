module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        editorId: app.database.mongoDB.Schema.Types.ObjectId,
        documentId: app.database.mongoDB.Schema.Types.ObjectId,
        editorName: String,
        title: String,
        documentType: String, // news | event
        image: String,
        isInternal: { type: Boolean, default: false },
        documentJson: String, // JSON.stringify
    });
    const model = app.database.mongoDB.model('Draft', schema);
    app.model.draft = {
        create: (data, done) => model.create(data, (error, item) => {
            if (error) {
                done(error);
            } else {
                const title = app.language.parseAll(data.title);
                if (title.vi == 'Bản nháp' && title.en == 'Draft') {
                    item.image = '/img/draft/' + item._id + '.jpg';// nguy hiem
                    const srcPath = app.path.join(app.publicPath, '/img/avatar.jpg'), destPath = app.path.join(app.publicPath, item.image);
                    app.fs.copyFile(srcPath, destPath, error => {
                        if (error) {
                            done(error);
                        } else {
                            item.image += '?t=' + (new Date().getTime()).toString().slice(-8);
                            item.save(done);
                        }
                    });
                } else {
                    app.model[data.documentType].get(data.documentId, (error, result) => {
                        const extPath = app.path.extname(result.image);
                        item.image = '/img/draft' + data.documentType.upFirstChar() + '/' + item._id + (extPath.indexOf('?t=') != -1 ? extPath.substring(0, extPath.indexOf('?t=')) : extPath);
                        const srcPath = app.path.join(app.publicPath, (result.image.indexOf('?t=') != -1) ? result.image.substring(0, result.image.indexOf('?t=')) : result.image);
                        const destPath = app.path.join(app.publicPath, item.image);
                        item.image += '?t=' + (new Date().getTime()).toString().slice(-8);
                        app.fs.copyFile(srcPath, destPath, error => {
                            if (error) {
                                done(error);
                            } else {
                                item.save(done);
                            }
                        });
                    });
                }
            }
        }),

        toNews: (_id, done) => model.findById({ _id: _id }).exec((error, result) => {
            if (error) {
                done(error);
            } else {
                const news = {
                    title: result.title,
                    isInternal: result.isInternal,
                    categories: JSON.parse(result.documentJson).categories,
                    abstract: JSON.parse(result.documentJson).abstract,
                    content: JSON.parse(result.documentJson).content,
                    startPost: JSON.parse(result.documentJson).startPost,
                    stopPost: JSON.parse(result.documentJson).stopPost,
                };
                app.model.news.get(result.documentId, (error, value) => {
                    if (error) { done(error); } else {
                        const srcPath = app.path.join(app.publicPath, (result.image.indexOf('?t=') != -1) ? result.image.substring(0, result.image.indexOf('?t=')) : result.image);
                        if (value) {
                            const destPath = app.path.join(app.publicPath, (value.image.indexOf('?t=') != -1) ? value.image.substring(0, value.image.indexOf('?t=')) : value.image);
                            news.image = '/img/news/' + result.documentId + app.path.extname(destPath) + '?t=' + (new Date().getTime()).toString().slice(-8);
                            app.model.news.update(result.documentId, news, (error, item) => {
                                app.fs.copyFile(srcPath, destPath, error => {
                                    if (error) {
                                        done(error);
                                    } else {
                                        app.model.draft.delete(result._id, error => {
                                            done && done(error, item);
                                        });
                                    }
                                });
                            });
                        } else {
                            app.model.news.create(news, (error, item) => {
                                const destPath = app.path.join(app.publicPath, item.image);
                                news.link = JSON.parse(result.documentJson).link;
                                news.createdDate = JSON.parse(result.documentJson).createdDate,
                                    app.fs.copyFile(srcPath, destPath, error => {
                                        if (error) {
                                            done(error);
                                        } else {
                                            app.model.draft.delete(result._id, error => {
                                                done && done(error, item);
                                            });
                                        }
                                    });
                            });
                        }
                    }
                });
            }
        }),

        userGet: (documentType, editorId, done) => model.find({ editorId, documentType }, 'documentId').exec(done),

        getAll: (condition, done) => {
            condition.parentId = { $eq: null };
            model.find(condition).sort({ priority: -1 }).exec((error, menus) => {
                if (error || menus == null) {
                    done('Lấy menu bị lỗi!');
                } else {
                    const items = [],
                        getSubmenu = index => {
                            if (index < menus.length) {
                                const item = app.clone(menus[index]);
                                condition.parentId = item._id;
                                model.find(condition).sort({ priority: -1 }).exec((error, submenus) => {
                                    if (submenus) {
                                        item.submenus = submenus;
                                    }
                                    items.push(item);
                                    getSubmenu(index + 1);
                                });
                            } else {
                                done(error, items);
                            }
                        };
                    getSubmenu(0);
                }
            });
        },

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ priority: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                    result.list = (error ? [] : items).map(item => app.clone(item, { content: '' }));
                    done(error, result);
                });
            }
        }),

        get: (_id, done) => model.findById(_id, done),

        getByLink: (link, done) => model.findOne({ link }, done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        swapPriority: (_id, isMoveUp, done) => model.findById(_id, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid category Id!');
            } else {
                const conditions = {
                    parentId: item1.parentId ? item1.parentId : { $eq: null },
                    priority: isMoveUp ? { $gt: item1.priority } : { $lt: item1.priority }
                };
                model.find(conditions).sort({ priority: isMoveUp ? 1 : -1 }).limit(1).exec((error, list) => {
                    if (error) {
                        done(error);
                    } else if (list == null || list.length === 0) {
                        done(null);
                    } else {
                        let item2 = list[0],
                            priority = item1.priority;
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        item1.save(error1 => item2.save(error2 => done(error1 ? error1 : error2)));
                    }
                });
            }
        }),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                app.deleteImage(item.image);
                item.remove(done);
            }
        }),
    };
};
