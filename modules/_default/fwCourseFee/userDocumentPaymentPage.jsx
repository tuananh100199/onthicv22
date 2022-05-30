import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from 'modules/mdDaoTao/fwCourse/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import '../../mdDaoTao/fwCourse/huongDan.css';


const previousRoute = '/user';
class UserDocumentPage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/cong-no/huong-dan'),
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

    // onDocumentLoadError = () => {
    //     this.setState({ isLoadSuccess: false});
    // };

    render() {
        const { courseId, name} = this.state;
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Hướng dẫn sử dụng: ' + (name),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, <Link key={1} to={userPageLink+'/cong-no'}>Học phí</Link>, 'Hướng dẫn đóng học phí học viên'],
            content: (
                <>
                    <div className='tile'>
                        <iframe src="/document/huongDan/hocVienHocPhi.pdf" width='100%' height='550'></iframe>
                    </div>
                </>
            ),
            backRoute: userPageLink + '/cong-no',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
