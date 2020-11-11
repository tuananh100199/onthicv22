module.exports = app => {
    const schema = app.db.Schema({
        priority: Number,
        viewType: {
            type: String,
            enum: [
                '<empty>',
                'carousel', 'slogan', 'video', 'statistic', 'staff group', 'testimony', 'all staffs', 'last news',
                'subscribe', 'contact', 'logo',
                'content', 'all news', 'event', 'all leagues',
            ],
        },
        viewId: app.db.Schema.Types.ObjectId,
        className: String,
        style: String,
        componentIds: [{ type: app.db.Schema.Types.ObjectId, ref: 'Component' }],
    });
    const model = app.db.model('Component', schema);

    app.model.component = {
        create: (data, done) => model.find({}).sort({ priority: -1 }).limit(1).exec((error, items) => {
            data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
            model.create(data, done);
        }),

        getAll: (condition, done) => model.find(condition).sort({ priority: -1 }).exec(done),

        get: (_id, done) => model.findById(_id, done),

        getByMenuId: (menuId, done) => model.find({ menuId }).sort({ priority: -1 }).exec(done),

        update: (_id, data, done) => {
            let changes = { $set: {} };
            if (data.viewType) changes.$set.viewType = data.viewType;
            if (data.className || data.className == '') changes.$set.className = data.className;
            if (data.style || data.style == '') changes.$set.style = data.style;
            if (data.viewId) {
                if (data.viewId == '') {
                    changes['$unset'] = { viewId: '' };
                } else {
                    changes.$set.viewId = data.viewId;
                }
            } else {
                changes['$unset'] = { viewId: '' };
            }

            model.findOneAndUpdate({ _id }, changes, { new: true }, done);
        },

        clearViewId: (viewId, done) => model.updateMany({ viewId }, { $unset: { viewId: '' } }, error => done(error)),

        swapPriority: (_id, isMoveUp, done) => model.find({ componentIds: _id }, (error, parents) => {
            if (error || parents == null || parents.length == 0) {
                done('Thay đổi thứ tự component bị lỗi!')
            } else {
                let parentComponent = parents[0],
                    hasSend = false;
                for (let i = 0, n = parentComponent.componentIds.length; i < n; i++) {
                    component = parentComponent.componentIds[i];
                    if (parentComponent.componentIds[i] == _id) {
                        if (!isMoveUp && i + 1 < n) {
                            hasSend = true;
                            parentComponent.componentIds.splice(i, 1);
                            parentComponent.componentIds.splice(i + 1, 0, _id);
                            parentComponent.save(error => done(error));
                        } else if (isMoveUp && i > 0) {
                            hasSend = true;
                            parentComponent.componentIds.splice(i, 1);
                            parentComponent.componentIds.splice(i - 1, 0, _id);
                            parentComponent.save(error => done(error));
                        }
                        break;
                    }
                }

                if (!hasSend) done();
            }
        }),

        delete: (_id, done) => model.find({ componentIds: _id }, (error, parents) => {
            if (error || parents == null) {
                done('Xóa component bị lỗi!')
            }

            const removeComponent = (index) => {
                if (index < parents.length) {
                    const parentComponent = parents[index];
                    const componentIndex = parentComponent.componentIds.indexOf(_id);
                    if (componentIndex != -1) {
                        parentComponent.componentIds.splice(componentIndex, 1);
                    }
                    parentComponent.save(error => removeComponent(index + 1))
                } else {
                    model.deleteOne({ _id }, done);
                }
            }
            removeComponent(0);
        }),
    };
};