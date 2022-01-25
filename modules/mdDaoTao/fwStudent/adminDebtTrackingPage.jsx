import React from 'react';
import { connect } from 'react-redux';
import { getStudentPage, updateStudent } from './redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { getNotificationTemplateAll, getNotificationTemplate } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class DebtTrackingPage extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready();
        this.props.getStudentPage();
    }
    render() {
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giảm giá</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền phải đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lần thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình thức đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thông tin đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền đã đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền còn nợ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời hạn đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Phiếu thu</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}<br />{item.identityCard}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.course && item.course.name} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='number' content={index + 1} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Theo dõi công nợ',
            breadcrumb: ['Theo dõi công nợ'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getStudentPage, updateStudent, createNotification, getCourseTypeAll, getNotificationTemplateAll, getNotificationTemplate };
export default connect(mapStateToProps, mapActionsToProps)(DebtTrackingPage);
