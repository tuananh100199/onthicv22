import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse } from '../redux';
import LecturerView from 'modules/mdDaoTao//fwTimeTable/lecturerView';
import { AdminPage } from 'view/component/AdminPage';

export class LecturerTimeTablePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/calendar').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-weixin',
            title: 'Phòng chat chung: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Phòng chat chung'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        {item && item._id ? <LecturerView courseId={item._id} courseType={item.courseType} /> : null}
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(LecturerTimeTablePage);