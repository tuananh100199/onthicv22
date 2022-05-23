import React from 'react';
import { connect } from 'react-redux';
import { getCandidatePage, getCandidate, updateCandidate, deleteCandidate } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class CandidatePage extends AdminPage {
    state = { courseTypes: [] };
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.getPage();
        T.onSearch = (searchText) => this.getPage(1, 50,searchText);
    }

    getPage = (pageNumber,pageSize,searchText='')=>this.props.getCandidatePage(pageNumber,pageSize,{state:'UngVienTiemNang',searchText})

    edit = (e, item) => e.preventDefault() || this.candidateModal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm =>
        isConfirm && this.props.deleteCandidate(item._id,this.getPage));

    render() {
        const permission = this.getUserPermission('candidate', ['read', 'write', 'delete', 'export']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.candidate && this.props.candidate.page ?
            this.props.candidate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
            const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }} nowrap='true'>Họ và tên</th>
                    <th style={{ width: '30%' }} nowrap='true'>Thông tin liên hệ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày đăng ký</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                        <TableCell content={<>{item.email}<br />{item.phoneNumber}</>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.createdDate ? T.dateToText(item.createdDate, 'dd/mm/yyyy') : ''} />
                        <TableCell content={item.courseType?item.courseType.title:''} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete} />
                    </tr>);
            },
        });

        return this.renderPage({
            icon: 'fa fa-envelope-o',
            title: 'Ứng viên tiềm năng',
            breadcrumb: ['Ứng viên tiềm năng'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageCandidate' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber,pageSize)=>this.getPage(pageNumber,pageSize)} />
            </>,
            // onExport: permission.export ? exportCandidateToExcel : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, candidate: state.communication.candidate });
const mapActionsToProps = {getCandidatePage, getCandidate, updateCandidate, deleteCandidate, };
export default connect(mapStateToProps, mapActionsToProps)(CandidatePage);