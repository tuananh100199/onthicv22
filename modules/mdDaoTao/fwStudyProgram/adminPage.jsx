import React from 'react';
import { connect } from 'react-redux';
import { getStudyProgramAll, createStudyProgram, deleteStudyProgram, updateStudyProgram } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class StudyProgramModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const data = { title: this.itemTitle.value() };
        if (data.title == '') {
            T.notify('Tên chương trình học bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/study-program/' + data.item._id);
                }
            });
        }
    }

    render = () => this.renderModal({
        title: 'Chương trình học mới',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên chương trình học' />
    });
}

class StudyProgramPage extends AdminPage {
    componentDidMount() {
        this.props.getStudyProgramAll();
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getStudyProgramAll(searchText);
    }

    create = e => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa chương trình học', 'Bạn có chắc bạn muốn xóa chương trình học này?', true, isConfirm => isConfirm &&
        this.props.deleteStudyProgram(item._id));

    render() {
        const permission = this.getUserPermission('studyProgram');
        const table = renderTable({
            getDataSource: () => this.props.studyProgram && this.props.studyProgram.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên chương trình học</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/study-program/' + item._id} />
                    <TableCell type='image' style={{ width: '20%' }} content={item.image} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/study-program/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Cơ sở đào tạo',
            breadcrumb: ['Cơ sở đào tạo'],
            content: <>
                <div className='tile'>{table}</div>
                <StudyProgramModal ref={e => this.modal = e} create={this.props.createStudyProgram} history={this.props.history} readOnly={!permission.write} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, studyProgram: state.trainning.studyProgram });
const mapActionsToProps = { getStudyProgramAll, createStudyProgram, deleteStudyProgram, updateStudyProgram };
export default connect(mapStateToProps, mapActionsToProps)(StudyProgramPage);