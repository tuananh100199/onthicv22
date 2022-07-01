module.exports = app => {
    app.sms={
        // eslint-disable-next-line no-control-regex
        checkNonLatinChar: string => /[^\u0000-\u00ff]/.test(string),
    };
};