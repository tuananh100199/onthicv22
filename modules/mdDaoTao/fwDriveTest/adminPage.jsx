import React from 'react';
import { connect } from 'react-redux';
import { getDriveTestPage, createDriveTest, updateDriveTest, swapDriveTest, deleteDriveTest } from './redux';
import { ajaxSelectCourseType, getCourseTypeAll } from '../fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, TableCell, renderTable, FormTabs } from 'view/component/AdminPage';
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
        } else if (!data.courseType) {
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
class DriveTestContent extends AdminPage {
    state = { courseType: null };
    componentDidMount() {
        T.ready(() => {
            const courseType = this.props.courseType;
            this.props.getDriveTestPage( undefined, undefined, {}, courseType);
            this.setState({ courseType });
        });

    }
    getPage = (pageNumber, pageSize) => {
        this.props.getDriveTestPage(pageNumber, pageSize, {}, this.state.courseType);
    }

    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapDriveTest(item._id, isMoveUp, this.state.courseType);

    delete = (e, item) => e.preventDefault() || T.confirm('Bộ đề thi', 'Bạn có chắc bạn muốn xóa bộ đề thi này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteDriveTest(item._id, this.state.courseType));

    render() {
            const permission = this.props.permission;
            const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.driveTest && this.props.driveTest[this.state.courseType] ?
            this.props.driveTest[this.state.courseType] : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
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
                        <TableCell type='text' content={item.courseType ? item.courseType.title : 'Không có loại khóa học'} />
                        <TableCell type='checkbox' content={item.active} permission={permission} onChanged={() => this.props.updateDriveTest(item._id, { active: !item.active, courseType: item.courseType._id  })} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/drive-test/' + item._id} onSwap={this.swap} onDelete={this.delete} />
                    </tr>),
            });
    
            return(
                <div className='tile-body'>
                    {table}
                    <Pagination name='pageDriveTest' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDriveTestPage} />
                </div>
            );
        }
}

class DriveTestPage extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ courseTypes });
        });
        T.ready();
    }
    create = e => e.preventDefault() || this.modal.show();

    render() {
        const permission = this.getUserPermission('driveTest');
        const courseTypes = this.state.courseTypes ? this.state.courseTypes : [];
        const tabs = courseTypes.length ? courseTypes.map(courseType => ({ 
            title: courseType.text, 
            component: <DriveTestContent driveTest={this.props.driveTest} 
                                        getDriveTestPage={this.props.getDriveTestPage} 
                                        courseType={courseType.id} 
                                        swapDriveTest={this.props.swapDriveTest} 
                                        deleteDriveTest={this.props.deleteDriveTest} 
                                        updateDriveTest={this.props.updateDriveTest}
                                        permission={permission}/> })) : [];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bộ đề thi thử',
            breadcrumb: ['Bộ đề thi thử'],
            content: <>
                <FormTabs id='coursePageTab' contentClassName='tile' tabs={tabs} />
                <DriveTestModal create={this.props.createDriveTest} ref={e => this.modal = e} history={this.props.history} readOnly={!permission.write} />
            </>,
             onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getDriveTestPage, createDriveTest, updateDriveTest, deleteDriveTest, swapDriveTest, getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(DriveTestPage);