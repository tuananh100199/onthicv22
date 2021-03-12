import T from 'view/js/common';

T.initCookiePage('pageEventRegister');

// Reducer -------------------------------------------------------------------------------------------------------------
const GET_ANSWERS_IN_PAGE = 'answer:getAnswersInPage';
const UPDATE_ITEM = 'answer:updateAnswer';
const GET_ANSWER_LIST = 'answer:getAnswersByQuestions';
const GET_POST_ANSWER_LIST = 'answer:getAnswersByPost';
const ADD_ANSWER_BY_ADMIN = 'answer:addAnswerByAdmin';

export default function answerReducer(state = null, data) {
    switch (data.type) {
        case GET_ANSWERS_IN_PAGE:
            return Object.assign({}, state, { page: data.page });

        case UPDATE_ITEM: {
            let page = state && state.page ? state.page : { list: [] }, list = page.list;
            let i = 0;
            for (i; i < list.length; i++) {
                if (list[i]._id == data.item._id) {
                    break;
                }
            }
            list.splice(i, 1, data.item);
            page.list = list;
            return Object.assign({}, state, { page });
        }

        // case GET_ANSWER_LIST:
        //     return Object.assign({}, state, { userAnswers: data.items });

        // case GET_POST_ANSWER_LIST:
        //     return Object.assign({}, state, { answers: data.page });

        // case ADD_ANSWER_BY_ADMIN:
        //     let answers = state.answers ? state.answers : [];
        //     if (data.answer) answers.push(data.answer);
        //     return Object.assign({}, state, { answers: answers });
        default:
            return state;
    }
}

T.initCookiePage('pageAnswer');
export function getAnswerInPage(formId, pageNumber, pageSize, done) {
    const page = T.updatePage('pageAnswer', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/answer/page/${formId}/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu trả lời bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
                dispatch({ type: GET_ANSWERS_IN_PAGE, page: data.page });
            }
        }, () => T.notify('Lấy danh sách câu trả lời bị lỗi!', 'danger'));
    }
}

export function getAnswer(_id, done) {
    return dispatch => {
        const url = `/api/answer/item/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy câu trả lời bị lỗi', 'danger');
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy câu trả lời bị lỗi', 'danger'));
    }
}

export function searchUserFromSystem(email, done) {
    return dispatch => {
        const url = `/api/user-search/${email}`;
        T.get(url, data => {
            done && done(data);
        }, () => done && done({ error: true }));
    }
}

export function addAnswer(newData, formId, done) {
    return dispatch => {
        const url = '/api/answer';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Thêm câu trả lời bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.exist) {
                T.notify('Người dùng đã có trong danh sách đăng ký!', 'warning');
            } else {
                dispatch(getAnswerInPage(formId));
                done && done(data.item);
            }
        }, error => T.notify('Thêm câu trả lời bị lỗi!', 'danger'));
    }
}

export function updateAnswer(_id, changes, done) {
    return dispatch => {
        const url = '/api/answer';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật câu trả lời bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data.item);
                dispatch({ type: UPDATE_ITEM, item: data.item });
            }
        }, () => T.notify('Cập nhật câu trả lời bị lỗi!', 'danger'));
    }
}

export function deleteAnswer(_id, formId, done) {
    return dispatch => {
        const url = '/api/answer';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá câu trả lời bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xoá câu trả lời thành công!', 'success', false, 1000);
                done && done();
                dispatch(getAnswerInPage(formId));
            }
        }, error => T.alert('Xoá câu trả lời bị lỗi!', 'error'));
    }
}

export function deleteManyAnswerByAdmin(postId, done) {
    const url = '/api/answer/post/' + postId;
    T.delete(url, data => {
        if (data.error) {
            T.notify('Xoá câu trả lời bị lỗi!', 'danger');
            console.error('DELETE: ' + url + '.', data.error);
        } else {
            if (done) done(data);
            T.notify('Xoá câu trả lời thành công!', 'success');
        }
    }, error => T.notify('Xoá câu trả lời bị lỗi!', 'danger'));
}

export function importRegisters(formId, questions, done) {
    return dispatch => {
        const url = '/api/answer/import';
        T.post(url, { formId, questions }, data => {
            if (data.error || !data.success) {
                T.notify(data.error, 'error');
            } else {
                T.notify('Tải lên thành công!', 'success');
                done && done(data);
                dispatch(getAnswerInPage(formId));
            }
        }, error => console.error(error));
    }
}

export function exportRegisters(formId, formName) {
    return dispatch => {
        T.download(T.url(`/api/answer/export/${formId}`), formName + '.xlsx');
    }
}
// Actions (user) -----------------------------------------------------------------------------------------------------
export function getAnswerByUser(formId, done) {
    return dispatch => {
        const url = `/api/user-answer/${formId}`
        T.get(url, data => {
            if (data.error) {
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.answer);
            }
        }, (error) => console.error('GET: ' + url + '.', error));
    }
}

export function addAnswerByUser(newData, done) {
    return dispatch => {
        const url = '/answer';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.exist) {
                !done && T.notify('Bạn đã đăng ký tham gia!', 'warning');
                done && done(data.item);
            } else {
                !done && T.notify('Đăng ký tham gia thành công!', 'info');
                done && done(data.item);
            }
        }, error => T.notify('Đăng ký bị lỗi!', 'danger'));
    }
}

export function updateAnswerByUser(_id, changes, done) {
    return dispatch => {
        const url = '/answer';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                done && done(data.item);
            }
        }, error => T.notify('Cập nhật bị lỗi!', 'danger'));
    }
}

export function countAnswer(formId, done) {
    return dispatch => {
        const url = `/api/answer/count/${formId}`;
        T.get(url, data => {
            if (data.error) {
                console.error('GET: ' + url + ' has error!');
            } else {
                done && done(data.total);
            }
        }, () => console.error('GET: ' + url + ' has error!'));
    }
}

export function clearParticipantsSession() {
    return dispatch => {
        const url = '/api/answer/clear-participants-session';
        T.delete(url);
    }
}
