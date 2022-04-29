import React from 'react';
import { connect } from 'react-redux';
import { getEncryptionPage, createEncryption, updateEncryption, deleteEncryption } from './redux';
import { AdminPage, TableCell, renderTable,TableHeadCell,TableHead } from 'view/component/AdminPage';
import { ajaxSelectUser } from '../fwUser/redux';
import Pagination from 'view/component/Pagination';

class EncryptionPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getEncryptionPage(1, undefined, {type: 'import'}, {}, {});
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Chứng chỉ giáo viên', 'Bạn có chắc bạn muốn xóa loại chứng chỉ này?', true, isConfirm =>
        isConfirm && this.props.deleteEncryption(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    changeDefault = (item, active) => {
        if (active) {
            this.props.updateEncryptionDefault(item);
        }
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.encryption && this.props.encryption.page ?
                this.props.encryption.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                stickyHead:true,
                autoDisplay:true,
                getDataSource: () => list,
                renderHead: () => (
                    <TableHead getPage={this.props.getEncryptionPage}>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <TableHeadCell name='author' filter='select' filterData = {ajaxSelectUser} style={{ width: '100%' }}>Tên người thực hiện</TableHeadCell>
                        <TableHeadCell name='chucVu' filter='select' filterData = {[]} style={{ width: 'auto' }}>Chức vụ</TableHeadCell>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Tên file</th>
                        <TableHeadCell sort={true} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời gian</TableHeadCell>
                        {/* <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th> */}
                    </TableHead>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.author ? (item.author.lastname + ' ' + item.author.firstname) : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.chucVu ? item.chucVu : 'Nhân viên quản lý xe'} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.filename}   />
                        <TableCell type='text' content={item.date ? T.dateToText(item.date) : ''} />
                        {/* <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} /> */}
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Quản lý gửi file',
            breadcrumb: ['Quản lý gửi file'],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination name='pageEncryption' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getEncryptionPage} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, encryption: state.framwork.encryption });
const mapActionsToProps = { getEncryptionPage, createEncryption, updateEncryption, deleteEncryption };
export default connect(mapStateToProps, mapActionsToProps)(EncryptionPage);
