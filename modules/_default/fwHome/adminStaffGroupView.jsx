import React from 'react';
import { connect } from 'react-redux';
import { getStaffGroupAll, createStaffGroup, deleteStaffGroup, updateStaffGroup } from './redux/reduxStaffGroup';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class StaffGroupModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => {
        this.itemTitle.value('');
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value().trim(),
        };
        if (data.title == '') {
            T.notify('Tên nhóm nhân viên bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/staff-group/' + data.item._id);
                }
            })
        }
    }

    render = () => this.renderModal({
        title: 'Nhóm nhân viên',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên nhóm nhân viên' />
        </>
    })
}

class StaffGroupPage extends React.Component {
    componentDidMount() {
        this.props.getStaffGroupAll();
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhóm nhân viên', 'Bạn có chắc bạn muốn xóa nhóm nhân viên này?', true, isConfirm =>
        isConfirm && this.props.deleteStaffGroup(item._id));

    render() {
        const permission = this.props.permission;
        let table = renderTable({
            getDataSource: () => this.props.component.staffGroup && this.props.component.staffGroup.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên nhóm</th>
                    <th style={{ width: 'auto', textAlign: 'right' }} nowrap='true'>Số lượng nhân viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/staff-group/' + item._id} />
                    <TableCell type='number' content={item.numberOfStaff} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateStaffGroup(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/staff-group/' + item._id} onDelete={this.delete} />
                </tr>
            )
        })
        return <>
            {table}
            <StaffGroupModal key={1} ref={e => this.modal = e} create={this.props.createStaffGroup} readOnly={!permission.write} history={this.props.history} />,
            {permission.write ? <CirclePageButton type='create' onClick={e => this.modal.show()} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { getStaffGroupAll, createStaffGroup, deleteStaffGroup, updateStaffGroup };
export default connect(mapStateToProps, mapActionsToProps)(StaffGroupPage);