import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, PageIcon } from 'view/component/AdminPage';

class AdminFinalExamSettingPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/final-exam-setting').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.setState({ courseId: params._id });
                        }
                    });
                } else {
                    this.setState({ courseId: params._id });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        const course = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] },
        subjects = course && course.subjects ? course.subjects : [];
        const backRoute = `/user/course/${course._id}`;
        return this.renderPage({
            icon: 'fa fa-sliders',
            title: 'Thiết lập thi hết môn: ' + course.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, course._id ? <Link key={0} to={backRoute}>{course.name}</Link> : '', 'Thiết lập thi hết môn'],
            content: (
                <div className='row'>
                    {course && !course.isDefault && subjects.length ? 
                    <>
                        {subjects.map((subject, index) =>
                            !subject.monThucHanh && <PageIcon className='col-md-4' key={index} to={`/user/course/${course._id}/final-exam-setting/${subject._id}`} icon='fa-briefcase' iconBackgroundColor='#1488db' text={subject ? subject.title : ''} />
                        )}
                    </> : null }
                </div>
                ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminFinalExamSettingPage);
