import React from 'react';
import { connect } from 'react-redux';
import { getLearingProgressByLecturer } from '../redux';
import { getSubject } from '../../fwSubject/redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class AdminStudentView extends AdminPage {
    state = {};
    componentDidMount() {
        const courseItem = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] },
            subjects = courseItem && courseItem.subjects;
        if (subjects.length) {
            this.props.getSubject(subjects[0]._id, data => {
                this.setState({
                    subjects: subjects,
                    currentSubject: subjects[0]._id,
                    currentLessons: data.item && data.item.lessons
                });
            });
        }

        this.props.getLearingProgressByLecturer(this.props.courseId, data => {
            this.setState({ listStudent: data.item });
        });
    }

    loadSubject = (e, subject) => {
        e.preventDefault();
        console.log(subject);
        this.props.getSubject(subject._id, data => {
            this.setState({
                currentSubject: subject._id,
                currentLessons: data.item && data.item.lessons
            });
        });

    }

    render() {
        const data = this.state.listStudent ? this.state.listStudent : [],
            courseItem = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] },
            subjects = courseItem && courseItem.subjects,
            lessons = this.state.currentLessons ? this.state.currentLessons : [],
            currentSubject = this.state.currentSubject ? this.state.currentSubject : subjects[0]._id;
        const listSubject = subjects.length && subjects.map((subject, index) =>
            <div key={index} className={'chat_list' + (this.state.currentSubject == subject._id ? ' active_chat' : '')} style={{ cursor: 'pointer' }} onClick={e => this.loadSubject(e, subject)}>
                <div className='chat_people'>
                    <div className='chat_ib'>
                        <h6>{subject.title}</h6>
                    </div>
                </div>
            </div>
        );
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
                    {lessons.length && lessons.map((lesson, i) => (<TableCell key={i} type='text' content={(item.tienDoHocTap && item.tienDoHocTap[currentSubject] && item.tienDoHocTap[currentSubject][lesson._id] && item.tienDoHocTap[currentSubject][lesson._id].rating) ? item.tienDoHocTap[currentSubject][lesson._id].rating : 'Chưa đánh giá'} />))}
                </tr>),
        });
        return <div className='tile-body row'>
            <div className='col-md-3'>
                <div className='headind_srch'>
                    <div className='recent_heading'>
                        <h4>Danh sách môn học</h4>
                    </div>
                </div>
                <div className='inbox_chat'>
                    {listSubject}
                </div>
            </div>
            <div className='col-md-9'>
                {table}
            </div>
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getLearingProgressByLecturer, getSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);