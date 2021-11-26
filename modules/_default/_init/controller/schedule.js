module.exports = (app) => {
    app.readyHooks.add('schedule', {
        ready: () => app.redis,
        run: () => {
            // Thực hiện task lúc nửa đêm
            app.schedule('0 0 * * *', () => {
                // Cập nhật biến đếm ngày hôm nay về 0
                if (app.primaryWorker) app.redis.set(`${app.appName}:state:todayViews`, 0);

                // Dọn rác /temp/:dateFolderName cách 1 ngày
                if (app.primaryWorker) {
                    const tempPath = app.path.join(app.assetPath, '/temp'),
                        date = new Date(),
                        todayDirname = app.date.getDateFolderName(date);
                    date.setDate(date.getDate() - 1);
                    const yesterdayDirname = app.date.getDateFolderName(date);

                    app.fs.readdirSync(tempPath, { withFileTypes: true }).forEach(item => {
                        if (item.isDirectory() && item.name != todayDirname && item.name != yesterdayDirname) {
                            app.deleteFolder(app.path.join(tempPath, item.name));
                        }
                    });
                }
                // Hủy đăng ký lịch học của học viên cách 1 ngày
                if (app.primaryWorker) {
                    app.model.timeTable.getAll({ state: 'waiting' }, (error, items) =>{
                        let timeTables = [];
                        (items||[]).forEach(item => {
                            const expiredDate = new Date(item.createdAt).getTime() + 1000*3600*24;
                            const now = new Date().getTime();
                            if (expiredDate < now) {
                                timeTables.push(item);
                            }
                        });
                        if (timeTables && timeTables.length) {
                            const handleDeleteTimeTable = (index = 0) => {
                                if (index == timeTables.length) {
                                    return;
                                } else {
                                    const timeTable = timeTables[index];
                                    app.model.timeTable.update(timeTable._id, { state: 'autoCancel' }, () => {
                                        handleDeleteTimeTable(index + 1);
                                    });
                                }
                            };
                            handleDeleteTimeTable();
                        }
                    });
                }
                
            });
        },
    });
};