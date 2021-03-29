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

    app.schedule('0 0 * * *', () => {
        app.redis.set(`${app.appName}:todayViews`, 0);
        app.model.setting.set({ todayViews: 0 });
    });
}