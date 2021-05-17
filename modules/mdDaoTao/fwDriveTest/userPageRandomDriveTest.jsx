import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class UserPageRandomDriveTest extends AdminPage {
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
            icon: 'fa fa-dashboard',
            title: 'Bộ đề thi ngẫu nhiên ',
            breadcrumb: ['Bộ đề thi ngẫu nhiên'],
            content: (
                <div className='row'>
                    <h4 className='col-12'>Loại đề thi</h4>
                    {courseTypes && courseTypes.map((type, index) => (
                        <div key={index} className='col-md-4'>
                            <Link to={'/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien/' + type._id}>
                                <div className='widget-small coloured-icon info'>
                                    <i className='icon fa fa-3x fa fa-cubes' />
                                    <div className='info'>
                                        <h4>Loại {type.title}</h4>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(UserPageRandomDriveTest);
