import React from 'react';

import { AdminModal, FormRichTextBox, FormCheckbox, FormImageBox } from 'view/component/AdminPage';

export default class QuestionModal extends AdminModal {
    state = { answers: '' };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, answers, trueAnswer, image, active } = item || { _id: null, title: '', answers: '', trueAnswer: 0, active: true };
        this.itemTitle.value(title)
        this.imageBox.setData(`questionImage:${_id || 'new'}`);
        this.itemAnswers.value(answers);
        this.itemActive.value(active);

        this.setState({ _id, image, answers, trueAnswer });
    }

    onSubmit = () => {
        const { create, update, parentId } = this.props,
            answers = this.state.answers.split('\n'),
            data = {
                title: this.itemTitle.value(),
                answers: this.state.answers,
                trueAnswer: this.state.trueAnswer < answers.length ? this.state.trueAnswer : 0,
                active: this.itemActive.value(),
                image: this.state.image,
            };
        if (data.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.answers == '') {
            T.notify('Câu trả lời bị trống!', 'danger');
            this.itemAnswers.focus();
        } else if (data.trueAnswer == null) {
            T.notify('Đáp án bị trống!', 'danger');
        } else {
            this.state._id ? update(parentId, this.state._id, data, this.hide) : create(parentId, data, this.hide);
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change && this.props.change(item);
        }
    }

    setTrueAnswer = (e, trueAnswer) => e.preventDefault() || this.setState({ trueAnswer });

    deleteImage = () => T.confirm('Xoá hình minh họa', 'Bạn có chắc bạn muốn xoá hình minh họa này?', true, isConfirm =>
        isConfirm && this.props.deleteImage && this.props.deleteImage(this.state._id, () => this.setState({ image: null })));

    render = () => {
        const readOnly = this.props.readOnly,
            answers = this.state.answers.split('\n'),
            trueAnswer = this.state.trueAnswer < answers.length ? this.state.trueAnswer : 0,
            defaultStyle = { width: '40px', height: '40px', lineHeight: '40px', borderRadius: '50%', textAlign: 'center', marginLeft: '8px', cursor: 'pointer' },
            listAnswers = [],
            listTrueAnswers = answers.map((item, index) => {
                listAnswers.push(<p key={index}>{index + 1}. {item}</p>)
                const trueAnswerStyle = trueAnswer == index ? { color: 'white', backgroundColor: '#28a745' } : {};
                return <label key={index} style={{ ...defaultStyle, ...trueAnswerStyle }} onClick={e => !readOnly && this.setTrueAnswer(e, index)}>{index + 1}</label>
            });

        return this.renderModal({
            title: 'Câu hỏi',
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox ref={e => this.itemTitle = e} className='col-md-8' label='Câu hỏi' rows='6' readOnly={readOnly} />
                <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình minh họa' uploadType='questionImage' image={this.state.image}
                    onDelete={this.state._id ? this.deleteImage : null} onSuccess={this.onUploadSuccess} readOnly={readOnly} />

                <FormRichTextBox ref={e => this.itemAnswers = e} className='col-md-12' label='Danh sách câu trả lời' rows='5' onChange={e => this.setState({ answers: e.target.value })} readOnly={readOnly} style={{ display: readOnly ? 'none' : 'block' }} />
                <div className='col-md-12' style={{ display: readOnly ? 'block' : 'none' }}>
                    <label>Danh sách câu trả lời</label>
                    <b>{listAnswers}</b>
                </div>
                <label className='col-md-12'>Đáp án:{listTrueAnswers}</label>

                <FormCheckbox ref={e => this.itemActive = e} className='col-md-4' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    };
}

export function createQuestion(type, _parentId, data, done) {
    const url = `/api/${type}/question`;
    T.post(url, { _parentId, data }, data => {
        if (data.error) {
            T.notify('Tạo câu hỏi bị lỗi!', 'danger');
            console.error('POST: ' + url + '.', data.error);
        } else {
            done && done(data.item);
        }
    }, error => console.error('POST: ' + url + '.', error));
}

export function updateQuestion(type, _parentId, _questionId, data, done) {
    const url = `/api/${type}/question`;
    T.put(url, { _parentId, _questionId, data }, data => {
        if (data.error) {
            T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
            console.error('PUT: ' + url + '.', data.error);
        } else {
            T.notify('Cập nhật câu hỏi thành công!', 'success');
            done && done();
        }
    }, error => console.error('PUT: ' + url + '.', error));
}

export function swapQuestion(type, _parentId, _questionId, isMoveUp, done) {
    const url = `/api/${type}/question/swap`;
    T.put(url, { _parentId, _questionId, isMoveUp }, data => {
        if (data.error) {
            T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
            console.error('PUT: ' + url + '.', data.error);
        } else {
            done && done();
        }
    }, error => console.error('PUT: ' + url + '.', error));
}

export function deleteQuestion(type, _parentId, _questionId, done) {
    const url = `/api/${type}/question`;
    T.delete(url, { _parentId, _questionId }, data => {
        if (data.error) {
            T.notify('Xóa câu hỏi bị lỗi!', 'danger');
            console.error('DELETE: ' + url + '.', data.error);
        } else {
            T.notify('Xóa câu hỏi thành công!', 'success');
            done && done();
        }
    }, error => console.error('DELETE: ' + url + '.', error));
}