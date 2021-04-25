import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage } from 'view/component/AdminPage';

class UserProfilePage extends AdminPage {
    componentDidMount() {
        if (this.props.system && this.props.system.user) {
            this.props.getUserCourse(data => {
                this.setState(data);
            });
            T.ready();
        }
    }
    //To do: chưa có lớp cho học viên
    render() {
        const { students } = this.state ? this.state : { students: [] };
        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Trang cá nhân: ',
            breadcrumb: ['Trang cá nhân'],
            content: (
                <div className='row'>
                    <div className='col-12'>
                        <h4>Thông tin chung</h4>
                        <div className='row'>
                            <div className='col-md-6'>
                                <Link to='/user/profile'>
                                    <div className='widget-small coloured-icon info'>
                                        <i className='icon fa fa-3x fa-user' />
                                        <div className='info'>
                                            <h4>Thông tin chung</h4>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className='col-12'>
                        <h4>Khóa học của bạn</h4>
                        <div className='row'>
                            {students && students.map((student, index) => (
                                <div key={index} className='col-md-6 col-lg-6'>
                                    <Link to='#'>
                                        <div className='widget-small coloured-icon info'>
                                            <i className='icon fa fa-3x fa fa-cubes' />
                                            <div className='info'>
                                                <h4>Khóa học hạng {student && student.courseType ? student.courseType.title : ''}</h4>
                                                {student.course ?
                                                    <p style={{ fontWeight: 'bold' }}>Lớp: {student.course.name}</p>
                                                    :
                                                    <p style={{ fontWeight: 'bold' }}> Đang chờ khóa </p>
                                                }
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                            }
                        </div>
                    </div>
                </div>),
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getUserCourse };
export default connect(mapStateToProps, mapActionsToProps)(UserProfilePage);
