import React from 'react';
import { connect } from 'react-redux';
import { updateLesson, getLesson } from './redux/reduxLesson';
import { Link } from 'react-router-dom';
import AdminEditInfo from './adminEditInfo';
import AdminEditLessonQuestion from './adminEditLessonQuestion';
import AdminEditLessonVideo from './adminEditLessonVideo';

class adminEditPage extends React.Component {
    state = { item: null };
    editor = React.createRef();

    componentDidMount() {
        T.ready(() => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            this.props.getLesson(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                } else if (data.item) {
                    this.setState(data);
                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
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
                        <h1><i className='fa fa-book' />Bài học:&nbsp; {this.state.item ? this.state.item.title : ''}</h1>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;Bài học &nbsp;/&nbsp; Chỉnh Sửa
                    </ul>
                </div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#common'>Thông tin chung</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#lessonVideo'>Video bài giảng</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#lessonQuestion'>Câu hỏi</a></li>
                </ul>
                <div className='tab-content tile'>
                    <div className='tab-pane fade active show' id='common'><AdminEditInfo history={this.props.history} /></div>
                    <div className='tab-pane fade' id='lessonVideo'><AdminEditLessonVideo history={this.props.history} /></div>
                    <div className='tab-pane fade' id='lessonQuestion'><AdminEditLessonQuestion history={this.props.history} /></div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { updateLesson, getLesson };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);
