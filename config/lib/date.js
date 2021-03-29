module.exports = app => {
    Date.prototype.yyyymmdd = function () {
        return this.toISOString().slice(0, 10).replace(/-/g, '')
    };

    const get2 = (x) => ('0' + x).slice(-2);

    app.date = {
        dateFormat: (date) => {
            return get2(date.getMonth() + 1) + '/' + get2(date.getDate()) + '/' + date.getFullYear();
        },

        viDateFormat: (date) => {
            return date ? (get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear()) : '';
        },

        getDateFolderName: (date) => {
            if (date == null) date = new Date();
            return date.getFullYear() + get2(date.getMonth() + 1) + get2(date.getDate());
        }

        // viDateTimeFormat: (date) => {
        //     date.setHours(date.getHours() + 7);
        //     const timeString = get2(date.getUTCHours()) + 'g' + get2(date.getUTCMinutes()) + ', ';
        //     const dateOfWeek = dayOfWeek[date.getUTCDay()] + ',';
        //     const dayString = ' ngày ' + get2(date.getUTCDate()) + ' tháng ' + get2(date.getUTCMonth() + 1) + ' năm ' + date.getUTCFullYear();
        //     return timeString + dateOfWeek + dayString;
        // }
    };
};