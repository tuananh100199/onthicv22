import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse } from './redux';
import CommonInfoPage from './commonInfoPage';
import SubjectPage from './subjectPage';

class EditPage extends React.Component {
    state = { item: null };

    componentDidMount() {
        T.ready('/user/course/list', () => {
            const route = T.routeMatcher('/user/course/edit/:courseId'),
                courseId = route.parse(window.location.pathname).courseId;
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/list');
                } else if (data.item) {
                    this.setState(data);
                } else {
                    this.props.history.push('/user/course/list');
                }
            });
            let tabIndex = parseInt(T.cookie('componentPageTab')),
                navTabs = $('#componentPage ul.nav.nav-tabs');
            if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= navTabs.children().length) tabIndex = 0;
            navTabs.find('li:nth-child(' + (tabIndex + 1) + ') a').tab('show');
            $('#componentPage').fadeIn();

            $(`a[data-toggle='tab']`).on('shown.bs.tab', e => {
                T.cookie('componentPageTab', $(e.target).parent().index());
            });
        });
    }

    render() {
        return (
            <main className='app-content' id='componentPage' style={{ display: 'none' }}>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> {this.state.item ? this.state.item.title : ''}:&nbsp; Chỉnh sửa</h1>
                        <p>{this.state.item && this.state.item.licenseClass && this.state.item.licenseClass.title ? this.state.item.licenseClass.title : ''}</p>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;Khóa học &nbsp;/&nbsp; Chỉnh Sửa
                    </ul>
                </div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#common'>Thông tin chung</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#subject'>Môn học</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuCarousel'>Cố vấn học tập</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#menuVideo'>Học viên</a></li>
                </ul>
                <div className='tab-content tile'>
                    <div className='tab-pane fade active show' id='common'><CommonInfoPage history={this.props.history} /></div>
                    <div className='tab-pane fade' id='subject'><SubjectPage history={this.props.history} /></div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditPage);
