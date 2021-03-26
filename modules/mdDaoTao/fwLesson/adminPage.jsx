import React from 'react';
import { connect } from 'react-redux';
import { getLessonPage, createLesson, updateLesson, deleteLesson } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox } from 'view/component/AdminPage';

class LessonModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const newData = { title: this.itemTitle.value(), };
        if (newData.title == '') {
            T.notify('Tên bài học bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createLesson(newData, data => {
                this.hide();
                data && data.item && this.props.history.push('/user/dao-tao/bai-hoc/edit/' + data.item._id);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Bài học mới',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên bài học' />
    });
}

class LessonPage extends AdminPage {
    componentDidMount() {
        this.props.getLessonPage();
        T.ready('/user/dao-tao/bai-hoc');
        T.onSearch = searchText => this.props.getLessonPage(null, null, searchText);
    }

    create = e => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Bài học', 'Bạn có chắc bạn muốn xóa bài học này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteLesson(item._id));

    render() {
        const permission = this.getUserPermission('lesson');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.lesson && this.props.lesson.page ?
            this.props.lesson.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có bài học mới!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tiêu đề</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Số video</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Số câu hỏi</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><Link to={'/user/dao-tao/bai-hoc/edit/' + item._id}>{item.title}</Link></td>
                                <td style={{ textAlign: 'right' }}>{item.videos ? item.videos.length : 0}</td>
                                <td style={{ textAlign: 'right' }}>{item.questions ? item.questions.length : 0}</td>
                                {permission.write || permission.delete ? <td>
                                    <div className='btn-group'>
                                        {permission.write ?
                                            <Link to={'/user/dao-tao/bai-hoc/edit/' + item._id} className='btn btn-primary'>
                                                <i className='fa fa-lg fa-edit' />
                                            </Link> : null}
                                        {permission.delete ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td> : null}
                            </tr>))}
                    </tbody>
                </table>);
        }

        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Bài học',
            breadcrumb: ['Bài học'],
            content: <>
                <div className='tile'>{table}</div>
                <LessonModal ref={e => this.modal = e} createLesson={this.props.createLesson} history={this.props.history} readOnly={!permission.write} />
                <Pagination name='pageLesson' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getLessonPage} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { getLessonPage: getLessonPage, createLesson, updateLesson, deleteLesson };
export default connect(mapStateToProps, mapActionsToProps)(LessonPage);
