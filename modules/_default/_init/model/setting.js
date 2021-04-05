module.exports = (app) => {
    const schema = app.db.Schema({
        key: String,
        value: String
    });

    const model = app.db.model('Setting', schema);
    app.model.setting = {
        get: function () {
            let result = {}, keys = [...arguments];
            if (keys.length) {
                const done = keys.pop();
                model.find({ key: { $in: keys || [] } }, (error, items) => {
                    if (error || (items && items.length == 0)) {
                        done(result);
                    } else {
                        for (let i = 0; i <= items.length; i++) {
                            if (i == items.length) {
                                done(result)
                            } else {
                                result[items[i].key] = items[i].value;
                            }
                        }
                    }
                });
            }
        },

        set: (data, done) => {
            const keys = Object.keys(data), options = { upsert: true, new: true, setDefaultsOnInsert: true };
            let error = null;
            const solveAnItem = (index) => {
                if (index < keys.length) {
                    let key = keys[index];
                    model.findOneAndUpdate({ key }, { $set: { value: data[key] } }, options, (err, item) => {
                        if ((err || item == null) && error == null) error = 'Set setting (' + key + ') has error: ' + err;
                        solveAnItem(index + 1);
                    });
                } else if (done) {
                    if (done) done(error);
                }
            };
            solveAnItem(0);
        },

        init: (data, done) => {
            const keys = Object.keys(data);
            const solveAnItem = index => {
                if (index < keys.length) {
                    let key = keys[index], value = data[key];
                    model.findOne({ key }, (error, item) => {
                        if (error) {
                            console.error('Init setting (' + key + ') has errors!');
                            solveAnItem(index + 1);
                        } else if (item) {
                            solveAnItem(index + 1);
                        } else {
                            model.create({ key, value }, (error, item) => {
                                if (error || item == null) {
                                    console.error('Init setting (' + key + ') has errors!');
                                }
                                solveAnItem(index + 1);
                            });
                        }
                    });
                } else {
                    done && done();
                }
            };
            solveAnItem(0);
        }
    };
};
