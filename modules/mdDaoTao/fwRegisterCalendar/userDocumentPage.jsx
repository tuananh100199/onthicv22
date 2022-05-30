import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from '../fwCourse/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import '../fwCourse/huongDan.css';


const previousRoute = '/user';
class UserDocumentPage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/dang-ky-lich-hoc/huong-dan'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push(previousRoute);
                    } else if (data.item) {
                        this.setState({name: data.item.name});
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const {mobile} = this.props.system;
        const { courseId, name} = this.state;
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Hướng dẫn sử dụng: ' + (name),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Hướng dẫn sử dụng học viên'],
            content: (
                <>
                    <div className='tile'>
                        <iframe src="/document/huongDan/hocVienDangKyLichHoc.pdf" width='100%' height='500'></iframe>
                        <h5 className='text-right mt-2'>Nếu tồn tại thắc mắc, xin vui lòng liên hệ tới số <a href={'tel:' + mobile} className='text-primary'>{T.mobileDisplay(mobile)}</a></h5>     
                    </div>
                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
