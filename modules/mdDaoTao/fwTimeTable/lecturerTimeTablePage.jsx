import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse } from '../fwCourse/redux';
import LecturerView from 'modules/mdDaoTao//fwTimeTable/lecturerView';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';

export class LecturerTimeTablePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/lecturer/calendar').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                }

               this.setState({ filterOn: false, key: false, list: false, calendar: true});
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        const { key, calendar, list, filterOn } = this.state;
        const { user } = this.props.system ? this.props.system : {};
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khóa biểu: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Thời khóa biểu'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='pb-3' style={{marginBottom: '25px'}}>
                            <div style={{float: 'right', display: 'flex'}}>
                                {list ? <FormCheckbox ref={e => this.course = e} style={{paddingRight: '12px'}} onChange={value => this.setState({ key: !key, filterOn: value })} label='Hiển thị ngày hiện tại' /> : null}
                                <button style={{border: 'none', outline: 'none', marginRight: '3px', backgroundColor: list ? '#2189CF' : ''}} onClick={() => this.setState({ key: !key, calendar: false, list: true })}><i className='fa fa-bars'></i> Danh sách</button>
                                <button style={{border: 'none', outline: 'none', backgroundColor: calendar ? '#2189CF' : ''}} onClick={() =>this.setState({ key: !key, calendar: true, list: false, filterOn: false})}><i className='fa fa-calendar'></i> Lịch</button>
                            </div>
                        </div>
                        {item && item._id ? <LecturerView key={key} official={true} courseId={item._id} lecturerId={user && user._id} filterOn={filterOn} calendar={calendar} list={list} lecturerName={user && user.lastname + ' ' + user.firstname}/> : null}
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(LecturerTimeTablePage);