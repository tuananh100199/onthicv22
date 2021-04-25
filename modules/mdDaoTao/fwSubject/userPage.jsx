import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, TableCell, renderTable } from 'view/component/AdminPage';

const userPageLink = '/user/hoc-vien/khoa-hoc';
class AdminEditPage extends AdminPage {
    state = {};
    componentDidMount() {

        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/mon-hoc/:_id').parse(url);
        if (params._id) {
            this.props.getSubjectByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push(userPageLink);
                } else if (data.item && data.currentCourse) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + data.currentCourse);
                    const { _id, title, shortDescription, detailDescription } = data.item;
                    this.setState({ _id, title, shortDescription, detailDescription });
                } else {
                    this.props.history.push(userPageLink);
                }
            });
        } else {
            this.props.history.push(userPageLink);
        }
    }

    render() {
        const tableLesson = renderTable({
            getDataSource: () => this.props.subject && this.props.subject.item && this.props.subject.item.lessons,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên bài học</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center', nowrap: 'true' }}>Tiến độ hoàn thành</th> */}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/' + item._id} />
                </tr>),
        });

        const componentInfo = (
            <div className='tile-body'>
                <div className='form-group'>
                    Tên môn học: <b>{this.state.title}</b>
                </div>
                <div className='form-group'>
                    <label>Mô tả ngắn gọn: <b>{this.state.shortDescription}</b></label>
                </div>
                <div className='form-group'>
                    <label>Mô tả chi tiết: </label><p dangerouslySetInnerHTML={{ __html: this.state.detailDescription }} />
                </div>
            </div>
        );
        const componentLesson = (
            <div className='tile-body'>
                {tableLesson}
            </div>);

        const tabs = [{ title: 'Bài học', component: componentLesson }, { title: 'Thông tin chung', component: componentInfo }];
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Môn học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Môn học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubjectByStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);