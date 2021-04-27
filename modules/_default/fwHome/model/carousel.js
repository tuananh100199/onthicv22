module.exports = app => {
    const schema = app.db.Schema({
        title: String,
        height: Number,
        single: { type: Boolean, default: true },
    });
    const model = app.db.model('Carousel', schema);

    app.model.carousel = {
        create: (data, done) => model.create(data, done),

        getAll: done => model.find({}).sort({ title: 1 }).exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;
                model.find(condition).sort({ title: 1 }).skip(skipNumber).limit(result.pageSize).exec((error, list) => {
                    result.list = list;
                    done(error, result);
                });
            }
        }),

        get: (_id, done) => model.findById(_id, done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error) {
                done(error);
            } else if (item == null) {
                done('Invalid id!');
            } else {
                item.remove(error => {
                    if (error) {
                        done(error);
                    } else {
                        app.model.carouselItem.getAll({ carouselId: _id }, (error, carouselItems) => {
                            if (error || carouselItems == null) {
                                done('Delete carousel items failed!');
                            } else {
                                const deleteCarouselItem = index => {
                                    if (index < carouselItems.length) {
                                        app.model.carouselItem.delete(carouselItems[index]._id, () => deleteCarouselItem(index + 1));
                                    } else {
                                        app.model.component.clearViewId(_id, done);
                                    }
                                };
                                deleteCarouselItem(0);
                            }
                        });
                    }
                });
            }
        }),
    };
};