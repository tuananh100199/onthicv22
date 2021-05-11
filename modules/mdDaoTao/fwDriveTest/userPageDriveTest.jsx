import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getAllDriveTests } from './redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, FormSelect } from 'view/component/AdminPage';

class UserPageDriveTestDetail extends AdminPage {
    state = {};
    componentDidMount() {
        // T.ready( () => {
        //     this.props.getCourseTypeAll(list => {
        //         if (list.length > 0) {
        //             this.courseType.value({ id: list[0]._id, text: list[0].title });
        //         }
        //     });
        // })
    }

    render() {
        const { list } = this.props.driveTest ? this.props.driveTest : [];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Loại bộ đề thi thử ',
            breadcrumb: ['Loại bộ đề thi thử'],
            content: (
                <div className='tile'>
                    <div className="row">
                        <h4 className='col-12'>Loại bộ đề thi </h4>
                        <FormSelect ref={e => this.courseType = e} label='Loại bộ đề thi' data={ajaxSelectCourseType} onChange={data => this.props.getAllDriveTests({ courseType: data.id })} className='col-md-4' />
                    </div>
                   <div className='row'>
                        {list && list.map((driveTest, index) => (
                            <div key={index} className='col-md-4'>
                                <Link to={'/user/hoc-vien/khoa-hoc/bo-de-thi-thu/' + driveTest._id}>
                                    <div className='widget-small coloured-icon info border'>
                                        <i className='icon fa fa-3x fa fa-cubes' />
                                        <div className='info'>
                                            <h4>{driveTest.title}</h4>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseTypeAll, getAllDriveTests };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTestDetail);
