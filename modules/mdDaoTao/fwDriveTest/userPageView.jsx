import React from 'react';
import { connect } from 'react-redux';
import { getAllDriveTests } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

const previousRoute = '/user';
class UserPageDriveTestDetail extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/bo-de-thi-thu/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseTypeId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/bo-de-thi-thu/' + _id, () => {
                this.props.getAllDriveTests({ courseType: _id });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const { list } = this.props.driveTest ? this.props.driveTest : [];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name),
            breadcrumb: ['Khóa học'],
            content: (
                <div className='row'>
                    <div className='col-12'>
                        <h4>Ôn tập đề thi</h4>
                        <div className='row'>
                            {list && list.map((driveTest, index) => (
                                <div key={index} className='col-md-4'>
                                    <Link to={'/user/hoc-vien/khoa-hoc/de-thi-thu/' + driveTest._id}>
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
                        </div>
                    </div>
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course, driveTest: state.driveTest });
const mapActionsToProps = { getAllDriveTests };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTestDetail);
