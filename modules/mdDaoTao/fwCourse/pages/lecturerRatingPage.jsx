import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse, getLearningProgress } from '../redux'; // TODO: lỗi Vinh coi lại hàm này
import { getSubject } from 'modules/mdDaoTao/fwSubject/redux';
import { getRateByLecturer } from 'modules/_default/fwRate/redux';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';

class LecturerRatingPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/rate-subject').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.getLearningProgress(course._id);
                    this.loadSubject(course.subjects && course.subjects[0]._id);
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.setState({ courseId: params._id });
                            this.getLearningProgress(params._id);
                            this.loadSubject(data.item && data.item.subjects && data.item.subjects[0]._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    getLearningProgress = (_courseId) => {
        this.props.getLearningProgress(_courseId, data => {
            if (data.error) {
                T.notify('Lấy tiến độ học tập học viên bị lỗi!', 'danger');
                this.props.history.push('/user/course/');
            }
        });
    }

    loadSubject = (subjectId) => {
        this.props.getSubject(subjectId, data => {
            let listLessonId = data.item.lessons.length && data.item.lessons.map(lesson => lesson._id);
            this.props.getRateByLecturer(this.state.courseId, listLessonId);
            this.setState({
                currentSubject: data.item,
                currentLessons: data.item && data.item.lessons
            });
        });

    }

    render() {
        const subjects = this.props.course && this.props.course.subjects ? this.props.course.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh) : [],
            course = this.props.course && this.props.course.item ? this.props.course.item : {},
            lessons = this.state.currentLessons ? this.state.currentLessons : [],
            listSubjects = subjects.map((subject) =>
                ({ id: subject._id, text: subject.title })
            );
        const students = this.props.course && this.props.course.students ? this.props.course.students : [],
            rate = this.props.rate;
        const select = <FormSelect data={listSubjects} label='Môn học' onChange={data => this.loadSubject(data.id)} style={{ margin: 0, width: '200px !important' }} />;
        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    {lessons.length ? lessons.map((lesson, i) => (<th key={i} style={{ width: 'auto' }} nowrap='true'>{lesson.title}</th>)) : null}

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    {lessons.length ? lessons.map((lesson, i) => (<TableCell key={i} type='text' content={rate && rate.item && rate.item.find(element => (element._refId == lesson._id && element.user._id == item.user._id)) ? rate.item.find(element => (element._refId == lesson._id && element.user._id == item.user._id)).value : null} />)) : null}
                </tr>),
        });
        const backRoute = `/user/course/${course._id}`;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Đánh giá bài học: ' + course.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, course._id ? <Link key={0} to={backRoute}>{course.name}</Link> : '', 'Đánh giá bài học'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='pb-3 w-25'>
                            {select}
                        </div>
                        {table}
                    </div>
                </div>;
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, rate: state.framework.rate });
const mapActionsToProps = { getCourse, getLearningProgress, getSubject, getRateByLecturer };
export default connect(mapStateToProps, mapActionsToProps)(LecturerRatingPage);
