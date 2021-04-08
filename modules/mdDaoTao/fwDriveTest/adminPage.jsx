import React from 'react';
import { connect } from 'react-redux';
import { getDriveTestPage, createDriveTest, updateDriveTest, swapDriveTest, deleteDriveTest } from './redux';
import { ajaxSelectCourseType } from '../fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class DriveTestModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => {
        this.itemTitle.value('');
        this.itemCourseType.value(null);
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            courseType: this.itemCourseType.value(),
        };
        if (data.title == '') {
            T.notify('Tên bộ đề thi bị trống!', 'danger');
            this.itemTitle.focus();
        } if (!data.courseType) {
            T.notify('Loại khóa học bị trống!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.create(data, data => {
                this.hide();
                data.item && this.props.history.push('/user/drive-test/' + data.item._id);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Bộ đề thi mới',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên bộ đề thi' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemCourseType = e} label='Loại khóa học' data={ajaxSelectCourseType} readOnly={this.props.readOnly} />
        </>,
    });
}

class DriveTestPage extends AdminPage {
    componentDidMount() {
        this.props.getDriveTestPage();
        T.ready();
    }

    create = e => e.preventDefault() || this.modal.show();

    swap = (e, _questionId, isMoveUp) => e.preventDefault() || this.props.swapDriveTest(_questionId, isMoveUp);

    delete = (e, item) => e.preventDefault() || T.confirm('Bộ đề thi', 'Bạn có chắc bạn muốn xóa bộ đề thi này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteDriveTest(item._id));

    render() {
        const permission = this.getUserPermission('driveTest');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.driveTest && this.props.driveTest.page ?
            this.props.driveTest.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên bộ đề thi</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/drive-test/' + item._id} />
                    <TableCell type='text' content={item.courseType ? item.courseType.title : 'Không có loại khóa học'}/>
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateDriveTest(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/drive-test/' + item._id} onSwap={this.swap} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bộ đề thi',
            breadcrumb: ['Bộ đề thi'],
            content: <>
                <div className='tile'>{table}</div>
                <DriveTestModal create={this.props.createDriveTest} ref={e => this.modal = e} history={this.props.history} readOnly={!permission.write} />
                <Pagination name='pageDriveTest' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDriveTestPage} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.driveTest });
const mapActionsToProps = { getDriveTestPage, createDriveTest, updateDriveTest, deleteDriveTest, swapDriveTest };
export default connect(mapStateToProps, mapActionsToProps)(DriveTestPage);