module.exports = app => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.ObjectId, ref: 'User' },
        title: String,
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' },
        modifiedDate: { type: Date, default: null },                        // Ngày cập nhật cuối cùng
        categories: { type: app.db.Schema.ObjectId, ref: 'Category' },            // Phân loại forum
        messages: [{
            user: { type: app.db.Schema.ObjectId, ref: 'User' },
            content: String,
            active: { type: Boolean, default: false },
            createdDate: { type: Date, default: Date.now },
        }],
        createdDate: { type: Date, default: Date.now },
    });
    const model = app.db.model('Forum', schema);

    app.model.forum = {
        create: (data, done) => model.create(data, done),

        getAll: (done) => model.find({}).sort({ title: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('user', 'firstname lastname').populate('categories', 'title').sort({ title: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('user', 'firstname lastname')
                .populate({ path: 'messages.user', select: 'firstname lastname' })
                .exec(done);
        },

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => {
            changes.modifiedDate = new Date().getTime();
            model.findOneAndUpdate({ _id }, changes, { new: true }, done);
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                item.remove(done);
            }
        }),

        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),

        // Messages functions -----------------------------------------------------------------------------------------
        addMessage: (_id, messages, done) => {
            model.findOneAndUpdate({ '_id': _id }, { $push: { messages: messages } }, { new: true })
                .populate({ path: 'messages.user', select: 'firstname lastname' })
                .exec(done);
        },

        updateMessage: (_id, messages, done) => {
            const changes = {
                $set: { 'messages.$.active': messages.active, 'messages.$.content': messages.content },
            };
            model.findOneAndUpdate({ '_id': _id, 'messages._id': messages._id }, changes, { new: true })
                .populate({ path: 'messages.user', select: 'firstname lastname' })
                .exec(done);
        },

        deleteMessage: (_id, messageId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { messages: { _id: messageId } } }, { new: true }).populate({
                path: 'messages.user', select: 'firstname lastname'
            }).exec(done);
        },
    };
};