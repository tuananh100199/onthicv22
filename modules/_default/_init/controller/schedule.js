module.exports = (app) => {
    app.readyHooks.add('schedule', {
        ready: () => app.redis,
        run: () => {
            // Thực hiện task lúc nửa đêm
            app.schedule('0 0 * * *', () => {
                // Dọn rác /temp/:dateFolderName cách 1 ngày
                if (app.configWorker) {
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

                // Cập nhật biến đếm ngày hôm nay về 0
                if (app.configWorker) app.redis.set(`${app.appName}:state:todayViews`, 0);
            });
        },
    });
};