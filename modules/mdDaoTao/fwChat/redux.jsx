import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ChatGetAll = 'ChatGetAll';
const ChatGetPage = 'ChatGetPage';
const ChatGetItem = 'ChatGetItem';

const ChatUpdateState = 'ChatUpdateState';
const ChatReadAllChats = 'ChatReadAllChats';
const ChatGetUserChats = 'ChatGetUserChats';
const ChatGetAllChats = 'ChatGetAllChats';
const ChatAddChat = 'ChatAddChatState';

export default function ChatReducer(state = { users: [] }, data) {
    switch (data.type) {
        case ChatReadAllChats: {
            const users = state.users || [];
            const targetUser = users.find(user => user._id == data._selectedUserId);
            targetUser && targetUser.chats.forEach(chat => chat.read = true);
            return Object.assign({}, state, { users });
        }

        case ChatGetUserChats: {
            // const users = state.users || [],
            //     selectedUser = users.find(user => user._id == data._selectedUserId);
            // if (selectedUser) {
            //     data.chats.forEach(chat => chat.read = true);
            //     selectedUser.chats = (selectedUser.chats || []).concat(data.chats);
            // }
            return Object.assign({}, state, data.chats);
            //return Object.assign({}, state, { users });
        }

        case ChatGetAllChats: {
            const users = state.users || [];
            data.chats.forEach(chat => chat.read = true);
            return Object.assign({}, state, { users });
        }

        case ChatAddChat: {
            const users = state.users || [];
            const chatUser = Object.assign({}, data.isSenderChat ? data.chat.receiver : data.chat.sender);
            const targetUser = users.find(user => user._id == chatUser._id);
            if (targetUser) {
                targetUser.chats.unshift(data.chat);
            } else {
                chatUser.chats = [data.chat];
                users.unshift(chatUser);
            }
            return Object.assign({}, state, { users });
        }

        case ChatUpdateState:
            return Object.assign({}, state, data.state);

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

export function readAllChats(_selectedUserId) {
    return dispatch => {
        // const language = T.language(texts);
        const url = '/api/chat/read-all';
        T.put(url, { _selectedUserId }, data => {
            if (data.error) {
                T.notify('System has errors!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch({ type: ChatReadAllChats, _selectedUserId });
            }
        }, error => console.error(error) || T.notify('System has errors!', 'danger'));
    };
}

export function getUserChats(_selectedUserId, sent, done) {
    return dispatch => {
        // const language = T.language(texts);
        const url = '/api/chat/user';
        T.get(url, { _selectedUserId, sent }, data => {
            if (data.error) {
                T.notify('System has errors!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else if (data.selectedUser && data.chats) {
                dispatch({ type: ChatGetUserChats, _selectedUserId, chats: data.chats });
            }
            done && done(data);
        }, error => console.error(error) || T.notify('System has errors!', 'danger'));
    };
}

export function getAllChats(_courseId, sent, done) {
    return dispatch => {
        const url = '/api/chat/all';
        T.get(url, { _courseId, sent }, data => {
            if (data.error) {
                T.notify('System has errors!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else if (data.chats) {
                dispatch({ type: ChatGetUserChats, chats: data.chats });
            }
            done && done(data);
        }, error => console.error(error) || T.notify('System has errors!', 'danger'));
    };
}

export function addChat(isSenderChat, chat) {
    return { type: ChatAddChat, isSenderChat, chat };
}

export function updateChatState(state) {
    delete state.error;
    return { type: ChatUpdateState, state };
}

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