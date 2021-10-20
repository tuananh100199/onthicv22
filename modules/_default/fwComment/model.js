module.exports = app => {
    const schema = app.db.Schema({
        refParentId: app.db.Schema.ObjectId,
        refId: app.db.Schema.ObjectId,

        author: { type: app.db.Schema.ObjectId, ref: 'User' },
        content: String,
        createdDate: { type: Date, default: Date.now },
        updatedDate: Date,
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' }, // TODO: Sang => Chỉ có approved mới hiển thị lên cho user, admin thì thấy hết
        replies: [{ type: app.db.Schema.ObjectId, ref: 'Comment' }],
    });

    const model = app.db.model('Comment', schema);
    const populates = [
        { path: 'author', select: '_id lastname firstname image' },
        { path: 'replies', populate: { path: 'author', select: '_id lastname firstname image' } }
    ];

    app.model.comment = {
        create: (data, done) => model.create(data, (error, item) => {
            if (error) {
                done(error);
            } else {
                app.model.user.get(item.author, (error, author) => {
                    if (author) item = app.clone(item, { author: { _id: author._id, firstname: author.firstname, lastname: author.lastname, image: author.image } });
                    done(error, item);
                });
            }
        }),

        getAll: (condition, done) => model.find(condition).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                // model.find(condition).sort({ createdDate: -1 }).skip(skipNumber).limit(result.pageSize).slice('replies', [0, 3]).populate(populates).exec((error, list) => {
                model.aggregate([
                    { $match: condition },
                    { $sort: { createdDate: -1 } },
                    { $skip: skipNumber },
                    { $limit: result.pageSize },
                    {
                        $project: {
                            author: true, content: true, createdDate: true, updatedDate: true,
                            totalReplies: { $size: '$replies' },
                            replies: { $slice: ['$replies', 3] }
                        }
                    }
                ]).then(list => {
                    model.populate(list, populates, (error, list) => {
                        result.list = list || [];
                        done(error, result);
                    });
                }).catch(error => done(error));
            }
        }),

        getRepliesInScope: (condition, from, limit, done) => {
            model.findOne(condition)
                .select('_id replies')
                .slice('replies', [from, limit])
                .populate({ path: 'replies', populate: { path: 'author', select: '_id lastname firstname image' } })
                .exec(done);
        },

        get: (condition, done) => (typeof condition == 'string' ? model.findById(condition) : model.findOne(condition)).populate(populates).exec(done),

        update: (_id, changes, done) => {
            changes.updatedDate = new Date();
            model.findOneAndUpdate({ _id }, changes, { new: true }).populate(populates).exec(done);
        },

        deleteReply: (condition, replyId, done) => {
            model.findOneAndUpdate(condition, { $pull: { replies: replyId } }, { new: true }, done);
        },

        delete: (condition, done) => {
            if (typeof condition == 'string') {
                model.findById(condition).exec((error, item) => {
                    if (error) {
                        done(error);
                    } else if (item == null) {
                        done('Invalid Id!');
                    } else {
                        model.deleteMany({ _id: { $in: item.replies || [] } }, error => {
                            if (error) {
                                done(error);
                            } else {
                                item.remove(done);
                            }
                        });
                    }
                });
            } else {
                model.find(condition).exec((error, items = []) => {
                    if (error) {
                        done(error);
                    } else {
                        const subCommentId = [];
                        items.forEach(item => subCommentId.push(...(item.replies || [])));
                        model.deleteMany({ _id: { $in: subCommentId } }, error => {
                            if (error) {
                                done(error);
                            } else {
                                model.deleteMany(condition, error => done(error));
                            }
                        });
                    }
                });
            }
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition)
    };
};