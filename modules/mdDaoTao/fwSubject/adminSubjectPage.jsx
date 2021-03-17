import React from 'react';
import { connect } from 'react-redux';
import { getSubjectInPage, createSubject, deleteSubject } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => {
            this.onShown(() => $('#subjectName').focus());
        });
    }

    onShow = () => $('#subjectName').val('');

    onSubmit = () => {
        const newData = { title: $('#subjectName').val() };
        if (newData.title == '') {
            T.notify('Tên môn học bị trống!', 'danger');
            $('#subjectName').focus();
        } else {
            this.props.createSubject(newData, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/dao-tao/mon-hoc/edit/' + data.item._id);
                }
            });
        }
    }

    render = () => this.renderModal({
        title: 'Môn học mới',
        body:
            <div className='form-group'>
                <label htmlFor='subjectName'>Tên môn học</label>
                <input className='form-control' id='subjectName' type='text' placeholder='Nhập môn học' autoFocus={true} />
            </div>
    });
}

class AdminListSubject extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.props.getSubjectInPage();
        T.ready('/user/dao-tao/mon-hoc', null);
        T.onSearch = (searchText) => this.props.getSubjectInPage(null, null, searchText);
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    delete = (e, item) => {
        T.confirm('Môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteSubject(item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('subject');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.subject && this.props.subject.page ?
            this.props.subject.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có loại Môn học!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tiêu đề</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><Link to={'/user/dao-tao/mon-hoc/edit/' + item._id}>{item.title}</Link></td>
                                {permission.write || permission.delete ? <td>
                                    <div className='btn-group'>
                                        {permission.write ?
                                            <Link to={'/user/dao-tao/mon-hoc/edit/' + item._id} className='btn btn-primary'>
                                                <i className='fa fa-lg fa-edit' />
                                            </Link> : null}
                                        {permission.delete || permission.write ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        const renderData = {
            icon: 'fa fa-briefcase',
            title: 'Môn học',
            breadcrumb: [],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageSubject' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getSubjectInPage} />
                {permission.write ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                    : null
                }
                <SubjectModal ref={this.modal} createSubject={this.props.createSubject} history={this.props.history} />
            </>,
        };
        return this.renderListPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubjectInPage, createSubject, deleteSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminListSubject);