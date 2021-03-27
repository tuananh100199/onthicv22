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
            <label>Số điện thoại: <b>{this.state.phone}</b></label><br />
            <label>Loại khóa học: <b>{this.state.courseType ? this.state.courseType.title : 'Chưa đăng ký'}</b></label><br />
            <label>Trạng thái: <b>{this.state.state}</b></label><br />
            <label>Ngày đăng ký tư vấn: <b>{new Date(this.state.createdDate).getText()}</b></label><br />
        </>
    });
}

class CandidatePage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getCandidatePage();
        T.onSearch = (searchText) => this.props.getCandidatePage(1, 50, searchText);
    }

    showCandidate = (e, item) => e.preventDefault() || this.props.getCandidate(item._id, candidate => this.modal.show(candidate));

    changeRead = (item) => this.props.updateCandidate(item._id, { read: !item.read });

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm =>
        isConfirm && this.props.deleteCandidate(item._id));

    exportCandidate = (e) => {
        this.props.exportCandidateToExcel();
    }

    render() {
        const permission = this.getUserPermission('candidate');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.candidate && this.props.candidate.page ?
            this.props.candidate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = renderTable({
            getDataSource: () => this.props.candidate && this.props.candidate.page && this.props.candidate.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }}>Họ và tên</th>
                    <th style={{ width: '40%' }}>Email</th>
                    <th style={{ width: 'auto' }}>Số điện thoại</th>
                    <th style={{ width: 'auto' }}>Loại khóa học</th>
                    <th style={{ width: '20%' }}>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={e => this.showCandidate(e, item)} style={item.read ? readStyle : unreadStyle} content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='number' content={item.phone} />
                    <TableCell type='text' content={item.courseType? item.courseType.title : ''} />
                    <TableCell type='text' content={item.state} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showCandidate} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-envelope-o',
            title: 'Candidate',
            breadcrumb: ['Candidate'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageCandidate' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCandidatePage} />
                {permission.write ?
                    <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} data-toggle='tooltip' title='Xuất Excel' onClick={e => this.exportCandidate(e)}>
                        <i className='fa fa-file-excel-o' />
                    </button> : null}
                <AdminCandidateModal ref={e => this.modal = e} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, candidate: state.candidate });
const mapActionsToProps = { getCandidatePage, getCandidate, updateCandidate, deleteCandidate, exportCandidateToExcel };
export default connect(mapStateToProps, mapActionsToProps)(CandidatePage);