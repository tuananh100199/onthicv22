module.exports = app => {
    const schema = app.db.Schema({
        active: { type: Boolean, default: false },                                  // Có thể dài, nên dùng FormRichTextBox
        title: String,
        image: String,
        answers: { type: String, default: '' },                                     // Dùng FormRichTextBox => mỗi câu là 1 dòng
        trueAnswer: { type: Number, default: 0 },                                   // Ghi là 1 thì dòng 1 của answers là đúng. Hiển thị: nếu answers có 3 dòng thì phải hiện Đáp án 1, Đáp án 2, Đáp án 3
        priority: { type: Number, default: 0 },
        importance: { type: Boolean, default: false },                              // true => câu liệt
        categories: [{ type: app.db.Schema.ObjectId, ref: 'Category' }],            // Phân loại câu hỏi, xử lý giống news
    });
    const model = app.db.model('DriveQuestion', schema);

    app.model.driveQuestion = {
        create: (data, done) => {
            model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
                data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
                model.create(data, done)
            })
        },

        getPage: (pageNumber, pageSize, condition, done) => {
            model.countDocuments(condition, (error, totalItem) => {
                if (error) {
                    done(error);
                } else {
                    let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                    const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                    model.find(condition).sort({ priority: -1 }).skip(skipNumber).limit(result.pageSize).exec((error, items) => {
                        result.list = error ? [] : items;
                        done(error, result);
                    });
                }
            });
        },

        getAll: (condition, done) => done ? model.find(condition).sort({ priority: -1 }).exec(done) : model.find({}).sort({ priority: -1 }).exec(condition),


        get: (condition, done) => {
            typeof condition == 'string' ? model.findById(condition).populate('categories', 'title').exec(done) : model.findOne(condition).populate('categories', 'title').exec(done)
        },

        update: (_id, $set, $unset, done) => done ?
            model.findOneAndUpdate({ _id }, { $set, $unset }, { new: true }, done) :
            model.findOneAndUpdate({ _id }, { $set }, { new: true }, $unset),

        swapPriority: (_id, isMoveUp, done) => model.findById(_id, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid drive question Id!');
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

        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
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
