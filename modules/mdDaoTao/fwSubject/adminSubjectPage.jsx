import React from 'react';
import { connect } from 'react-redux';
import { getSubjectInPage, createSubject, deleteSubject } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const newData = { title: this.itemTitle.value(), };
        if (newData.title == '') {
            T.notify('Tên môn học bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createSubject(newData, data => {
                this.hide();
                data && data.item && this.props.history.push('/user/dao-tao/mon-hoc/edit/' + data.item._id);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Môn học mới',
        body:
            <FormTextBox ref={e => this.itemTitle = e} label='Tên môn học' />
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
        e.preventDefault();
        this.modal.current.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteSubject(item._id));
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
            breadcrumb: ['Môn học'],
            content: <>

                <div className='tile'>{table}
                    {permission.write ?
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button type='button' className='btn btn-success' onClick={this.create}>
                                <i className='fa fa-lg fa-plus' /> Thêm
                            </button>
                        </div> : null
                    }
                </div>
                <Pagination name='pageSubject' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getSubjectInPage} />
                <SubjectModal ref={this.modal} createSubject={this.props.createSubject} history={this.props.history} />
            </>,
        };
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubjectInPage, createSubject, deleteSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminListSubject);