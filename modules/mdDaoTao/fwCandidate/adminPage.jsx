import React from 'react';
import { connect } from 'react-redux';
import { getCandidatePage, getCandidate, updateCandidate, deleteCandidate, exportCandidateToExcel } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable } from 'view/component/AdminPage';

class AdminCandidateModal extends AdminModal {
    state = {};

    onShow = (item) => this.setState(item);

    render = () => this.renderModal({
        title: 'Thông tin đăng ký tư vấn',
        body: <>
            <label>Họ và tên: <b>{this.state.lastname}&nbsp;{this.state.firstname}</b></label><br />
            <label>Email: <b>{this.state.email}</b></label><br />
            <label>Số điện thoại: <b>{this.state.phoneNumber}</b></label><br />
            <label>Loại khóa học: <b>{this.state.courseType ? this.state.courseType.title : 'Chưa đăng ký'}</b></label><br />
            <label>Trạng thái: <b>{this.state.state}</b></label><br />
            <label>Ngày đăng ký tư vấn: <b>{new Date(this.state.createdDate).getText()}</b></label><br />
        </>
    });
}

class CandidatePage extends AdminPage {
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getCandidatePage();
        T.onSearch = (searchText) => this.props.getCandidatePage(1, 50, searchText);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm =>
        isConfirm && this.props.deleteCandidate(item._id));

    render() {
        const permission = this.getUserPermission('candidate', ['read', 'write', 'delete', 'export']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.candidate && this.props.candidate.page ?
            this.props.candidate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và tên</th>
                    <th style={{ width: '50%' }}>Email</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thời gian</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto' }}>Trạng thái</th>
                    {permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.lastname + ' ' + item.firstname} onClick={e => this.edit(e, item)} style={item.modifiedDate ? {} : { fontWeight: 'bold', color: '#17a2b8' }} />
                    <TableCell content={item.email} />
                    <TableCell content={item.phoneNumber} />
                    <TableCell type='date' content={item.createdDate} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.courseType ? item.courseType.title : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.state} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-envelope-o',
            title: 'Đăng ký tư vấn',
            breadcrumb: ['Đăng ký tư vấn'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageCandidate' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCandidatePage} />
                <AdminCandidateModal ref={e => this.modal = e} />
            </>,
            onExport: permission.export ? this.props.exportCandidateToExcel : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, candidate: state.candidate });
const mapActionsToProps = { getCandidatePage, getCandidate, updateCandidate, deleteCandidate, exportCandidateToExcel };
export default connect(mapStateToProps, mapActionsToProps)(CandidatePage);