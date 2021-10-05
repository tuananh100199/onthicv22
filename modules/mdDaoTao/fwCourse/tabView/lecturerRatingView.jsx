import React from 'react';
import { connect } from 'react-redux';
import { getLearingProgressByLecturer } from '../redux';
import { getSubject } from '../../fwSubject/redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';

class AdminStudentView extends AdminPage {
    state = {};
    componentDidMount() {
        const subjects = this.props.course && this.props.course.item && this.props.course.item.subjects ? this.props.course.item.subjects : [],
            listSubject = subjects.map((subject) =>
                ({ id: subject._id, text: subject.title })
            );
        if (subjects.length) {
            this.props.getSubject(subjects[0]._id, data => {
                this.setState({
                    subjects: subjects,
                    listSubject: listSubject,
                    currentSubject: subjects[0]._id,
                    currentLessons: data.item && data.item.lessons
                });
            });
        }

        this.props.getLearingProgressByLecturer(this.props.courseId, data => {
            this.setState({ listStudent: data.item });
        });
    }

    loadSubject = (subjectId) => {
        this.props.getSubject(subjectId, data => {
            this.setState({
                currentSubject: data.item,
                currentLessons: data.item && data.item.lessons
            });
        });

    }

    render() {
        const data = this.state.listStudent ? this.state.listStudent : [],
            subjects = this.props.course && this.props.course.item && this.props.course.item.subjects ? this.props.course.item.subjects : [],
            lessons = this.state.currentLessons ? this.state.currentLessons : [],
            currentSubject = this.state.currentSubject ? this.state.currentSubject : subjects[0];

        const listSubject = <Dropdown items={this.state.listSubject} item={currentSubject.title} onSelected={e => this.loadSubject(e.id)} />;
        const table = renderTable({
            getDataSource: () => data, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    {lessons.length && lessons.map((lesson, i) => (<th key={i} style={{ width: 'auto' }} nowrap='true'>{lesson.title}</th>))}

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    {lessons.length && lessons.map((lesson, i) => (<TableCell key={i} type='text' content={(item.tienDoHocTap && item.tienDoHocTap[currentSubject._id] && item.tienDoHocTap[currentSubject._id][lesson._id] && item.tienDoHocTap[currentSubject._id][lesson._id].rating) ? item.tienDoHocTap[currentSubject._id][lesson._id].rating : ''} />))}
                </tr>),
        });
        return <div className='tile-body'>
            <div className='pb-3'>
                {listSubject}
            </div>
            {table}
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getLearingProgressByLecturer, getSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);