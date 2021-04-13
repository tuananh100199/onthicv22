import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createDonDeNghiHocByUser } from 'modules/mdDaoTao/fwDonDeNghiHoc/redux';
import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage } from 'view/component/AdminPage';

class ProfileIcon extends React.Component {
    render() {
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>{this.props.title} {this.props.courseType ? this.props.courseType : '' } </h4>
                    <p style={{ fontWeight: 'bold' }}>{this.props.status}</p>
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}
class UserProfilePage extends AdminPage {
    componentDidMount() {
        if (this.props.system && this.props.system.user) {
            this.props.getStudent({ user: this.props.system.user._id }, data => {
                this.setState(data);
            });
            T.ready();
        }
    }

    create = (e) => {
        this.props.createDonDeNghiHocByUser(data => this.props.history.push('/user/bieu-mau/don-de-nghi-hoc/' + data.item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('system', ['settings']);
        const {course, courseType} = this.state ? this.state : {course: '', courseType: '' };
        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Trang cá nhân: ',
            breadcrumb: ['Trang cá nhân'],
            content: (
                <div className='row'>
                    <div className='col-md-12 col-lg-6'>
                        <ProfileIcon type='primary' icon='fa-users' title='Thông tin chung' link='/user/profile' readOnly={permission.settings} />
                    </div>
                    {course ? 
                    <div className='col-md-12 col-lg-6'>
                        <ProfileIcon type='info' icon='fa fa-cubes' courseType={courseType.title} status='Lớp' title='Khóa học hạng' readOnly={permission.settings} />
                    </div> : 
                    <div className='col-md-12 col-lg-6'>
                        <ProfileIcon type='primary' icon='fa-book' title='Đơn đề nghị học, sát hạch mới'  status='Đang chờ duyệt' onClick={this.create} readOnly={permission.settings} />
                    </div> }
                </div>),
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {  createDonDeNghiHocByUser, getStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserProfilePage);
