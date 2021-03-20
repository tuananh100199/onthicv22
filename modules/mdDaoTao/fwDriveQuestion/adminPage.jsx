import React from 'react';
import { connect } from 'react-redux';
import { getAllDriveQuestions, getDriveQuestionItem, createDriveQuestion, deleteDriveQuestion, updateDriveQuestion, ajaxSelectDriveQuestion } from './redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import { Select } from 'view/component/Input';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, FormEditor, FormRichTextBox } from 'view/component/AdminPage';


class QuestionModal extends AdminModal {
    imageBox = React.createRef();
    itemResult = React.createRef();

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, active, image, answers, result, importance, categories } = item ? item: { _id: null, title: '', active: false, image: '', answers: '', result: 0, importance: false, categories: [] };
        item ? this.setState(item) : this.setState({_id: null});
        this.itemTitle.value(title);
        this.itemAnswers.value(answers);
        this.itemResult.current.val();
        this.itemIsActive.value(active);
        this.itemIsImportance.value(importance);
        this.itemCategories.val(categories.map(item => item._id));
        this.itemImage.setData('driveQuestion:' + _id, image ? image : '/img/avatar.jpg');

        if(answers) {   
            this.handleSplit(answers);
        }
        $(this.modal.current).modal('show');
    }
    

    onSubmit = () => {
        let newData = {
            title: this.itemTitle.value(),
            answers: this.itemAnswers.value(),
            active: this.itemIsActive.value(),
            importance: this.itemIsImportance.value(),
            result: this.itemResult.current.val(),
            categories: this.itemCategories.val()
        };

        if (newData.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            this.itemTitle.focus();
        }else if(newData.result == '') {
            T.notify('Kết quả bị trống!', 'danger');

        } else {
            !this.state._id ? this.props.createDriveQuestion(newData) : this.props.updateDriveQuestion(this.state._id, newData);
            this.hide();
        }
    }
    handleSplit = (str) => {
        let ret = str.trim().split('\n');
        for (let i = 0; i < ret.length; i++) {
            if (ret[i] == '') ret.splice(i, 1);
        }
        let options = ret.map((item, index) => ({ id: index, text: item }))
        this.setState({result: options});
    }
    handleChange = (event) => {
        this.handleSplit(event.target.value);
    };
      
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
                    ref={this.itemResult} 
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
        this.props.getAllDriveQuestions();
        T.ready();
        T.showSearchBox();
        T.onSearch = (searchText) => this.props.getAllDriveQuestions(searchText);
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
    

    delete = (e, item) => {
        T.confirm('Xóa câu hỏi thi', 'Bạn có chắc bạn muốn xóa câu hỏi thi này?', true, isConfirm => isConfirm && this.props.deleteDriveQuestion(item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('driveQuestion');
        let table = 'Không có câu hỏi thi!';
        if (this.props.driveQuestion && this.props.driveQuestion.list && this.props.driveQuestion.list.length > 0) {
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
                        {this.props.driveQuestion.list.map((item, index) => (
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
                </table>);
        }

        const renderData = {
            icon: 'fa fa-list-alt',
            title: 'Câu hỏi thi',
            breadcrumb: ['Câu hỏi thi'],
            content: <>
                <div className='tile'>{table}</div>
                <QuestionModal ref={this.modal} createDriveQuestion={this.props.createDriveQuestion} updateDriveQuestion={this.props.updateDriveQuestion} history={this.props.history} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.create;
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, driveQuestion: state.driveQuestion, driveQuestionCategory: state.driveQuestionCategory });
const mapActionsToProps = { getAllDriveQuestions, getDriveQuestionItem, createDriveQuestion, deleteDriveQuestion, updateDriveQuestion };
export default connect(mapStateToProps, mapActionsToProps)(AdminQuestionPage);
