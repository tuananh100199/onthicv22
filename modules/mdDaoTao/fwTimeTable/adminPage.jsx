import React from 'react';
import { connect } from 'react-redux';
import { getTimeTablePage } from './redux';
import { ajaxSelectCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { ajaxSelectStudentByCourse } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';

class TimeTableModal extends AdminModal {
    state = {};
    onShow = () => {
        this.setState({ courseType: null });
    }

    onSubmit = () => {
    }

    onChangeCourse = (data) => {
        data && data.id && this.setState({ courseType: data.id }, () => this.itemStudent.value(null));
    }

    render = () => {
        //TODO: Sang => ajaxSelectStudentByCourse
        return this.renderModal({
            title: 'Buổi học thực hành',
            body: <>
                <FormSelect ref={e => this.itemCourse = e} label='Khoá học' data={ajaxSelectCourse} onChange={this.onChangeCourse} readOnly={this.props.readOnly} allowClear={true} />
                <FormSelect ref={e => this.itemStudent = e} label='Học viên' data={ajaxSelectStudentByCourse(this.state.courseType)} readOnly={this.props.readOnly} />
            </>,
        });
    }
}

class TimeTablePage extends AdminPage {
    state = { searchText: '', isSearching: false };
    courseTypeMapper = {};

    componentDidMount() {
        this.props.getTimeTablePage(1, 50, undefined);
        T.ready();
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getTimeTablePage(undefined, undefined, searchText ? { searchText } : null, () => {
        //     this.setState({ searchText, isSearching: searchText != '' });
        // });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const permission = this.getUserPermission('timeTable', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.timeTable && this.props.timeTable.page ?
            this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course != null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xe học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}<br />{item.student ? item.student.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.student && item.student.user ? item.student.user.phoneNumber ? T.mobileDisplay(item.student.user.phoneNumber) : 'TODO:user.phoneNumber' : ''} />
                    <TableCell type='text' content={<>{item.student && item.student.course ? item.student.course.name || 'TODO:course.name' : ''}<br />{item.student && item.student.courseType ? item.student.courseType.title || 'TODO:courseType.title' : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' content={item.index} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' content={item.numOfHours ? `${item.startHour}h-${item.startHour + item.numOfHours}h` : `${item.startHour}h`} />
                    <TableCell type='number' content={item.numOfHours} />
                    <TableCell type='number' content={item.licensePlates} />
                    <TableCell type='buttons' content={item} permission={permission} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khóa biểu',
            breadcrumb: ['Thời khóa biểu'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminTimeTable' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTimeTablePage} />
                <TimeTableModal ref={e => this.modal = e} courseTypeMapper={this.courseTypeMapper} readOnly={!permission.write} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTablePage };
export default connect(mapStateToProps, mapActionsToProps)(TimeTablePage);
