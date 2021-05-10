import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class UserPageDriveTestDetail extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getCourseTypeAll(list => {
            this.setState({ courseTypes: list.map(({ _id, title }) => ({ _id, title })) });
        });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Loại bộ đề thi thử ',
            breadcrumb: ['Loại bộ đề thi thử'],
            content: (
                <div className='row'>
                    <h4 className='col-12'>Loại bộ đề thi </h4>
                    {(this.state.courseTypes || []).map((type, index) => (
                        <div key={index} className='col-md-4'>
                            <Link to={'/user/hoc-vien/khoa-hoc/bo-de-thi-thu/' + type._id}>
                                <div className='widget-small coloured-icon info'>
                                    <i className='icon fa fa-3x fa fa-cubes' />
                                    <div className='info'>
                                        <h4>Loại {type.title}</h4>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTestDetail);
