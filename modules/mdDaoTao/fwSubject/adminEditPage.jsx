import React from 'react';
import { connect } from 'react-redux';
import { getSubject } from './redux';
import { Link } from 'react-router-dom';
import AdminEditInfo from './adminEditInfoTab';
import AdminEditLesson from './adminEditLessonTab';
import AdminEditQuestion from './adminEditQuestionTab';

class AdminEditPage extends React.Component {
    state = { item: null };

    componentDidMount() {
        T.ready('/user/dao-tao/mon-hoc', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:_id').parse(url);
            this.props.getSubject(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/mon-hoc');
                } else if (data.item) {
                    this.setState(data);
                } else {
                    this.props.history.push('/user/dao-tao/mon-hoc');
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
                    <h1><i className='fa fa-file' /> Môn học:&nbsp; {this.state.item ? this.state.item.title : ''}</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        <Link to='/user/dao-tao/mon-hoc'>&nbsp;/&nbsp;Môn học &nbsp;/</Link>
                        &nbsp; Chỉnh Sửa
                    </ul>
                </div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#common'>Thông tin chung</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#lesson'>Bài học</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#question'>Câu hỏi phản hồi</a></li>
                </ul>
                <div className='tab-content tile'>
                    <div className='tab-pane fade active show' id='common'><AdminEditInfo history={this.props.history} /></div>
                    <div className='tab-pane fade' id='lesson'><AdminEditLesson history={this.props.history} /></div>
                    <div className='tab-pane fade' id='question'><AdminEditQuestion history={this.props.history} /></div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);