import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage } from 'view/component/AdminPage';

class CourseUser extends React.Component {
    render() {
        const content = (<>
            <div className='widget-small coloured-icon info'>
                <i className='icon fa fa-3x fa fa-cubes' />
                <div className='info'>
                    <h4>Khóa học hạng {this.props.courseTypeName}</h4>
                    <p style={{ fontWeight: 'bold' }}>{this.props.courseName}</p>
                </div>
            </div>
        </>
        );
        return this.props.link ? <Link to={this.props.link}>{content}</Link> : content;
    }
}
class UserProfilePage extends AdminPage {
    componentDidMount() {
        if (this.props.system && this.props.system.user) {
            this.props.getUserCourse(data => this.setState(data));
            T.ready();
        }
    }

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
                                <CourseUser courseTypeName={student.courseType && student.courseType.title? student.courseType.title : ''} 
                                            link={student.course ? '/user/hoc-vien/khoa-hoc/' + student.course._id : null}
                                            courseName={student.course? 'Lớp: ' + student.course.name : 'Đang chờ khóa'} />
                            </div>
                        ))}
                    </> : null}
                    <h4 style={{ width: '100%' }}>Ôn tập</h4>
                    <Link to='/user/hoc-vien/khoa-hoc/bo-de-thi-thu' className='col-md-6 col-lg-4'>
                        <div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa-dashboard' />
                            <div className='info'>
                                <h4>Bộ đề thi thử</h4>
                            </div>
                        </div>
                    </Link>
                    <Link to='/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien' className='col-md-6 col-lg-4'>
                        <div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa-dashboard' />
                            <div className='info'>
                                <h4>Bộ đề thi ngẫu nhiên</h4>
                            </div>
                        </div>
                    </Link>
                </div>),
        });
    }
}
const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getUserCourse };
export default connect(mapStateToProps, mapActionsToProps)(UserProfilePage);