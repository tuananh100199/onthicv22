import React from 'react';
import { connect } from 'react-redux';
import { getLessonPage, createLesson, updateLesson, deleteLesson } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class LessonModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const data = { title: this.itemTitle.value(), };
        if (data.title == '') {
            T.notify('Tên bài học bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createLesson(data, data => {
                this.hide();
                data && data.item && this.props.history.push('/user/dao-tao/bai-hoc/' + data.item._id);
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
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.lesson && this.props.lesson.page ?
            this.props.lesson.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };

        const table = renderTable({
            getDataSource: () => this.props.lesson && this.props.lesson.page && this.props.lesson.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tiêu đề</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số video</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số câu hỏi</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/dao-tao/bai-hoc/' + item._id} />
                    <TableCell type='number' content={item.videos ? item.videos.length : 0} />
                    <TableCell type='number' content={item.questions ? item.questions.length : 0} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/dao-tao/bai-hoc/' + item._id} onDelete={this.delete} />
                </tr>),
        });

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

const mapStateToProps = state => ({ system: state.system, lesson: state.trainning.lesson });
const mapActionsToProps = { getLessonPage: getLessonPage, createLesson, updateLesson, deleteLesson };
export default connect(mapStateToProps, mapActionsToProps)(LessonPage);
