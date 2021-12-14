import React from 'react';
import { connect } from 'react-redux';
import { getSmsPage, deleteSms } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class SmsPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready('/user/sms');
        // T.ready(() => T.showSearchBox());
        this.props.getSmsPage();
        // T.onSearch = (searchText) => this.props.getPreSmsPage(undefined, undefined, searchText ? { searchText } : null, () => {
        //     this.setState({ searchText, isSearching: searchText != '' });
        // });
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa SMS', 'Bạn có chắc bạn muốn xóa SMS này?', true, isConfirm =>
        isConfirm && this.props.deleteSms(item._id));

    render() {
        const permission = this.getUserPermission('sms');
        //     permissionUser = this.getUserPermission('user', ['read']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.sms && this.props.sms.page ?
            this.props.sms.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr> 
                 <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngân hàng nhận</th>
                    <th style={{ width: '100%' }} nowrap='true'>Nội dung tin nhắn</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thời gian nhận</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell content={item.sender} />
                    <TableCell content={item.body} />                    
                    <TableCell content={item.timeReceived ? T.dateToText(item.timeReceived) : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete}></TableCell>
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-comments-o',
            title: 'SMS Banking',
            breadcrumb: ['SMS Banking'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminSms' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getSmsPage} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sms: state.trainning.sms });
const mapActionsToProps = { getSmsPage, deleteSms };
export default connect(mapStateToProps, mapActionsToProps)(SmsPage);
