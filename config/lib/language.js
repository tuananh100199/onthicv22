module.exports = app => {
    app.language = (req, texts) => {
        const lg = req.cookies.language == null || req.cookies.language.trim().toLowerCase() == 'vi' ? 'vi' : 'en';
        return texts ? (texts[lg] ? texts[lg] : '') : lg;
    };

    app.language.parse = (req, text, getAll) => {
        let obj = {};
        try { obj = JSON.parse(text); } catch (e) { obj = {}; }
        if (obj.vi == null) obj.vi = text;
        if (obj.en == null) obj.en = text;
        return getAll ? obj : obj[app.language(req)];
    };

    app.language.parseAll = (text) => {
        let obj = {};
        try { obj = JSON.parse(text); } catch (e) { obj = {}; }
        if (obj.vi == null) obj.vi = text;
        if (obj.en == null) obj.en = text;
        return obj;
    };
};
