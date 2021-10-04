import React from 'react';
import { connect } from 'react-redux';
import { getTimeTablePage, updateTimeTableTruant } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class StudentView extends AdminPage {
    componentDidMount() {
        const params = T.routeMatcher('/user/lecturer/student-time-table/:_id').parse(window.location.pathname),
            studentId = params._id;
        this.setState({ studentId });
        studentId && this.props.getTimeTablePage(1, 50, { student: studentId });
    }

    render() {
        const backRoute = '/user/lecturer/student-time-table';
        const permission = this.getUserPermission('timeTable');
        let { pageNumber, pageSize, list } = this.props.timeTable && this.props.timeTable.page ?
            this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xe học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nghỉ học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}<br />{item.student ? item.student.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.student && item.student.user && item.student.user.phoneNumber ? T.mobileDisplay(item.student.user.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<><span className='text-primary'>{item.student && item.student.course ? item.student.course.name : ''}</span><br />{item.student && item.student.courseType ? item.student.courseType.title : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' content={item.dateNumber} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' content={item.numOfHours ? `${item.startHour}h-${item.startHour + item.numOfHours}h` : `${item.startHour}h`} />
                    <TableCell type='number' content={item.numOfHours} />
                    <TableCell type='number' content={item.licensePlates} />
                    <TableCell type='checkbox' content={item.truant} permission={permission} onChanged={active => this.props.updateTimeTableTruant(item._id, { truant: active }, this.state.studentId)} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khóa biểu chi tiết',
            breadcrumb: [<Link key={0} to={backRoute}>Học viên</Link>, 'Thời khóa biểu chi tiết'],
            backRoute: backRoute,
            content: <div className='tile'>{table}</div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTablePage, updateTimeTableTruant };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
