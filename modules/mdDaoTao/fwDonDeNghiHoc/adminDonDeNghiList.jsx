import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourseTypePage } from 'modules/mdDaoTao/fwCourseType/redux'

class AdminDonDeNghiList extends React.Component {
    componentDidMount() {
        T.ready();
        this.props.getCourseTypePage();
    }
    render() {
        const courseType = this.props.courseType && this.props.courseType.page ? this.props.courseType.page.list : [];
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file-text-o' /> Danh sách đơn chờ duyệt</h1>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <li className='breadcrumb-item'>
                            <i className='fa fa-home fa-lg' />
                        </li>
                        <li className='breadcrumb-item'>Danh sách đơn chờ duyệt</li>
                    </ul>
                </div>
                <div className='row'>
                    {courseType.length ? courseType.map((item, index) => (
                        <div className='col-md-4' key={index}>
                            <Link to={'/user/don-de-nghi-hoc/list/' + item.title} style={{ textDecoration: 'none' }}>
                                <div className={'widget-small coloured-icon ' + (index == 1 ? 'primary' : 'info')} style={{ cursor: 'pointer' }}>
                                    <i className={'icon fa fa-3x fa-list'} />
                                    <div className='info'>
                                        <h4>{'Danh sách đơn chờ duyệt loại ' + item.title}</h4>
                                    </div>
                                </div>
                            </Link>
                        </div>))
                        : <div>Chưa có khóa học chờ duyệt</div>}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ donDeNghiHoc: state.donDeNghiHoc, system: state.system, courseType: state.courseType });
const mapActionsToProps = { getCourseTypePage };
export default connect(mapStateToProps, mapActionsToProps)(AdminDonDeNghiList);
