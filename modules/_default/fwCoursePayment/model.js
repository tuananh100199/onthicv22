module.exports = (app) => {
    const schema = app.db.Schema({
        title: String,
        numOfPayments: Number,
        description: String,
        default:{type:Boolean,default:false}
    });

    const model = app.db.model('CoursePayment', schema);
    app.model.coursePayment = {
        create: (data, done) => model.create(data, done),

        get: (condition, done) => typeof condition == 'object' ?
            model.findOne(condition, done) : model.findById(condition, done),

        getAll: (condition, done) => done ?
        model.find(condition).sort({ title: 1 }).exec(done) :
        model.find({}).sort({ title: 1 }).exec(condition),
    

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                const result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        update: (_id, changes, done) =>{
          model.findById(_id,(error,item)=>{
            if(error)done('System has errors!');
            else if((changes.default==true||changes.default=='true') && (!item.default)){
                changes.default=true;
                model.updateMany({},{ $set: { default: false } }, error=>error?
                    done(error):model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }).exec(done));
            }else{
                delete changes.default;
                model.findOneAndUpdate({_id},changes,{new:true}).exec(done);
            }
          });
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
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
