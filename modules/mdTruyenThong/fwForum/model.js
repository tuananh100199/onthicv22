module.exports = app => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.ObjectId, ref: 'User' },
        priority: Number,
        title: String,
        state: { type: String, enum: ['approved', 'waiting', 'reject'], default: 'waiting' },
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
        create: (data, done) => {
            model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
                data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
                model.create(data, done);
            });
        },

        getAll: (done) => model.find({}).sort({ _id: -1 }).exec(done),

        getUnread: (done) => model.find({ read: false }).sort({ _id: -1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = {
                    totalItem,
                    pageSize,
                    pageTotal: Math.ceil(totalItem / pageSize)
                };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).populate('user','firstname lastname').sort({ priority: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (condition, done) => {
            const findTask = typeof condition == 'string' ? model.findById(condition) : model.findOne(condition);
            findTask.populate('user','firstname lastname').populate({
                path:'messages.user', select: 'firstname lastname'}).exec(done);
        },
        
        // read: (_id, done) => model.findOneAndUpdate({ _id }, { $set: { read: true } }, { new: true }, done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => {
            model.findOneAndUpdate({ _id }, changes, { new: true }, done) ;
        },

        swapPriority: (_id, isMoveUp, done) => model.findById(_id, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid sign Id!');
            } else {
                model.find({ priority: isMoveUp ? { $gt: item1.priority } : { $lt: item1.priority } })
                    .sort({ priority: isMoveUp ? 1 : -1 }).limit(1).exec((error, list) => {
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
                done('Invalid id!');
            } else {
                item.remove(done);
            }
        }),

        addMessage: (_id, messages, done) => {
            model.findOneAndUpdate(_id, { $push: { messages: messages } }, { new: true }).populate({
                path:'messages.user', select: 'firstname lastname'}).exec(done);
        },

        updateMessage: (_id, messages, done) => {
            model.findOneAndUpdate({ '_id' : _id, 'messages._id' :  messages._id }, 
            {
                $set: {
                    'messages.$.active': messages.active,
                    'messages.$.content': messages.content,
                }
            }, { new: true }).populate({
                path:'messages.user', select: 'firstname lastname'}).exec(done);
        },
       
        deleteMessage: (_id, messageId, done) => {
            model.findOneAndUpdate({ _id }, { $pull: { messages: { _id : messageId } } }, { new: true }).populate({
                path:'messages.user', select: 'firstname lastname'}).exec(done);
        },
        count: (condition, done) => done ? model.countDocuments(condition, done) : model.countDocuments({}, condition),
    };
};