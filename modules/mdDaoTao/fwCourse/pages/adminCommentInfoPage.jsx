import React from 'react';
import { connect } from 'react-redux';
import { getCommentLessonId } from 'modules/_default/fwComment/redux';
import CommentSection from 'modules/_default/fwComment/CommentSection';
import { getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class LecturerStudentPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_courseId/comment/:_id').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getCommentLessonId(params._id, data =>{
                        if(data && data.lessonId) this.setState({courseId: course._id, lessonId: data.lessonId});
                    });
                } else {
                    this.props.getCourse(params._courseId, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getCommentLessonId(params._courseId, data =>{
                                if(data && data.lessonId) this.setState({courseId: params._courseId, lessonId: data.lessonId});
                            });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        // const item = this.props.comment && this.props.comment.page && this.props.comment.page.list ? this.props.comment.page.list  : [];
        const {courseId, lessonId} = this.state;
        const course = this.props.course && this.props.course.item ? this.props.course.item : {};
        const backRoute = `/user/course/${course._id}/comment`;
        return this.renderPage({
            icon: 'fa fa-comment-o',
            title: 'Bình luận: ' + course.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, course._id ? <Link key={0} to={backRoute}>Bình luận chờ duyệt</Link> : '', 'Bình luận'],
            content: (
                <div className='tile'>
                    {courseId && lessonId ? <div className='tile-body'><CommentSection refParentId={courseId} refId={lessonId} /></div> : <div>Không tìm thấy bình luận!</div>}
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, comment: state.framework.comment, course: state.trainning.course });
const mapActionsToProps = { getCommentLessonId, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(LecturerStudentPage);