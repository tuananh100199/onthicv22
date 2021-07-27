import React from 'react';
import { connect } from 'react-redux';
import { getTimeTablePage } from './redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class StudentView extends AdminPage {
    componentDidMount() {
        this.props.studentId &&  this.props.getTimeTablePage(1, 50, {student: this.props.studentId});
    }

    render() {
        let { list } = this.props.timeTable && this.props.timeTable.page ? this.props.timeTable.page : { list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xe học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={<><span className='text-primary'>{item.student && item.student.course ? item.student.course.name : ''}</span><br />{item.student && item.student.courseType ? item.student.courseType.title : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' content={item.dateNumber} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' content={item.numOfHours ? `${item.startHour}h-${item.startHour + item.numOfHours}h` : `${item.startHour}h`} />
                    <TableCell type='number' content={item.licensePlates} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khóa biểu',
            content: <div className='tile'>{table}</div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTablePage };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
