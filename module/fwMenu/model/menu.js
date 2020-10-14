module.exports = app => {
    const schema = app.db.Schema({
        parentId: app.db.Schema.Types.ObjectId,
        componentId: app.db.Schema.Types.ObjectId,
        priority: Number,
        title: String,
        link: String,
        active: { type: Boolean, default: false }
    });
    const model = app.db.model('Menu', schema);

    app.model.menu = {
        create: (data, done) => model.find({}).sort({ priority: +1 }).limit(1).exec((error, items) => {
            data.priority = error || items == null || items.length === 0 ? 1 : items[0].priority + 1;
            model.create(data, done);
        }),

        getAll: (condition, done) => {
            condition.parentId = { $eq: null };
            model.find(condition).sort({ priority: +1 }).exec((error, menus) => {
                if (error || menus == null) {
                    done('Lấy menu bị lỗi!');
                } else {
                    const items = [],
                        getSubmenu = index => {
                            if (index < menus.length) {
                                const item = app.clone(menus[index]);
                                condition.parentId = item._id;
                                model.find(condition).sort({ priority: +1 }).exec((error, submenus) => {
                                    if (submenus) {
                                        item.submenus = submenus;
                                    }
                                    items.push(item);
                                    getSubmenu(index + 1);
                                });
                            } else {
                                done(error, items);
                            }
                        };
                    getSubmenu(0);
                }
            });
        },

        get: (condition, done) => typeof condition == 'string' ? // condition is _id
            model.findById(condition, done) : model.findOne(condition, done),

        update: (_id, changes, done) => model.findOneAndUpdate({ _id }, { $set: changes }, { new: true }, done),

        delete: (_id, done) => model.findById(_id, (error, item) => {
            if (error || item == null) {
                done('Lỗi xãy ra khi xóa menu!');
            } else {
                item.remove(error => {
                    if (error) {
                        done('Lỗi xãy ra khi xóa menu!');
                    } else {
                        model.find({ parentId: _id }, (error, items) => {
                            if (error) {
                                done('Lỗi xãy ra khi xóa menu!');
                            } else {
                                const deleteChild = index => {
                                    if (index < items.length) {
                                        app.model.menu.delete(_id, error => deleteChild(index + 1));
                                    } else {
                                        done(null);
                                    }
                                };
                                deleteChild(0);
                            }
                        });
                    }
                });
            }
        }),
    };

    // Init -----------------------------------------------------------------------------------------------------------------------------------------
    app.model.menu.get({ link: '/' }, (error, menu) => {
        if (error) {
            console.error('Get menu by link has errors!');
        } else if (menu == null) {
            app.model.menu.create({
                active: true,
                title: 'Home',
                link: '/',
            });
        }
    });
};
