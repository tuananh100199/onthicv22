import React from 'react';
import { connect } from 'react-redux';
import { updateCourseStudents, getStudentByLecturer } from '../../fwCourse/redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class AdminStudentView extends AdminPage {
    state = { searchPreStudentText: '', searchPreStudentCourse: '', searchStudentText: '', sortType: 'name', assignedButtonVisible: false }; // sortType = name | division
    preStudents = {};
    componentDidMount() {
        this.props.getStudentByLecturer(this.props.courseId, data => {
            this.setState({ listStudent: data.item });
        });
    }

    render() {
        const data = this.state.listStudent ? this.state.listStudent : [];
        const table = renderTable({
            getDataSource: () => data, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                </tr>),
        });
        return (
            <div className='tile-body'>
                {table}
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { updateCourseStudents, getStudentByLecturer };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);