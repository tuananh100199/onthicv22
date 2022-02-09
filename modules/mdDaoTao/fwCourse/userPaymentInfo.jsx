import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux';
import { createChangeLecturer } from 'modules/mdDaoTao/fwChangeLecturer/redux';
import { getRateByUser } from 'modules/_default/fwRate/redux';
import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, PageIcon } from 'view/component/AdminPage';
class UserCoursePageDetail extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/cong-no'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push('/user');
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push('/user');
                    } else if (data.item && data.student) {
                        this.setState(data.item);
                        if (data.teacher) {
                            this.setState({ teacher: data.teacher });
                            this.props.getRateByUser('teacher', data.teacher._id);
                        }
                        this.setState({ student: data.student });
                    } else {
                        this.props.history.push('/user');
                    }
                });
            });
        } else {
            this.props.history.push('/user');
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.url != this.props.match.url) {
            const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.setState({ courseId: _id });
            if (_id) {
                T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                    this.props.getCourseByStudent(_id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user');
                        } else if (data.notify) {
                            T.alert(data.notify, 'error', false, 2000);
                            this.props.history.push('/user');
                        } else if (data.item) {
                            this.setState(data.item);
                        } else {
                            this.props.history.push('/user');
                        }
                    });
                });
            } else {
                this.props.history.push('/user');
            }
        }
    }

    render() {
        const { name, courseId } = this.state;
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: `Học phí: ${name}`,
            breadcrumb: ['Học phí'],
            content: (
                <div className='row user-course'>
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/cong-no/chinh-thuc`} icon='fa-credit-card' iconBackgroundColor='#17a2b8' text='Học phí chính thức' />
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/cong-no/tang-them`} icon='fa-plus' iconBackgroundColor='#3e24aa' text='Học phí tăng thêm' />
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/cong-no/lich-su`} icon='fa-history' iconBackgroundColor='#8d74aa' text='Lịch sử thanh toán' />
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, driveTest: state.trainning.driveTest, rate: state.framework.rate });
const mapActionsToProps = { getCourseByStudent, getRateByUser, getStudent, createChangeLecturer };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePageDetail);