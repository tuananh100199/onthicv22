import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import '../fwCourse/huongDan.css';


const previousRoute = '/user';
class UserDocumentPage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/huong-dan/:_id').parse(url);
        this.setState({ subjectId: params._id, courseId: params.courseId });
        if (params._id) {
            this.props.getSubjectByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push(previousRoute);
                } else if (data.notify) {
                    T.alert(data.notify, 'error', false, 2000);
                    this.props.history.push(previousRoute);
                } else if (data.item) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + this.state.courseId);
                    this.setState(data.item);
                } else {
                    this.props.history.push(previousRoute);
                }
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const {mobile} = this.props.system;
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + this.state.subjectId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Hướng dẫn môn học',
            breadcrumb: [<Link key={0} to={userPageLink}>Môn học</Link>, 'Hướng dẫn sử dụng'],
            content: (
                <>
                    <div className='tile'>
                        <iframe className='document-container' src="/document/huongDan/hocVienLyThuyet.pdf#zoom=60"></iframe>
                        <h5 className='text-right mt-2'>Nếu tồn tại thắc mắc, xin vui lòng liên hệ tới số <a href={'tel:' + mobile} className='text-primary'>{T.mobileDisplay(mobile)}</a></h5>     
                    </div>
                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getSubjectByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
