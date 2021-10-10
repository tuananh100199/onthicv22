import React from 'react';
import { connect } from 'react-redux';
import { getTimeTableByStudent } from './redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class StudentView extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/thoi-khoa-bieu'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getTimeTableByStudent( data => {
                    if (data.error) {
                        this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
                    } else {
                        this.setState({name: data.list && data.list[0] && data.list[0].student && data.list[0].student.course && data.list[0].student.course.name});
                    }
                });
            });
        } else {
            this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
        }
    }

    render() {
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        let { list } = this.props.timeTable && this.props.timeTable.page ? this.props.timeTable.page : { list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xe học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: T.dateToText(item.date, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={<><span>{item.student && item.student.course ? item.student.course.name : ''}</span><br />{item.student && item.student.courseType ? item.student.courseType.title : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }} content={item.dateNumber} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }}content={item.numOfHours ? `${item.startHour}h-${item.startHour + item.numOfHours}h` : `${item.startHour}h`} />
                    <TableCell type='number' content={item.licensePlates} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name || '...'),
            breadcrumb: [<Link key={0} to={ '/user/hoc-vien/khoa-hoc/' + this.state.courseId }>Khóa học</Link>, 'Thời khóa biểu'],
            content: <div className='tile'>{table}</div>,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTableByStudent };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
