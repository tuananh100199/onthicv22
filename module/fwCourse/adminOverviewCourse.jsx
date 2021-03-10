import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from './redux.jsx';
import { Link } from 'react-router-dom';
import SubMenusPage from '../../view/component/SubMenusPage.jsx';

class AdminOverviewCourse extends React.Component {
    state = { item: null };

    componentDidMount() {
        T.ready('/user/course/list', () => {
            const route = T.routeMatcher('/user/course/item/:courseId'),
                courseId = route.parse(window.location.pathname).courseId;
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/list');
                } else if (data.item) {
                    this.setState(data);
                    console.log("staet", this.state)
                } else {
                    this.props.history.push('/user/course/list');
                }
            });
        });
    }
    render() {
        const item = this.state.item ? this.state.item : '';
        return (
            // <SubMenusPage menuLink='/user/course/item/:courseId' menuKey={7000} headerIcon='fa fa-file'
            //     customTitle={this.state.item ? this.state.item.title : ''} customBelowTitle={this.state.item ? this.state.item.licenseClass : ''} />
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-user' /> {this.state.item ? this.state.item.title : ''}</h1>
                        <p>{this.state.item ? this.state.item.licenseClass : ''}</p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <li className='breadcrumb-item'>
                            <i className='fa fa-home fa-lg' />
                        </li>
                        <li className='breadcrumb-item'>{this.state.item ? this.state.item.title : ''}</li>
                    </ul>
                </div>

                <div className='row'>
                    <div className='col-12'>
                        <h4>Thông tin chung</h4>
                        <div className='row'>
                            <div className='col-md-6 col-lg-6'>
                                <Link to={'/user/course/edit/common/' + item._id} style={{ textDecoration: 'none' }}>
                                    <div className={'widget-small coloured-icon primary'}>
                                        <i className={'icon fa fa-3x fa-id-card'} />
                                        <div className='info'>
                                            <h4>Thông tin chung</h4>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                    </div>
                    {/* {
                        !unfinished.length ?
                            (finish.length < 3 ?
                                <div className='col-md-6 col-lg-6'>
                                    <h4>Sát hạch</h4>
                                    <div onClick={this.create} className={'widget-small coloured-icon info'} style={{ cursor: 'pointer' }}>
                                        <i className={'icon fa fa-3x fa-file-text'} />
                                        <div className='info'>
                                            <h4>Đơn đề nghị học, sát hạch mới</h4>
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
                                                <p>Trạng thái: {(unfinished[0].status == 'waiting' ? 'Mới' :
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
                    </div> */}
                </div>
            </main>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminOverviewCourse);
