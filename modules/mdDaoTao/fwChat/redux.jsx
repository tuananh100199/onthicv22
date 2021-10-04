import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ChatGetAll = 'ChatGetAll';
const ChatGetPage = 'ChatGetPage';
const ChatGetItem = 'ChatGetItem';

export default function ChatReducer(state = {}, data) {
    switch (data.type) {
        case ChatGetAll:
            return Object.assign({}, state, {});
        case ChatGetPage:
            return Object.assign({}, state, { page: data.page });

        case ChatGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageChat');
export function getOldMessage(roomId, createAt, numMessage, done) {
    return (dispatch) => {
        const url = '/api/chat';
        T.get(url, { roomId, createAt, numMessage }, data => {
            if (data.error) {

                T.notify('Lấy danh sách học viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: ChatGetItem });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách học viên bị lỗi!', 'danger'));
    };
}

export function createMessage(data, done) {
    return dispatch => {
        const url = '/api/chat';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Gửi tin nhắn bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch({ type: ChatGetItem });
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('Tạo khóa học bị lỗi!', 'danger'));
    };
}

export function getAdminChatByStudent(courseId, done) {
    return (dispatch) => {
        const url = '/api/chat/student';
        T.get(url, { courseId }, data => {
            if (data.error) {

                T.notify('Lấy danh sách liên hệ bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: ChatGetItem });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách liên hệ bị lỗi!', 'danger'));
    };
}

export function getRoomId(courseId, done) {
    return (dispatch) => {
        const url = '/api/chat/room';
        T.get(url, { courseId }, data => {
            if (data.error) {

                T.notify('Lấy danh sách phòng chat bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: ChatGetItem });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách phòng chat bị lỗi!', 'danger'));
    };
}