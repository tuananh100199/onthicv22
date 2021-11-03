import React from 'react';
import { connect } from 'react-redux';
import { getUserCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';

class UserProfilePage extends AdminPage {
    componentDidMount() {
        T.ready(() => {
            this.props.system && this.props.system.user && this.props.getUserCourse(data => this.setState(data));
        });
    }

    render() {
        const { students } = this.state ? this.state : { students: [] };
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Trang cá nhân',
            breadcrumb: ['Trang cá nhân'],
            content: (
                <div className='row'>
                    <PageIconHeader text='Thông tin cá nhân' />
                    <PageIcon to={'/user/profile'} icon='fa-user' iconBackgroundColor='#17a2b8' text='Thông tin cá nhân' />

                    {students && students.length ? <>
                        <PageIconHeader text='Khóa học của bạn' />
                        {students.map((student, index) => {
                            const { _id, name, active } = student.course || {};
                            const text = () => <>
                                <h4>Khóa học hạng {student.courseType && student.courseType.title ? student.courseType.title : ''}</h4>
                                <p style={{ fontWeight: 'bold' }}>{active ? 'Lớp: ' + name : 'Đang chờ khóa'}</p>
                            </>;
                            return _id ? <PageIcon key={index} to={`/user/hoc-vien/khoa-hoc/${_id}`} icon='fa-cubes' iconBackgroundColor='#1488db' text={text} disabled={!active} /> : '';
                        })}
                    </> : null}

                    <PageIconHeader text='Ôn tập' />
                    <PageIcon to='/user/hoc-vien/khoa-hoc/bo-de-thi-thu' icon='fa-sitemap' iconBackgroundColor='#7cb342' text='Bộ đề thi thử' />
                    <PageIcon to='/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien' icon='fa-share-alt' iconBackgroundColor='#69f0ae' text='Bộ đề thi ngẫu nhiên' />
                </div>),
        });
    }
}
const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getUserCourse };
export default connect(mapStateToProps, mapActionsToProps)(UserProfilePage);