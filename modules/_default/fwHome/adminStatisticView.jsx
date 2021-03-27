import React from 'react';
import { connect } from 'react-redux';
import { getStatisticAll, createStatistic, updateStatistic, deleteStatistic } from './redux/reduxStatistic';
import { CirclePageButton, AdminPage, FormEditor, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class StatisticModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => {
        this.itemTitle.value('');
        this.itemDescription.html('');
    }
    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            description: this.itemDescription.html()
        };
        if (data.title == '') {
            T.notify('Tên nhóm thống kê bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data, this.hide);
        }
    }
    render = () => this.renderModal({
        title: 'Thống kê',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên nhóm thống kê' />
            <FormEditor ref={e => this.itemDescription = e} height='200px' label='Mô tả chi tiết' uploadUrl='/user/upload?category=statistic' />
        </>
    });
}

class StatisticPage extends AdminPage {
    componentDidMount() {
        this.props.getStatisticAll();
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhóm thống kê', 'Bạn có chắc bạn muốn xóa nhóm thống kê này?', true, isConfirm => isConfirm &&
        this.props.deleteStatistic(item._id));

    render() {
        const permission = this.getUserPermission('component');
        const table = renderTable({
            getDataSource: () => this.props.component.statistic && this.props.component.statistic.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên nhóm</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/statistic/' + item._id} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateStatistic(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/statistic/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return (<>
            {table}
            <StatisticModal ref={e => this.modal = e} create={this.props.createStatistic} readOnly={!permission.write} />
            {permission.write ? <CirclePageButton type='create' onClick={e => this.modal.show()} /> : null}
        </>)
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getStatisticAll, createStatistic, deleteStatistic, updateStatistic };
export default connect(mapStateToProps, mapActionsToProps)(StatisticPage);