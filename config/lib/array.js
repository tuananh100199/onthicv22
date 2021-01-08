module.exports = app => {
    
    Array.prototype.contains = function (pattern) {
        return pattern.reduce((result, item) => result && this.includes(item), true);
    }
    
    Array.prototype.exists = function (pattern, req = null) {
        if (!req) {
            return pattern.some(item => this.includes(item));
        } else {
            for (let i = 0; i < pattern.length; i++) {
                const element = pattern[i];
                if (typeof element == 'function') {
                    if (element(req, this)) {
                        return true;
                    }
                } else if (this.includes(element)) {
                    return true;
                }
            }
            
            return false;
        }
    };
    
    Array.prototype.removeByValue = function (value) {
        const index = this.indexOf(value);
        if (index >= 0) {
            this.splice(index, 1);
        }
    };
};
