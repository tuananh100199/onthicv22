module.exports = app => {

    String.prototype.upFirstChar = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    String.prototype.replaceAll = function (search, replacement) {
        return this.replace(new RegExp(search, 'g'), replacement);
    };
    
    app.randomPassword = (length) => Math.random().toString(36).slice(-length);
};