import io from 'socket.io-client';
import dateformat from 'dateformat';
import routeMatcherLib from './routematcher.js';
import './sweetalert.min.js';

const dayjs = require('dayjs'), relativeTime = require('dayjs/plugin/relativeTime');
require('dayjs/locale/vi');
dayjs.locale('vi');
dayjs.extend(relativeTime);

const T = {
    debug: (location.hostname === 'localhost' || location.hostname === '127.0.0.1'),
    rootUrl: window.location.protocol + '//' + window.location.hostname,

    component: { '<empty>': null },
    defaultPageSize: 50, defaultUserPageSize: 21, defaultUserSidebarSize: 3,
    newsFeedPageSize: 3,
    courseFeedPageSize: 3,

    randomPassword: length => Math.random().toString(36).slice(-length),

    ready: (pathname, done) => $(document).ready(() => setTimeout(() => {
        T.clearSearchBox && T.clearSearchBox();
        T.hideSearchBox();

        if (pathname == undefined) {
            done = null;
            pathname = window.location.pathname;
        } else if (typeof pathname == 'function') {
            done = pathname;
            pathname = window.location.pathname;
        }

        done && done();

        $('ul.app-menu > li').removeClass('is-expanded');
        $('ul.app-menu a.active').removeClass('active');
        let menuItem = $(`a.app-menu__item[href='${pathname}']`);
        if (menuItem.length != 0) {
            menuItem.addClass('active');
        } else {
            menuItem = $(`a.treeview-item[href='${pathname}']`);
            if (menuItem.length != 0) {
                menuItem.addClass('active');
                menuItem.parent().parent().parent().addClass('is-expanded');
            }
        }
    }, 250)),

    url: (url) => url + (url && url.indexOf('?') === -1 ? '?t=' : '&t=') + new Date().getTime(),
    download: (url, name) => {
        let link = document.createElement('a');
        link.target = '_blank';
        link.download = name;
        link.href = T.url(url);
        link.click();
    },

    cookie: (cname, cvalue, exdays) => {
        if (cvalue === undefined) {
            const name = cname + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trimStart();
                if (c.indexOf(name) === 0) {
                    try {
                        return JSON.parse(c.substring(name.length, c.length));
                    } catch {
                        return {};
                    }
                }
            }
            return {};
        } else {
            let d = new Date();
            d.setTime(d.getTime() + ((exdays === undefined ? 60 : exdays) * 24 * 60 * 60 * 1000));
            document.cookie = cname + '=' + JSON.stringify(cvalue) + ';expires=' + d.toUTCString() + ';path=/';
        }
    },

    storage: (cname, cvalue) => {
        if (cvalue != null) {
            window.localStorage.setItem(cname, JSON.stringify(cvalue));
        } else {
            try {
                return JSON.parse(window.localStorage.getItem(cname)) || {};
            } catch {
                return {};
            }
        }
    },

    cookieKeyName: {
        pageNumber: 'N',
        pageSize: 'S',
        pageCondition: 'C'
    },

    initCookiePage: (cookieName, hasCondition = false) => {
        let initData = T.cookie(cookieName);
        if (initData[T.cookieKeyName.pageNumber] == null) initData[T.cookieKeyName.pageNumber] = 1;
        if (initData[T.cookieKeyName.pageSize] == null) initData[T.cookieKeyName.pageSize] = 50;
        if (initData[T.cookieKeyName.pageCondition] == null) initData[T.cookieKeyName.pageCondition] = hasCondition ? {} : undefined;
        T.cookie(cookieName, initData);
    },

    updatePage: (cookieName, pageNumber, pageSize, pageCondition) => {
        const updateStatus = {},
            oldStatus = T.cookie(cookieName);
        updateStatus[T.cookieKeyName.pageNumber] = pageNumber ? pageNumber : oldStatus[T.cookieKeyName.pageNumber];
        updateStatus[T.cookieKeyName.pageSize] = pageSize ? pageSize : oldStatus[T.cookieKeyName.pageSize];
        updateStatus[T.cookieKeyName.pageCondition] = pageCondition ? pageCondition : oldStatus[T.cookieKeyName.pageCondition];
        T.cookie(cookieName, updateStatus);
        return {
            pageNumber: updateStatus[T.cookieKeyName.pageNumber],
            pageSize: updateStatus[T.cookieKeyName.pageSize],
            pageCondition: JSON.stringify(updateStatus[T.cookieKeyName.pageCondition])
        };
    },

    onResize: () => {
        const marginTop = 6 + $('header').height(),
            marginBottom = 6 + $('footer').height();
        $('.site-content').css('margin', marginTop + 'px 0 ' + marginBottom + 'px 0');
    },

    validateEmail: email => (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase()),
    validateMobile: mobile => /0[0-9]{9,}\b/g.test(mobile),

    dateToText: (date, format) => dateformat(date, format ? format : 'dd/mm/yyyy HH:MM:ss'),
    numberDisplay: number => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    mobileDisplay: mobile => mobile ? (mobile.length == 10 ? mobile.toString().replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') : mobile.toString().replace(/(\d{3})(\d{4})(\d{4})/, '($1) $2 $3')) : '',

    // Libraries ----------------------------------------------------------------------------------
    routeMatcher: routeMatcherLib.routeMatcher,

    notify: (message, type) => $.notify({ message }, { type, placement: { from: 'bottom' }, z_index: 2000 }),

    alert: (text, icon, button, timer) => {
        let options = {};
        if (icon) {
            if (typeof icon == 'boolean') {
                options.button = icon;
                options.icon = 'success';
                if (timer) options.timer = timer;
            } else if (typeof icon == 'number') {
                options.timer = icon;
                options.icon = 'success';
            } else {
                options.icon = icon;
            }

            if (button != undefined) {
                if (typeof button == 'number') {
                    options.timer = options.button;
                    options.button = true;
                } else {
                    options.button = button;
                    if (timer) options.timer = timer;
                }
            } else {
                options.button = true;
            }
        } else {
            options.icon = 'success';
            options.button = true;
        }
        options.text = text;
        swal(options);
    },

    confirm: (title, html, icon, dangerMode, done) => {
        if (typeof icon == 'function') {
            done = icon;
            icon = 'warning';
            dangerMode = false;
        } else if (typeof icon == 'boolean') {
            done = dangerMode;
            dangerMode = icon;
            icon = 'warning';
        } else if (typeof dangerMode == 'function') {
            done = dangerMode;
            dangerMode = false;
        }
        const content = document.createElement('div');
        content.innerHTML = html;
        swal({ icon, title, content, dangerMode, buttons: { cancel: true, confirm: true }, }).then(done);
    },

    formatDate: str => {
        try {
            let [strDate, strTime] = str.split(' '), [date, month, year] = strDate.split('/'), [hours, minutes] = strTime ? strTime.split(':') : [0, 0];
            return new Date(year, month - 1, date, hours, minutes);
        } catch (ex) {
            return null;
        }
    },

    tooltip: (timeOut = 250) => {
        $(function () {
            setTimeout(() => $('[data-toggle="tooltip"]').tooltip(), timeOut);
        });
    },

    createAjaxAdapter: (url, parseData, parseResponse) => {
        if (parseResponse == undefined) {
            parseResponse = parseData;
            parseData = {};
        }
        return ({
            ajax: true,
            url: T.url(url),
            data: parseData,
            processResults: response => ({ results: parseResponse(response) }),
        });
    },

    fromNow: (time) => dayjs(time).fromNow(),
};

T.socket = T.debug ? io({ transports: ['websocket'] }) : io.connect(T.rootUrl, { transports: ['websocket'], secure: true });

T.get2 = x => ('0' + x).slice(-2);
T.socket.on('connect', () => {
    if (T.connected === 0) {
        T.connected = true;
    } else if (T.debug) {
        location.reload();
    }
});
if (T.debug) {
    T.connected = 0;
    T.socket.on('reconnect_attempt', attemptNumber => T.connected = -attemptNumber);
    T.socket.on('debug', type => (type === 'reload') && location.reload());
}

['get', 'post', 'put', 'delete'].forEach(method => T[method] = (url, data, success, error) => {
    if (typeof data === 'function') {
        error = success;
        success = data;
    }
    $.ajax({
        url: T.url(url),
        data,
        type: method.toUpperCase(),
        success: data => success && success(data),
        error: data => {
            console.error('Ajax (' + method + ' => ' + url + ') has error. Error:', data);
            error && error(data)
        }
    })
});


$(() => {
    $(window).resize(T.onResize);
    setTimeout(T.onResize, 100);
});

T.ftcoAnimate = (timeOut = 250) => {
    setTimeout(() => {
        let i = 0;
        $('.ftco-animate').waypoint(function (direction) {
            if (direction === 'down' && !$(this.element ? this.element : this).hasClass('ftco-animated')) {
                i++;
                $(this.element ? this.element : this).addClass('item-animate');
                setTimeout(function () {
                    $('body .ftco-animate.item-animate').each(function (k) {
                        let el = $(this);
                        setTimeout(function () {
                            let effect = el.data('animate-effect');
                            if (effect === 'fadeIn') {
                                el.addClass('fadeIn ftco-animated');
                            } else if (effect === 'fadeInLeft') {
                                el.addClass('fadeInLeft ftco-animated');
                            } else if (effect === 'fadeInRight') {
                                el.addClass('fadeInRight ftco-animated');
                            } else {
                                el.addClass('fadeInUp ftco-animated');
                            }
                            el.removeClass('item-animate');
                        }, k * 50, 'easeInOutExpo');
                    });

                }, 100);
            }
        }, { offset: '95%' });
    }, timeOut)
};

T.clone = function () {
    let result = {};
    for (let i = 0, length = arguments.length; i < length; i++) {
        const obj = JSON.parse(JSON.stringify(arguments[i]));
        Object.keys(obj).forEach(key => result[key] = obj[key]);
    }
    return result;
};

export default T;


String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.upFirstChar = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lowFirstChar = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

//Array prototype -----------------------------------------------------------------------------------------------------
Array.prototype.contains = function (...pattern) {
    return pattern.reduce((result, item) => result && this.includes(item), true);
};

Date.prototype.getText = function () {
    return T.get2(this.getDate()) + '/' + T.get2(this.getMonth() + 1) + '/' + this.getFullYear() + ' ' + T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getTimeText = function () {
    return T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getDateText = function () {
    return T.get2(this.getDate()) + '/' + T.get2(this.getMonth() + 1) + '/' + this.getFullYear();
};
Date.prototype.getShortText = function () {
    return this.getFullYear() + '/' + T.get2(this.getMonth() + 1) + '/' + T.get2(this.getDate()) + ' ' + T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getDayText = function () {
    return ['thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy', 'chủ nhật'][this.getDay()];
}