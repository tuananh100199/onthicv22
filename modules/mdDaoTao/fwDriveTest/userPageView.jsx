import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class UserPageDriveTestDetail extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ _id: item._id, title: item.title }));
            this.setState({ courseTypes });
        });
    }
    render() {
        const { courseTypes } = this.state ? this.state : [];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bộ đề thi thử ',
            breadcrumb: ['Bộ đề thi thử'],
            content: (
                <div className='row'>
                    <div className='col-12'>
                        <h4>Loại khóa học</h4>
                        <div className='row'>
                            {courseTypes && courseTypes.map((type, index) => (
                                <div key={index} className='col-md-4'>
                                    <Link to={'/user/hoc-vien/khoa-hoc/bo-de-thi-thu/' + type._id}>
                                        <div className='widget-small coloured-icon info'>
                                            <i className='icon fa fa-3x fa fa-cubes' />
                                            <div className='info'>
                                                <h4>Loại khóa học {type.title}</h4>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                            }
                        </div>
                    </div>
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.driveTest });
const mapActionsToProps = { getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTestDetail);
