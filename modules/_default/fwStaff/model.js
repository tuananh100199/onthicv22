module.exports = (app) => {
    const schema = app.db.Schema({
        user: { type: app.db.Schema.ObjectId, ref: 'User' },            //user
        division: { type: app.db.Schema.ObjectId, ref: 'Division' },    // Cơ sở đào tạo
        
        // staffInfoData
        department:{type:app.db.Schema.ObjectId,ref:'Department'},      //Phòng ban
        msnv:String,
        chucVu:String,
        ngayBatDauLam:Date,
        trinhDoVanHoa:String,
        trinhDoDaoTao:String,
        chuyenNganh:String,
        truongDaoTao:String,
        bangCapKhac:String,
        
        //user
        firstname: String,
        lastname: String,
        sex: { type: String, enum: ['male', 'female'], default: 'male' },
        birthday: Date,
        email:String,
        phoneNumber:String,
        image:String,

        residence: String,                                              // Nơi cư trú
        regularResidence: String,                                       // Nơi đăng ký hộ khẩu thường trú

        identityCard: String,                                           // Số CMND, CCCD
        identityIssuedBy: String,                                       // Nơi cấp CMND, CCCD
        identityDate: Date,                                             // Ngày cấp CMND, CCCD

    });

    const model = app.db.model('StaffInfo', schema);
    app.model.staffInfo = {
        create: (data, done) =>{
            // xử lý trường hợp có msnv
            if(data && data.msnv && data.msnv!=''){
                model.findOne({msnv:data.msnv},(error,info)=>{
                    if(error) done(error);
                    else if(info) done('MSNV đã được sử dụng!');
                    else{
                        model.create(data,done);
                    }
                });
            }else{//trường hợp không có msnv
                model.create(data, done);
            }
        },

        get: (condition, done) =>(typeof condition == 'object' ? model.findOne(condition) : model.findById(condition))
            .populate('user', '-password').populate('division').populate('department').exec(done),

        getPage: (pageNumber, pageSize, condition, done) => model.countDocuments(condition, (error, totalItem) => {
            if (error) {
                done(error);
            } else {
                let result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                result.pageNumber = pageNumber === -1 ? result.pageTotal : Math.min(pageNumber, result.pageTotal);
                const skipNumber = (result.pageNumber > 0 ? result.pageNumber - 1 : 0) * result.pageSize;

                model.find(condition).sort({department:1,lastname: 1 }).skip(skipNumber).limit(result.pageSize)
                .populate('user', '-password').populate('division', '_id title').populate('department', '_id title')
                .exec((error, items) => {
                    result.list = error ? [] : items;
                    done(error, result);
                });
            }
        }),

        update: (_id, changes, done) => {
            if(changes && changes.msnv && changes.msnv!=''){
                model.findOne({msnv:changes.msnv},(error,info)=>{
                    if(error) done(error);
                    else if(info && info._id !=_id){// MSNV của nv khác
                        done('MSNV đã được sử dụng!');
                    }else{
                        model.findOneAndUpdate({ _id }, changes, { new: true }).populate('user', 'email phoneNumber').populate('division', 'id title').exec(done);
                    }
                });
            }else{
                model.findOneAndUpdate({ _id }, changes, { new: true }).populate('user', 'email phoneNumber').populate('division', 'id title').exec(done);
            }
        },

        delete: (_id, done) => model.findById(_id, (error, item) => {
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
