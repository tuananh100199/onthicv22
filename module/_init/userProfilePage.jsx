import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllDonDeNghiHocHoanThanhByUser, getAllDonDeNghiHocChuaHoanThanhByUser, createDonDeNghiHocByUser } from '../fwDonDeNghiHoc/redux.jsx';
class ProfileIcon extends React.Component {
    render() {
        const content = (
            <div onClick={this.props.create} className={'widget-small coloured-icon ' + this.props.type} style={{ cursor: 'pointer' }}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>{this.props.title}</h4>
                    {this.props.status ?
                        <p>Trạng thái: {(this.props.status == 'waiting' ? 'Mới' :
                            (this.props.status == 'approved' ? <span className='text-success'>Đã duyệt</span> :
                                (this.props.status == 'reject' ? <span className='text-danger'>Từ chối</span> :
                                    (this.props.status == 'progressing' ? <span className='text-primary'>Đang theo học</span>
                                        : <span className='text-warning'>Đã hoàn thành</span>)
                                )
                            )
                        )}</p>
                        : <p></p>
                    }

                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class UserProfilePage extends React.Component {
    componentDidMount() {
        this.props.getAllDonDeNghiHocHoanThanhByUser();
        this.props.getAllDonDeNghiHocChuaHoanThanhByUser();
        T.ready();
    }
    create = (e) => {
        this.props.createDonDeNghiHocByUser(data => this.props.history.push('/user/bieu-mau/don-de-nghi-hoc/' + data.item._id));
        e.preventDefault();
    }
    render() {
        const unfinished = this.props.donDeNghiHoc && this.props.donDeNghiHoc.unfinished ? this.props.donDeNghiHoc.unfinished : [];
        const finish = this.props.donDeNghiHoc && this.props.donDeNghiHoc.finish ? this.props.donDeNghiHoc.finish : [];

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-user' /> Trang cá nhân</h1>
                        <p>Trung tâm đào tạo lái xe Hiệp Phát</p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <li className='breadcrumb-item'>
                            <i className='fa fa-home fa-lg' />
                        </li>
                        <li className='breadcrumb-item'>Trang cá nhân</li>
                    </ul>
                </div>

                <div className='row'>
                    <div className='col-12'>
                        <h4>Thông tin chung</h4>
                        <div className='row'>
                            <div className='col-md-6 col-lg-6'>
                                <ProfileIcon type='primary' icon='fa-id-card' title='Hồ sơ cá nhân' link='/user/profile' />
                            </div>
                        </div>

                    </div>
                    {
                        !unfinished.length ?
                            (finish.length < 3 ?
                                <div className='col-md-6 col-lg-6'>
                                    <h4>Sát hạch</h4>
                                    <ProfileIcon type='info' icon='fa-file-text' title={'Đơn đề nghị học, sát hạch mới'} create={this.create} />
                                </div>
                                :
                                <div className='col-md-6 col-lg-6'>
                                    <h4>Sát hạch</h4>
                                    <ProfileIcon type='info' icon='fa-id-card-o' title={'Bạn đã đạt số khóa học tối đa'} />
                                </div>)
                            : (unfinished[0].status == 'progressing' ?
                                <div className='col-md-6' >
                                    <h4>Sát hạch</h4>
                                    <ProfileIcon type='info' icon='fa-briefcase' title={'Khóa học hạng ' + unfinished[0].newLicenseClass} status={unfinished[0].status} link={'/user/bieu-mau/don-de-nghi-hoc/view/' + unfinished[0]._id} />
                                </div>
                                :
                                <div className='col-md-6 col-lg-6'>
                                    <h4>Sát hạch</h4>
                                    <ProfileIcon type='info' icon='fa-briefcase' title={'Khóa học hạng ' + unfinished[0].newLicenseClass} status={unfinished[0].status} link={'/user/bieu-mau/don-de-nghi-hoc/' + unfinished[0]._id} />
                                </div>)
                    }
                    <div className='col-12'>
                        <h4>Danh sách khóa học đã hoàn thành</h4>
                        <div className='row'>
                            {finish.length ? finish.map((item, index) => (
                                <div className='col-md-6' key={index}>
                                    <ProfileIcon type='primary' icon='fa-briefcase' title={'Khóa học hạng ' + item.newLicenseClass} status={item.status} link={'/user/bieu-mau/don-de-nghi-hoc/view/' + item._id} />
                                </div>))
                                : <div className='col-12'>Chưa có khóa học hoàn thành</div>}
                        </div>
                    </div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ donDeNghiHoc: state.donDeNghiHoc, system: state.system });
const mapActionsToProps = { getAllDonDeNghiHocHoanThanhByUser, getAllDonDeNghiHocChuaHoanThanhByUser, createDonDeNghiHocByUser };
export default connect(mapStateToProps, mapActionsToProps)(UserProfilePage);
