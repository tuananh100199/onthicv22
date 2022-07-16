import React from 'react';
import { connect } from 'react-redux';
import { getDiscountHistoryPage, createDiscountHistory, updateDiscountHistory, deleteDiscountHistory } from './redux';
import { AdminPage, TableCell, renderTable, TableHead,TableHeadCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class DiscountPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getDiscountHistoryPage(1, 50, {},{},{});
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Lịch sử giảm giá', 'Bạn có chắc bạn muốn xóa lịch sử giảm giá này?', true, isConfirm =>
        isConfirm && this.props.deleteDiscountHistory(item._id));

    render() {
        const permission = this.getUserPermission('discountHistory'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.discountHistory && this.props.discountHistory.page ?
                this.props.discountHistory.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list, autoDisplay:true, stickyHead:true,
                renderHead: () => (
                    <TableHead getPage = {this.props.getDiscountHistoryPage}>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên khuyến mãi/ Mã code</th>
                        <TableHeadCell name='date' sort={true} style={{ width: 'auto' }} content='Ngày áp dụng' nowrap='true' />
                        <th style={{ width: 'auto' }} nowrap='true'>Người sử dụng</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Loại khuyến mãi</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền giảm (VNĐ)</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </TableHead>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.name} />
                        <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{whiteSpace: 'nowrap'}} content={item.user ? item.user.lastname + ' ' + item.user.firstname : ''} />
                        <TableCell type='text' style={{whiteSpace: 'nowrap'}} content={item.type == 'goi' ? 'Khuyến mãi theo gói' : (item.type == 'codeCaNhan' ? 'Code khuyến mãi cá nhân' : 'Code khuyến mãi chung')} />
                        <TableCell type='number' content={item.fee} />
                        <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete} />
                    </tr>),
            });
        console.log(this.props);
        return this.renderPage({
            icon: 'fa fa-sort-amount-desc',
            title: 'Lịch sử giảm giá',
            breadcrumb: ['Lịch sử giảm giá'],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination name='pageDiscountHistory' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDiscountHistoryPage} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, discountHistory: state.accountant.discountHistory });
const mapActionsToProps = { getDiscountHistoryPage, createDiscountHistory, updateDiscountHistory, deleteDiscountHistory };
export default connect(mapStateToProps, mapActionsToProps)(DiscountPage);
