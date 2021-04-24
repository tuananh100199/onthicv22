import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { getAllDriveTests } from 'modules/mdDaoTao/fwDriveTest/redux';
import { getCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage } from 'view/component/AdminPage';


class UserDriveTestView extends AdminPage {

    componentDidUpdate(prevProps) {
        if (this.props.courseType && this.props.courseType !== prevProps.courseType) {
            this.setState({_courseTypeId: this.props.courseType._id})
            this.props.getAllDriveTests({ courseType: this.props.courseType._id });
        }
    }

    render() {
        const _courseTypeId = this.state && this.state._courseTypeId ? this.state._courseTypeId : '';
        const { list } = this.props.driveTest ? this.props.driveTest : [];
        const content = <>
            {list && list.map((driveTest, index) => (
                <div key={index} className='col-md-6 col-lg-6'>
                    <Link to= {'/user/hoc-vien/khoa-hoc/de-thi-thu/' + driveTest._id }>
                        <div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa fa-cubes' />
                            <div className='info'>
                                <h4>{driveTest.title}</h4>
                            </div>
                        </div>
                    </Link>
                </div>
            ))
            }
            <div className='col-md-6 col-lg-6'>
                <Link to= {'/user/hoc-vien/khoa-hoc/de-thi-ngau-nhien/' + _courseTypeId}>
                    <div className='widget-small coloured-icon info'>
                        <i className='icon fa fa-3x fa fa-cubes' />
                        <div className='info'>
                            <h4>Đề thi ngẫu nhiên</h4>
                        </div>
                    </div>
                </Link>
            </div>
        </>;
        return (
            <div className='tile-body row'>
                {content}
            </div>);
    }
}
const mapStateToProps = state => ({ system: state.system,  driveTest: state.driveTest });
const mapActionsToProps = { getUserCourse, getAllDriveTests, getCourseType };
export default connect(mapStateToProps, mapActionsToProps)(UserDriveTestView);
