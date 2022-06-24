module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        sentDate:{type:Date,default:Date.now},
        total:Number,
        email:String,
        phone:String,
    });
    const model = app.database.mongoDB.model('SmsBrandName', schema);

    app.model.smsBrandName = {
        create: (data, done) => model.create(data, done),

        getPage: (pageNumber, pageSize, condition, sort, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                if (done == undefined) {
                    done = sort;
                    sort = { createdDate: -1 };
                }
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);

                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort(sort).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                        result.list = list;
                        done(error, result);
                    });
            }
        }),

        get: (condition, done) => typeof condition == 'string' ?
            model.findById(condition, done) : model.findOne(condition, done),

        getAll: (condition, done) => model.find(condition).sort({ sentDate: -1 }).exec(done),

        // changes = { $set, $unset, $push, $pull }
        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, changes, { new: true }, done),
        
        delete: (_id, done) => model.findOne({ _id }, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid Id!');
            } else {
                item.remove(done);
            }
        }),
    
    };
};