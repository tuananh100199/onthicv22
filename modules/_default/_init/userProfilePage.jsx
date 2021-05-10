import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage } from 'view/component/AdminPage';

class UserProfilePage extends AdminPage {
    componentDidMount() {
        if (this.props.system && this.props.system.user) {
            this.props.getUserCourse(data => this.setState(data));
            T.ready();
        }
    }

    //TODO:TuanAnh: chưa có lớp cho học viên
    render() {
        const { students } = this.state ? this.state : { students: [] };
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Trang cá nhân: ',
            breadcrumb: ['Trang cá nhân'],
            content: (
                <div className='row'>
                    <h4 style={{ width: '100%' }}>Thông tin chung</h4>
                    <Link to='/user/profile' className='col-md-6 col-lg-4'>
                        <div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa-user' />
                            <div className='info'>
                                <h4>Thông tin chung</h4>
                            </div>
                        </div>
                    </Link>
                    {students && students.length ? <>
                        <h4 style={{ width: '100%' }}>Khóa học của bạn</h4>
                        {students.map((student, index) => (
                            <div key={index} className='col-md-6 col-lg-4'>
                                <Link to='#'>
                                    <div className='widget-small coloured-icon info'>
                                        <i className='icon fa fa-3x fa fa-cubes' />
                                        <div className='info'>
                                            <h4>Khóa học hạng {student && student.courseType ? student.courseType.title : ''}</h4>
                                            <p style={{ fontWeight: 'bold' }}>{student.course ? `Lớp: ${student.course.name}` : `Đang chờ khóa`}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </> : null}
                </div>),
        });
    }
}
const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getUserCourse };
export default connect(mapStateToProps, mapActionsToProps)(UserProfilePage);