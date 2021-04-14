import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage } from 'view/component/AdminPage';

class UserProfilePage extends AdminPage {
    componentDidMount() {
        if (this.props.system && this.props.system.user) {
            this.props.getStudent({ user: this.props.system.user._id }, data => {
                this.setState(data);
            });
            T.ready();
        }
    }
    //To do: chưa có lớp cho học viên
    render() {
        const {course, courseType} = this.state ? this.state : {course: '', courseType: '' };
        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Trang cá nhân: ',
            breadcrumb: ['Trang cá nhân'],
            content: (
                <div className='row'>
                    <div className='col-md-12 col-lg-6'>
                        <Link to='/user/profile'>
                            <div className='widget-small coloured-icon info'>
                                <i className='icon fa fa-3x fa-user'/>
                                <div className='info'>
                                    <h4>Thông tin chung</h4>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className='col-md-12 col-lg-6'>
                        <Link to='#'>
                            <div className='widget-small coloured-icon info'>
                                <i className='icon fa fa-3x fa fa-cubes'/>
                                <div className='info'>
                                    <h4>Khóa học hạng {courseType? courseType.title : ''}</h4>
                                    <p style={{ fontWeight: 'bold' }}>{course ? 'Lớp' : 'Đang chờ khóa'}</p> 
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>),
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserProfilePage);
