import React from 'react';

import { AdminModal, FormRichTextBox, FormCheckbox, FormImageBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class QuestionModal extends AdminModal {
    state = { answers: '' };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, answers, trueAnswer, image, active } = item || { _id: null, title: '', answers: '', trueAnswer: 0, active: true };
        this.itemTitle.value(title);
        this.imageBox.setData(`questionImage:${_id || 'new'}`);
        this.itemAnswers.value(answers);
        this.itemActive.value(active);

        this.setState({ _id, image, answers, trueAnswer });
    }

    onSubmit = () => {
        const { create, update } = this.props,
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
            this.state._id ? update({ _id: this.state._id }, data, this.hide) : create(data, this.hide);
        }
    }

    // eslint-disable-next-line no-unused-vars
    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            image && this.state._id && this.props.change && this.props.change({ questionId: this.state._id, image });
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
                listAnswers.push(<p key={index}>{index + 1}. {item}</p>);
                const trueAnswerStyle = trueAnswer == index ? { color: 'white', backgroundColor: '#28a745' } : {};
                return <label key={index} style={{ ...defaultStyle, ...trueAnswerStyle }} onClick={e => !readOnly && this.setTrueAnswer(e, index)}>{index + 1}</label>;
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

export class QuestionView extends React.Component {
    showQuestionModal = (e, question) => e.preventDefault() || this.modalQuestion.show(question);

    createQuestion = (data, done) => {
        const { type, changeQuestions, parentId: parentId } = this.props;
        const url = `/api/question/${type}`;
        T.post(url, { parentId, data }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                changeQuestions && changeQuestions(data);
                done && done();
            }
        }, error => console.error('POST: ' + url + '.', error));
    }

    updateQuestion = (question, data, done) => {
        const { type, changeQuestions, parentId: parentId } = this.props,
            questionId = question._id;
        const url = `/api/question/${type}`;
        T.put(url, { parentId, questionId, data }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật câu hỏi thành công!', 'success');
                changeQuestions && changeQuestions(data);
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }

    swapQuestion = (e, question, isMoveUp) => {
        e.preventDefault();
        const { type, changeQuestions, parentId: parentId } = this.props,
            questionId = question._id;
        const url = `/api/question/${type}/swap`;
        T.put(url, { parentId, questionId, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                changeQuestions && changeQuestions(data);
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }

    deleteQuestion = (e, question) => e.preventDefault() || T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${question.title}</strong>?`, true, isConfirm => {
        if (isConfirm) {
            const { type, changeQuestions, parentId: parentId } = this.props,
                questionId = question._id;
            const url = `/api/question/${type}`;
            T.delete(url, { parentId, questionId }, data => {
                if (data.error) {
                    T.notify('Xóa câu hỏi bị lỗi!', 'danger');
                    console.error('DELETE: ' + url + '.', data.error);
                } else {
                    T.notify('Xóa câu hỏi thành công!', 'success');
                    changeQuestions && changeQuestions(data);
                }
            }, error => console.error('DELETE: ' + url + '.', error));
        }
    });

    changeQuestionImage = ({ questionId, image }) => {
        const questions = this.props.questions.map(item => item._id == questionId ? Object.assign({}, item, { image }) : Object.assign({}, item));
        this.props.changeQuestions && this.props.changeQuestions({ questions });
    }

    render() {
        const { className, permission, questions } = this.props;
        const tableQuestion = renderTable({
            getDataSource: () => questions,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên câu hỏi</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.showQuestionModal(e, item)} />
                    <TableCell type='image' content={item.image} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.updateQuestion(item, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showQuestionModal} onSwap={this.swapQuestion} onDelete={this.deleteQuestion} />
                </tr>),
        });

        return (
            <div className={className}>
                {tableQuestion}
                {permission.write ? <CirclePageButton type='create' onClick={this.showQuestionModal} /> : null}
                <QuestionModal ref={e => this.modalQuestion = e} create={this.createQuestion} update={this.updateQuestion} change={this.changeQuestionImage} readOnly={!permission.write} />
            </div>);
    }
}