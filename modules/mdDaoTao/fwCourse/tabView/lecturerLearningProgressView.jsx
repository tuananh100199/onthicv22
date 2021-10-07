import React from 'react';
import { connect } from 'react-redux';
import { getLearingProgressByLecturer } from '../redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class AdminStudentView extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getLearingProgressByLecturer(this.props.courseId, data => {
            this.setState({ listStudent: data.item });
        });
    }

    render() {
        const data = this.state.listStudent ? this.state.listStudent : [],
            courseItem = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] },
            subjects = courseItem && courseItem.subjects && courseItem.subjects.sort((a, b) => a.title.localeCompare(b.title));
        const table = renderTable({
            getDataSource: () => data, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: '100%' }}>CMND/CCCD</th>
                    {subjects.length && subjects.map((subject, i) => (<th key={i} style={{ width: 'auto' }} nowrap='true'>{subject.title}</th>))}

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard} />
                    {subjects.length && subjects.map((subject, i) => (<TableCell key={i} type='text' content={(item.tienDoHocTap && item.tienDoHocTap[subject._id] ? (Object.keys(item.tienDoHocTap[subject._id]).length > subject.lessons.length ? subject.lessons.length : Object.keys(item.tienDoHocTap[subject._id]).length) : 0) + '/' + subject.lessons.length} />))}
                </tr>),
        });
        return <div className='tile-body'>{table}</div>;
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getLearingProgressByLecturer };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);