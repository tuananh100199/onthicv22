import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllDonDeNghiHocHoanThanhByUser, getAllDonDeNghiHocChuaHoanThanhByUser, createDonDeNghiHocByUser } from '../fwDonDeNghiHoc/redux';

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
                                <Link to='/user/profile' style={{ textDecoration: 'none' }}>
                                    <div className={'widget-small coloured-icon primary'}>
                                        <i className={'icon fa fa-3x fa-id-card'} />
                                        <div className='info'>
                                            <h4>Hồ sơ cá nhân</h4>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                    </div>
                    {
                        !unfinished.length ?
                            (finish.length < 3 ?
                                <div className='col-md-6 col-lg-6'>
                                    <h4>Sát hạch</h4>
                                    <div onClick={this.create} className={'widget-small coloured-icon info'} style={{ cursor: 'pointer' }}>
                                        <i className={'icon fa fa-3x fa-file-text'} />
                                        <div className='info'>
                                            <h4>Đơn đề nghị học, sát hạch mới</h4>
                                            {this.props.status ?
                                                <p>Trạng thái: {(this.props.status == 'waiting' ? 'Chờ duyệt' :
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
                                </div>
                                :
                                <div className='col-md-6 col-lg-6'>
                                    <h4>Sát hạch</h4>
                                    <div className={'widget-small coloured-icon info'} >
                                        <i className={'icon fa fa-3x fa-check'} />
                                        <div className='info'>
                                            <h4>Bạn đã đạt số khóa học tối đa!</h4>
                                        </div>
                                    </div>
                                </div>)
                            :
                            <div className='col-md-6 col-lg-6'>
                                <h4>Sát hạch</h4>
                                <Link to={'/user/bieu-mau/don-de-nghi-hoc/' + unfinished[0]._id} style={{ textDecoration: 'none' }}>
                                    <div className={'widget-small coloured-icon info'} style={{ cursor: 'pointer' }}>
                                        <i className={'icon fa fa-3x fa-briefcase'} />
                                        <div className='info'>
                                            <h4>{'Khóa học hạng ' + unfinished[0].newLicenseClass}</h4>
                                            {unfinished[0].status ?
                                                <p>Trạng thái: {(unfinished[0].status == 'waiting' ? 'Đang chờ duyệt' :
                                                    (unfinished[0].status == 'approved' ? <span className='text-success'>Đã duyệt</span> :
                                                        (unfinished[0].status == 'reject' ? <span className='text-danger'>Từ chối</span> :
                                                            (unfinished[0].status == 'progressing' ? <span className='text-primary'>Đang theo học</span>
                                                                : <span className='text-warning'>Đã hoàn thành</span>)
                                                        )
                                                    )
                                                )}</p>
                                                : <p></p>
                                            }
                                        </div>
                                    </div>
                                </Link>
                            </div>
                    }
                    <div className='col-12'>
                        <h4>Danh sách khóa học đã hoàn thành</h4>
                        <div className='row'>
                            {finish.length ? finish.map((item, index) => (
                                <div className='col-md-6' key={index}>
                                    <Link to={'/user/bieu-mau/don-de-nghi-hoc/' + item._id} style={{ textDecoration: 'none' }}>
                                        <div className={'widget-small coloured-icon primary'} style={{ cursor: 'pointer' }}>
                                            <i className={'icon fa fa-3x fa-briefcase'} />
                                            <div className='info'>
                                                <h4>{'Khóa học hạng ' + item.newLicenseClass}</h4>
                                                {item.status ?
                                                    <p>Trạng thái: <span className='text-warning'>Đã hoàn thành</span></p>
                                                    : <p></p>
                                                }
                                            </div>
                                        </div>
                                    </Link>
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
