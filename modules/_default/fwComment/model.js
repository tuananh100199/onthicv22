module.exports = app => {
    const schema = app.db.Schema({
        refParentId: app.db.Schema.ObjectId,
        refId: app.db.Schema.ObjectId,
        parentId: app.db.Schema.ObjectId,

        author: { type: app.db.Schema.ObjectId, ref: 'User' },
        content: String,
        createdDate: { type: Date, default: Date.now },
        updatedDate: Date,
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' },
    });

    const model = app.db.model('Comment', schema);
    const populates = { path: 'author', select: '_id lastname firstname image' };

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

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, async (error, totalItem) => {
            if (!condition.parentId && !condition.$or) condition.parentId = { $exists: false };
            if (error) {
                done(error);
            } else {
                try {
                    let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                    const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                    const list = await model.find(condition).sort({ createdDate: -1 }).skip(skipNumber).limit(result.pageSize).populate(populates);
                    for (let i = 0; i < list.length; i++) {
                        const item = list[i];
                        const replyCondition = { parentId: item._id };
                        if (condition.state) replyCondition.state = condition.state;
                        const totalReplies = await model.countDocuments(replyCondition);
                        const replies = await model.find(replyCondition).sort({ createdDate: 1 }).limit(3).populate(populates);
                        list[i] = app.clone(item, { totalReplies, replies });
                    }

                    result = app.clone(result, { list });
                    done(null, result);
                } catch (error) {
                    done(error);
                }
            }
        }),

        getRepliesInScope: (condition, from, limit, done) => {
            model.find(condition).skip(from).limit(limit).populate(populates).exec(done);
        },

        get: (condition, done) => (typeof condition == 'string' ? model.findById(condition) : model.findOne(condition)).populate(populates).exec(done),

        update: (_id, changes, done) => {
            model.findOneAndUpdate({ _id }, changes, { new: true }).populate(populates).exec(done);
        },

        delete: (condition, done) => {
            if (typeof condition == 'string') {
                model.findById(condition).exec((error, item) => {
                    if (error) {
                        done(error);
                    } else if (item == null) {
                        done('Invalid Id!');
                    } else {
                        item.remove(done);
                    }
                });
            } else {
                model.deleteMany(condition, error => done(error));
            }
        },

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition)
    };
};