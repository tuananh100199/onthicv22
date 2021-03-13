import React from 'react';
import { connect } from 'react-redux';
import { getMonHoc } from './redux';
import { Link } from 'react-router-dom';
import AdminEditInfo from './adminEditInfo';
import AdminEditBaiHoc from './adminEditBaiHoc';
import AdminEditCauHoi from './adminEditCauHoi';


class EditPage extends React.Component {
    state = { item: null };

    componentDidMount() {
        T.ready('/user/dao-tao/mon-hoc/list', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:monHocId').parse(url);
            this.props.getMonHoc(params.monHocId, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/mon-hoc/list');
                } else if (data.item) {
                    this.setState(data);
                } else {
                    this.props.history.push('/user/dao-tao/mon-hoc/list');
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
                        &nbsp;/&nbsp;Môn học học &nbsp;/&nbsp; Chỉnh Sửa
                    </ul>
                </div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#common'>Thông tin chung</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#lesson'>Bài học</a></li>
                    <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#question'>Câu hỏi</a></li>
                </ul>
                <div className='tab-content tile'>
                    <div className='tab-pane fade active show' id='common'><AdminEditInfo history={this.props.history} /></div>
                    <div className='tab-pane fade' id='lesson'><AdminEditBaiHoc history={this.props.history} /></div>
                    <div className='tab-pane fade' id='question'><AdminEditCauHoi history={this.props.history} /></div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getMonHoc };
export default connect(mapStateToProps, mapActionsToProps)(EditPage);
