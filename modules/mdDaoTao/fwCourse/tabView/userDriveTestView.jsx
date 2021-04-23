import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { getDriveTestPage } from 'modules/mdDaoTao/fwDriveTest/redux';
import { AdminPage } from 'view/component/AdminPage';


class UserDriveTestView extends AdminPage {
    componentDidMount() {
        if (this.props.system && this.props.system.user) {
            this.props.getDriveTestPage();
            T.ready();
        }
    }
    
    render() {

        const { list } = this.props.driveTest && this.props.driveTest.page ?
        this.props.driveTest.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const content = <>
            {list && list.map((driveTest, index) => (
                <div key={index} className='col-md-6 col-lg-6'>
                    <Link to= {'/user/hoc-vien/khoa-hoc/de-thi-thu/' + driveTest._id }>
                        <div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa fa-cubes' />
                            <div className='info'>
                                <h4>{driveTest.title}</h4>
                                {/* {student.course ?
                                    <p style={{ fontWeight: 'bold' }}>Lớp: {student.course.name}</p>
                                    :
                                    <p style={{ fontWeight: 'bold' }}> Đang chờ khóa </p>
                                } */}
                            </div>
                        </div>
                    </Link>
                </div>
            ))
            }
        </>;
        return (
            <div className='tile-body row'>
                {content}
            </div>);
    }
}
const mapStateToProps = state => ({ system: state.system,  driveTest: state.driveTest });
const mapActionsToProps = { getUserCourse, getDriveTestPage };
export default connect(mapStateToProps, mapActionsToProps)(UserDriveTestView);
