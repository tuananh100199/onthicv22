module.exports = (app) => {
    // Count views ----------------------------------------------------------------------------------------------------------------------------------
    app.schedule('*/1 * * * *', () => {
        app.redis.mget([`${app.appName}:todayViews`, `${app.appName}:allViews`], (error, result) => {
            if (error == null && result) {
                app.state.data.todayViews = Number(result[0]);
                app.state.data.allViews = Number(result[1]);
                app.model.setting.set({ todayViews: Number(result[0]), allViews: Number(result[1]) });
            }
        });
    });

    // Thực hiện lúc nửa đêm
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
        app.redis.set(`${app.appName}:todayViews`, 0);
        app.model.setting.set({ todayViews: 0 });
    });
}