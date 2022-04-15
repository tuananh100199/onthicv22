import React from 'react';
import { connect } from 'react-redux';
import { getRegisterCalendarPage } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable,TableHead,TableHeadCell } from 'view/component/AdminPage';
import { RegisterCalendarStatesMapper, timeOffStatesMapper } from './index';
import {ajaxSelectTeacher} from 'modules/_default/fwUser/redux';
const timeOffValues = [
    {id:'morning',text:'Buổi sáng'},
    {id:'noon',text:'Buổi chiều'},
    {id:'allDay',text:'Cả ngày'},
];

const stateValues = [
    {id:'approved',text:'Đã duyệt'},
    {id:'waiting',text:'Đang chờ duyệt'},
    {id:'reject',text:'Từ chối'},
    {id:'cancel',text:'Hủy'},
];
class TimeTablePage extends AdminPage {
    state = { searchText: '', isSearching: false };
    componentDidMount() {
        T.ready(()=>{
            this.props.getRegisterCalendarPage(1, 50, {},{},{});
        });
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getRegisterCalendarPage(undefined, undefined, searchText ? { searchText: searchText } : null, () => {
        //     this.setState({ searchText, isSearching: searchText != '' });
        // });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thời khóa biểu', 'Bạn có chắc muốn xoá thời khóa biểu này?', true, isConfirm =>
        isConfirm && this.props.deleteTimeTable(item._id));

    render() {
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        // const permission = this.getUserPermission('registerCalendar');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.registerCalendar && this.props.registerCalendar.page ?
            this.props.registerCalendar.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            autoDisplay:true,stickyHead:true,
            renderHead: () => (
                <TableHead getPage = {this.props.getRegisterCalendarPage}>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                    <TableHeadCell style={{ width: '100%' }} nowrap='true' name='lecturer' filter='select' filterData={ajaxSelectTeacher}>Giáo viên</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Số điện thoại</TableHeadCell>
                    <TableHeadCell name = 'dateOff' sort={true} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày nghỉ</TableHeadCell>
                    <TableHeadCell name = 'timeOff' filter='select' filterData={timeOffValues} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi nghỉ</TableHeadCell>
                    <TableHeadCell name='state' filter = 'select' filterData={stateValues} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: T.dateToText(item.dateOff, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={<>{item.lecturer ? item.lecturer.lastname + ' ' + item.lecturer.firstname : ''}<br />{item.lecturer ? item.lecturer.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.lecturer ? item.lecturer.identityCard : ''} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.lecturer && item.lecturer.phoneNumber ? T.mobileDisplay(item.lecturer.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.dateOff ? T.dateToText(item.dateOff, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' content={timeOffStatesMapper[item.timeOff] && timeOffStatesMapper[item.timeOff].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: timeOffStatesMapper[item.timeOff] && timeOffStatesMapper[item.timeOff].color }}  nowrap='true'/>
                    <TableCell type='text' content={RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].color }}  nowrap='true'/>
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Lịch nghỉ giáo viên',
            breadcrumb: ['Lịch nghỉ giáo viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageRegisterCalendar' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getRegisterCalendarPage} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, registerCalendar: state.trainning.registerCalendar });
const mapActionsToProps = { getRegisterCalendarPage };
export default connect(mapStateToProps, mapActionsToProps)(TimeTablePage);
