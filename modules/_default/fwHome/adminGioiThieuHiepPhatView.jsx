import React from 'react';
import { connect } from 'react-redux';
import { getGioiThieuAll, createGioiThieu, deleteGioiThieu } from './redux/reduxGioiThieuHiepPhat';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class GioiThieuModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const title = this.itemTitle.value().trim();
        if (title == '') {
            T.notify('Tên bài giới thiệu Hiệp Phát bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create({ title }, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/gioi-thieu/' + data.item._id);
                }
            });
        }
    }
    render = () => this.renderModal({
        title: 'Giới thiệu Hiệp Phát',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên bài giới thiệu Hiệp Phát' />
    });
}

class GioiThieuHiepPhatView extends React.Component {
    componentDidMount() {
        this.props.getGioiThieuAll();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa bài giới thiệu Hiệp Phát', 'Bạn có chắc bạn muốn xóa bài giới thiệu Hiệp Phát này?', true, isConfirm =>
        isConfirm && this.props.deleteGioiThieu(item._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.gioiThieu && this.props.component.gioiThieu.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    {/* <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh nền</th> */}
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/gioi-thieu/' + item._id} />
                    {/* <TableCell type='image' content={item.image || '/img/avatar.png'} style={{ height: '32px' }} /> */}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/gioi-thieu/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return <>
            {table}
            <GioiThieuModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createGioiThieu} history={this.props.history} />
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { getGioiThieuAll, createGioiThieu, deleteGioiThieu };
export default connect(mapStateToProps, mapActionsToProps)(GioiThieuHiepPhatView);