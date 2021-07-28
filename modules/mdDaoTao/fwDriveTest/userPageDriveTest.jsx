import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDriveTestPage } from './redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';

class DriveTestContent extends AdminPage {
    state = { courseType: null };
    componentDidMount() {
        T.ready(() => {
            const courseType = this.props.courseType;
            this.props.getDriveTestPage(undefined, undefined, {}, courseType);
            this.setState({ courseType });
        });

    }
    getPage = (pageNumber, pageSize) => {
        this.props.getDriveTestPage(pageNumber, pageSize, {}, this.state.courseType);
    }

    render() {
        const { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.driveTest && this.props.driveTest[this.state.courseType] ?
            this.props.driveTest[this.state.courseType] : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        return (
            <div className='tile-body'>
                <div className='row'>
                    {list && list.length ? list.map((driveTest, index) => (
                        <div key={index} className='col-md-6 col-lg-4'>
                            <Link to={'/user/hoc-vien/khoa-hoc/bo-de-thi-thu/' + driveTest._id}>
                                <div className='widget-small coloured-icon info border'>
                                    <i className='icon fa fa-3x fa fa-cubes' />
                                    <div className='info'>
                                        <h4>{driveTest.title}</h4>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )) : <div className='col-12'>Không có dữ liệu!</div>}
                </div>
                <Pagination name='pageDriveTest' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} pageCondition={pageCondition} />
            </div>);
    }
}

class UserDriveTestPage extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ courseTypes });
        });
        T.ready();
    }

    create = e => e.preventDefault() || this.modal.show();

    render() {
        const courseTypes = this.state.courseTypes ? this.state.courseTypes : [];
        const tabs = courseTypes.length ? courseTypes.map(courseType => ({ title: courseType.text, component: <DriveTestContent driveTest={this.props.driveTest} getDriveTestPage={this.props.getDriveTestPage} courseType={courseType.id} /> })) : [];
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Bộ đề thi thử',
            breadcrumb: ['Bộ đề thi thử'],
            content: <>
                <FormTabs id='coursePageTab' contentClassName='tile' tabs={tabs} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseTypeAll, getDriveTestPage };
export default connect(mapStateToProps, mapActionsToProps)(UserDriveTestPage);
