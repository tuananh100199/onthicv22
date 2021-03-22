import React from 'react';
import { connect } from 'react-redux';
import { getAllStatistics, createStatistic, deleteStatistic } from './redux/reduxStatistic';
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
        const newData = {
            title: this.itemTitle.value(),
            description: this.itemDescription.html()
        };
        if (newData.title == '') {
            T.notify('Tên nhóm thống kê bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createStatistic(newData, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/statistic/edit/' + data.item._id);
                }
            });
        }
    }
    render = () => this.renderModal({
        title: 'Thống kê',
        body: <> <FormTextBox ref={e => this.itemTitle = e} label='Tên nhóm thống kê' />
            <FormEditor ref={e => this.itemDescription = e} height='200px' label='Mô tả chi tiết' uploadUrl='/user/upload?category=statistic' />
        </>
    });
}

class StatisticPage extends AdminPage {
    componentDidMount() {
        this.props.getAllStatistics();
    }

    create = e => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhóm thống kê', 'Bạn có chắc bạn muốn xóa nhóm thống kê này?', true, isConfirm => isConfirm &&
        this.props.deleteStatistic(item._id));

    render() {
        const permission = this.getUserPermission('component');
        const table = renderTable({
            getDataSource: () => this.props.statistic && this.props.statistic.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên nhóm</th>
                    <th style={{ width: 'auto', textAlign: 'right' }} nowrap='true'>Số lượng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/statistic/edit/' + item._id} />
                    <TableCell type='number' content={item.items.length} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/statistic/edit/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return (<>
            {table}
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            <StatisticModal ref={e => this.modal = e} createStatistic={this.props.createStatistic} history={this.props.history} readOnly={!permission.write} />
        </>)
    }
}

const mapStateToProps = state => ({ system: state.system, statistic: state.statistic });
const mapActionsToProps = { getAllStatistics, createStatistic, deleteStatistic };
export default connect(mapStateToProps, mapActionsToProps)(StatisticPage);