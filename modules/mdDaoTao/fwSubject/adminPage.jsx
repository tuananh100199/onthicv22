import React from 'react';
import { connect } from 'react-redux';
import { getSubjectPage, createSubject, deleteSubject } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class SubjectModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const data = { title: this.itemTitle.value(), };
        if (data.title == '') {
            T.notify('Tên môn học bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createSubject(data, data => {
                this.hide();
                data && data.item && this.props.history.push('/user/dao-tao/mon-hoc/' + data.item._id);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Môn học mới',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên môn học' />
    });
}

class AdminListSubject extends AdminPage {
    componentDidMount() {
        this.props.getSubjectPage();
        T.ready('/user/dao-tao/mon-hoc', null);
        T.onSearch = (searchText) => this.props.getSubjectPage(null, null, searchText);
    }

    create = e => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteSubject(item._id));

    render() {
        const permission = this.getUserPermission('subject');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.subject && this.props.subject.page ?
            this.props.subject.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };

        const table = renderTable({
            getDataSource: () => this.props.subject && this.props.subject.page && this.props.subject.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tiêu đề</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số bài học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số câu hỏi</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/dao-tao/mon-hoc/' + item._id} />
                    <TableCell type='number' content={item.lessons ? item.lessons.length : 0} />
                    <TableCell type='number' content={item.questions ? item.questions.length : 0} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/dao-tao/mon-hoc/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-briefcase',
            title: 'Môn học',
            breadcrumb: ['Môn học'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageSubject' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getSubjectPage} />
                <SubjectModal ref={e => this.modal = e} createSubject={this.props.createSubject} history={this.props.history} readOnly={!permission.write} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubjectPage, createSubject, deleteSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminListSubject);