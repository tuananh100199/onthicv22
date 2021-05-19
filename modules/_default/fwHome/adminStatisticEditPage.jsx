import React from 'react';
import { connect } from 'react-redux';
import { getStatistic, updateStatistic, createStatisticItem, updateStatisticItem, swapStatisticItem, deleteStatisticItem, changeStatisticItem } from './redux/reduxStatistic';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox, FormEditor, FormCheckbox, FormImageBox, TableCell, renderTable } from 'view/component/AdminPage';

class StatisticItemModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, image, number, active, statisticId } = Object.assign({ title: '', number: 0, active: true }, item);
        this.itemTitle.value(title);
        this.itemNumber.value(number);
        this.itemActive.value(active);
        this.imageBox.setData(`statisticItem:${_id || 'new'}`);

        this.setState({ _id, statisticId, image });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            title: this.itemTitle.value().trim(),
            number: this.itemNumber.value(),
            statisticId: this.state.statisticId,
            active: this.itemActive.value(),
            image: this.state.image,
        };

        if (changes.title == '') {
            T.notify('Tên thống kê bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            if (this.state._id) {
                this.props.update(this.state._id, changes, this.hide);
            } else {
                this.props.create(changes, this.hide);
            }
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change(item);
        }
    }

    render = () => this.renderModal({
        title: 'Thống kê',
        size: 'large',
        body: <div className='row'>
            <div className='col-md-8'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={this.props.readOnly} />
                <FormTextBox type='number' ref={e => this.itemNumber = e} label='Số lượng' readOnly={this.props.readOnly} />
            </div>
            <div className='col-md-4'>
                <FormImageBox ref={e => this.imageBox = e} label='Hình ảnh nền' uploadType='StatisticItemImage' image={this.state.image} readOnly={this.props.readOnly}
                    onSuccess={this.onUploadSuccess} />
                <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
            </div>
        </div>,
    });
}

class StatisticEditPage extends AdminPage {
    state = {}
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/statistic/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getStatistic(params._id, data => {
                this.itemTitle.value(data.item.title);
                this.itemDescription.html(data.item.description);
                this.itemTitleVisible.value(data.item.titleVisible);
                this.itemTitle.focus();
                this.setState(data.item);
            });
        });
    }

    save = () => {
        this.props.updateStatistic(this.state._id, {
            title: this.itemTitle.value(),
            description: this.itemDescription.html(),
            titleVisible: this.itemTitleVisible.value(),
        });
    };

    createItem = (e) => e.preventDefault() || this.modal.show({ statisticId: this.state._id });

    editItem = (e, item) => e.preventDefault() || this.modal.show(item);

    swapItem = (e, item, isMoveUp) => e.preventDefault() || this.props.swapStatisticItem(item._id, isMoveUp);

    deleteItem = (e, item) => e.preventDefault() || T.confirm('Xóa thống kê', 'Bạn có chắc bạn muốn xóa thống kê này?', true, isConfirm =>
        isConfirm && this.props.deleteStatisticItem(item._id));

    render() {
        const items = this.props.component.statistic && this.props.component.statistic.selectedItem && this.props.component.statistic.selectedItem.items;
        const permission = this.getUserPermission('component');
        const table = renderTable({
            getDataSource: () => this.props.component.statistic && this.props.component.statistic.selectedItem && this.props.component.statistic.selectedItem.items,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '80%' }}>Tiêu đề</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số lượng</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={this.editItem} />
                    <TableCell type='number' content={item.number} />
                    <TableCell type='image' content={item.image || '/img/avatar.jpg'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateStatisticItem(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swapItem} onEdit={this.editItem} onDelete={this.deleteItem} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-picture-o',
            title: 'Thống kê: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to='/user/component'>Thành phần giao diện</Link>, 'Thống kê'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body row'>
                        <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' className='col-md-8' onChange={e => this.setState({ title: e.target.value })} readOnly={!permission.write} />
                        <FormCheckbox ref={e => this.itemTitleVisible = e} label='Hiển thị tiêu đề' className='col-md-4' readOnly={!permission.write} />
                        <FormEditor ref={e => this.itemDescription = e} label='Mô tả' className='col-md-12' style={{ height: '400px' }} readOnly={!permission.write} />
                    </div>
                    {permission.write &&
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>}
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Danh sách thống kê</h3>
                    <div className='tile-body'>
                        {table}
                        {permission.write && items && (items.length < 12) &&
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.createItem}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                                </button>
                            </div>}
                    </div>
                </div>
                <StatisticItemModal ref={e => this.modal = e} create={this.props.createStatisticItem} update={this.props.updateStatisticItem} change={this.props.changeStatisticItem} readOnly={!permission.write} />
            </>,
            backRoute: '/user/component',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getStatistic, updateStatistic, createStatisticItem, updateStatisticItem, swapStatisticItem, deleteStatisticItem, changeStatisticItem };
export default connect(mapStateToProps, mapActionsToProps)(StatisticEditPage);
