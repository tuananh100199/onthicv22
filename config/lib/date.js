module.exports = app => {

    Date.prototype.yyyymmdd = function() {
        return this.toISOString().slice(0, 10).replace(/-/g, '')
    };
    const get2 = (x) => ('0' + x).slice(-2);
    const dayOfWeek = {
        '0': 'Sunday',
        '1': 'Monday',
        '2': 'Tuesday',
        '3': 'Wednesday',
        '4': 'Thursday',
        '5': 'Friday',
        '6': 'Saturday',
        '7': 'Sunday',
    }
    app.date = {
        dateFormat: (date) => {
            return get2(date.getMonth() + 1) + '/' + get2(date.getDate()) + '/' + date.getFullYear();
        },
        viDateFormat: (date) => {
            return get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear();
        },
        customDateFormat: (date) => {
            const year = date.substring(0, 4),
                month = date.substring(5, 7),
                day = date.substring(8, 10);
            return get2(day) + '/' + get2(month) + '/' + year;
        },
        yearOfBirth: (date) => {
            const year = date.substring(0, 4);
            return year;
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