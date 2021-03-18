import React from 'react';
import { connect } from 'react-redux';
import { getAllDriveQuestionCategory, createDriveQuestionCategory, deleteDriveQuestionCategory, updateDriveQuestionCategory,  getDriveQuestionCategoryItem } from './reduxDriveQuestionCategory';

import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox } from 'view/component/AdminPage';

class CategoryModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const newData = { title: this.itemTitle.value() };
        if (newData.title == '') {
            T.notify('Tên loại câu hỏi thi bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createDriveQuestionCategory(newData, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/drive-question-category/edit/' + data.item._id);
                }
            });
        }
    }

    render = () => this.renderModal({
        title: 'Loại câu hỏi thi mới',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên loại câu hỏi thi' />
    });
}

class DriveQuestionCategoryPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready();
        this.props.getAllDriveQuestionCategory();
        T.onSearch = (searchText) => this.props.getAllDriveQuestionCategory(searchText);
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    edit = (e, _id) => {
        this.props.getDriveQuestionCategoryItem(_id, item => this.modal.current.show(item));
        e.preventDefault();
    }

    delete = (e, item) => {
        T.confirm('Xóa loại câu hỏi thi', 'Bạn có chắc bạn muốn xóa loại câu hỏi thi này?', true, isConfirm => isConfirm && this.props.deleteDriveQuestionCategory(item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('driveQuestionCategory');
        let table = 'Không có loại câu hỏi thi!';
        if (this.props.driveQuestionCategory && this.props.driveQuestionCategory.list && this.props.driveQuestionCategory.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên loại câu hỏi thi</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.driveQuestionCategory.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'/user/drive-question-category/edit/' + item._id}>{item.title}</Link></td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.isOutside}
                                            onChange={() => permission.write && this.props.updateDriveQuestionCategory(item._id, { isOutside: item.isOutside ? 0 : 1 }, () => T.notify('Cập nhật loại câu hỏi thi thành công!', 'success'))} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                {permission.write || permission.delete ? <td>
                                    <div className='btn-group'>
                                        {permission.delete || permission.write ?
                                            <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item._id)}>
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
            icon: 'fa fa-university',
            title: 'Loại câu hỏi thi',
            breadcrumb: ['Loại câu hỏi thi'],
            content: <>
                <div className='tile'>{table}</div>
                <CategoryModal ref={this.modal} createDriveQuestionCategory={this.props.createDriveQuestionCategory} history={this.props.history} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.create;
        return this.renderListPage(renderData);
    }
}


const mapStateToProps = state => ({ system: state.system, driveQuestionCategory: state.driveQuestionCategory });
const mapActionsToProps = {getAllDriveQuestionCategory, createDriveQuestionCategory, deleteDriveQuestionCategory, updateDriveQuestionCategory, getDriveQuestionCategoryItem};
export default connect(mapStateToProps, mapActionsToProps)(DriveQuestionCategoryPage);
