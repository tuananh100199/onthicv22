import React from 'react';
import { connect } from 'react-redux';
import {getDriveQuestionPage, getDriveQuestionItem, createDriveQuestion, deleteDriveQuestion, updateDriveQuestion, ajaxSelectDriveQuestion, swapDriveQuestion } from './redux';
import ImageBox from 'view/component/ImageBox';
import { Select } from 'view/component/Input';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';


class QuestionModal extends AdminModal {
    imageBox = React.createRef();

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, active, image, answers, result, importance, categories } = item ? item: { _id: null, title: '', active: false, image: '', answers: '', result: 0, importance: false, categories: [] };
        item ? this.setState(item) : this.setState({_id: null});
        this.itemTitle.value(title);
        this.itemAnswers.value(answers);
        this.itemIsActive.value(active);
        this.itemIsImportance.value(importance);
        this.itemCategories.val(categories.map(item => item._id));
        this.itemImage.setData('driveQuestion:' + _id, image ? image : '/img/avatar.jpg');
        if (answers) {  
            this.handleSplit(answers, (options) => {
                this.itemResult.val(options[result - 1]);
            });    
        } else {
            this.itemResult.val('');
            this.setState({result: ''});
        }
        $(this.modal.current).modal('show');
    }
    
    onSubmit = () => {
        let newData = {
            title: this.itemTitle.value(),
            answers: this.itemAnswers.value(),
            active: this.itemIsActive.value(),
            importance: this.itemIsImportance.value(),
            result: this.itemResult.val(),
            categories: this.itemCategories.val()
        };
        if (newData.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            this.itemTitle.focus();
        } else if(newData.answers!='' && newData.result == '') {
            T.notify('Kết quả bị trống!', 'danger');

        } else {
            !this.state._id ? this.props.createDriveQuestion(newData) : this.props.updateDriveQuestion(this.state._id, newData);
            this.hide();
        }
    }

    handleSplit = (str, done) => {
        let ret = str.trim().split('\n');
        for (let i = 0; i < ret.length; i++) {
            if (ret[i] == '') ret.splice(i, 1);
        }
        let options = ret.map((item, index) => ({ id: index +1, text: item }))
        this.setState({result: options}, () => {
            done && done(options)
        });
    }
    handleChange = (event) => {
        this.handleSplit(event.target.value);
    }
      
    render = () => this.renderModal({
        title: 'Câu hỏi mới',
        size: 'large',
        body:
            <>
                <div className='row'>
                    <div className='col-md-8'>
                        <FormRichTextBox ref={e => this.itemTitle = e} label='Tên câu hỏi' />
                        <FormCheckbox ref={e => this.itemIsActive = e} label='Kích hoạt' />
                        <FormCheckbox ref={e => this.itemIsImportance = e} label='Câu điểm liệt' />
                    </div>
                    <div className='col-md-4'>
                        <label>Hình đại diện</label>
                        <ImageBox ref={e => this.itemImage = e} postUrl='/user/upload' uploadType='DriveQuestionImage' image={ this.state.image } />
                    </div> 
                </div> 
                <Select ref={e => this.itemCategories = e} displayLabel={true} adapter={ajaxSelectDriveQuestion} multiple={true} label='Loại khóa học' />
                <FormRichTextBox ref={e => this.itemAnswers= e} label='Danh sách câu trả lời' rows='4'  onChange={this.handleChange} />
                <Select 
                    ref={e => this.itemResult = e}
                    displayLabel={true}
                    label='Đáp án'
                    adapter={{
                        ajax: true,
                        processResults: () => ({
                            results: this.state.result ? this.state.result : []
                        })
                    }} />
            </>
    });

}

class AdminQuestionPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDriveQuestionPage();
        T.ready();
        T.showSearchBox();
        T.onSearch = (searchText) => this.props.getDriveQuestionPage(searchText);
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    show = (e, _id) => {
        e.preventDefault();
        this.props.getDriveQuestionItem(_id, data => {
            this.modal.current.show(data.item)
        });
    }
    
    swapQuestion = (e, _questionId, isMoveUp) => e.preventDefault() || this.props.swapDriveQuestion(_questionId, isMoveUp);

    delete = (e, item) => {
        T.confirm('Xóa câu hỏi thi', 'Bạn có chắc bạn muốn xóa câu hỏi thi này?', true, isConfirm => isConfirm && this.props.deleteDriveQuestion(item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('driveQuestion');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.driveQuestion && this.props.driveQuestion.page ?
            this.props.driveQuestion.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có câu hỏi thi!';
        if (list && list.length >0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên câu hỏi thi</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.show(e, item._id)}>
                                        {item.title}
                                    </a>
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active}
                                            onChange={() => permission.write && this.props.updateDriveQuestion(item._id, { active: item.active ? 0 : 1 }) } />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.jpg'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                {permission.write || permission.delete ? <td>
                                    <div className='btn-group'>
                                        {permission.write ? <a className='btn btn-success' href='#' onClick={e => this.swapQuestion(e, item._id, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a> : null}
                                        {permission.write ? <a className='btn btn-success' href='#' onClick={e => this.swapQuestion(e, item._id, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a> : null}
                                        {permission.delete || permission.write ?
                                            <a className='btn btn-primary' href='#' onClick={e => this.show(e, item._id)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a> : null}
                                        {permission.delete ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td> : null}
                            </tr>))}
                    </tbody>
                </table>
            );
        }

        const renderData = {
            icon: 'fa fa-list-alt',
            title: 'Câu hỏi thi',
            breadcrumb: ['Câu hỏi thi'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageDKTVList' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDriveQuestionPage} />
                <QuestionModal ref={this.modal} createDriveQuestion={this.props.createDriveQuestion} updateDriveQuestion={this.props.updateDriveQuestion} history={this.props.history} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.create;
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, driveQuestion: state.driveQuestion, driveQuestionCategory: state.driveQuestionCategory });
const mapActionsToProps = { getDriveQuestionPage, getDriveQuestionItem, createDriveQuestion, deleteDriveQuestion, updateDriveQuestion, swapDriveQuestion };
export default connect(mapStateToProps, mapActionsToProps)(AdminQuestionPage);
