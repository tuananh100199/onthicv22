import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';
import 'modules/mdDaoTao/fwChat/chat.scss';
import { Link } from 'react-router-dom';
import { getCourse } from '../fwCourse/redux';
import LecturerView from 'modules/mdDaoTao//fwTimeTable/lecturerView';
import './timeTable.scss';


export class AdminTimeTablePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/calendar').parse(window.location.pathname);
            if (params && params._id) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else if (data.item) {
                            const listLecturer = data.item && data.item.teacherGroups && data.item.teacherGroups.length &&  data.item.teacherGroups.map(group => group.teacher); 
                            listLecturer && listLecturer.length && this.setState({ currentLecturer: listLecturer[0], listLecturer: listLecturer, filterOn: false, key: listLecturer[0], list: true, grid: false});
                        }
                    });
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    onChange = (value) => {
        this.setState({ filterOn: value , key: !this.state.key});
        this.forceUpdate();
    }

    selectLecturer = (lecturer) => {
        this.setState({ currentLecturer: lecturer, key: !this.state.key});
    }
    render() {
        const { currentLecturer, listLecturer, filterOn, key, grid, list } = this.state;
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const inboxTimeTable = listLecturer && listLecturer.length && listLecturer.map((lecturer, index) => {
            const isSelectedUser = currentLecturer && currentLecturer._id ==  lecturer._id;
            return (
                <div key={index} className={'lecturer_list' + (isSelectedUser ? ' active_lecturer' : '')} style={{ cursor: 'pointer' }} onClick={e => e.preventDefault() || this.selectLecturer(lecturer)}>
                    <div className='lecturer'>
                        <div className='lecturer_img'> <img src={lecturer.user ? lecturer.user.image : lecturer.image} alt={lecturer.lastname} /> </div>
                        <div className='lecturer_info'>
                            <h6>{lecturer.lastname + ' ' + lecturer.firstname}</h6>
                        </div>
                    </div>
                </div>);
        });
        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-weixin',
            title: 'Thời khóa biểu: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Thời khóa biểu'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='box_time_table row' >
                            <div className='box_people col-sm-3'>
                                <div className='headind_srch'>
                                    <div className='recent_heading'>
                                        <h4>Danh sách cố vấn</h4>
                                    </div>
                                </div>
                                <div>
                                    {inboxTimeTable}
                                </div>
                            </div>
                            <div className='col-sm-9' >
                                <div className='recent_heading pb-3'>
                                    <h4 style={{float: 'left'}}>{currentLecturer && currentLecturer.lastname + ' ' + currentLecturer.firstname }</h4>
                                    <div style={{float: 'right', display: 'flex'}}>
                                        <button style={{border: 'none', outlineColor: '#2189CF', marginRight: '3px'}} onClick={() => this.setState({grid: false, list: true})}><i className="fa fa-bars"></i> List</button>
                                        <button style={{border: 'none', outlineColor: '#2189CF'}} onClick={() =>this.setState({grid: true, list: false})}><i className="fa fa-th-large"></i> Grid</button>
                                        <FormCheckbox ref={e => this.course = e} style={{paddingLeft: '12px'}} onChange={value => this.onChange(value)} label='Hiển thị ngày hiện tại' />
                                    </div>
                                </div>
                                {list && item && item._id ? <LecturerView  key={key} courseId={item._id} lecturerId={currentLecturer && currentLecturer._id} filterOn={filterOn}/> : null}
                                {grid ? <>TODO</> : null}
                            </div>
                        </div>
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminTimeTablePage);