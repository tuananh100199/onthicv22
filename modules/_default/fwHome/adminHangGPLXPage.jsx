import React from 'react';
import { connect } from 'react-redux';
import { getHangGPLXAll, createHangGPLX, deleteHangGPLX } from './redux/reduxHangGPLX';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class HangGPLXModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const title = this.itemTitle.value().trim();
        if (title == '') {
            T.notify('Tên các hạng lái xe bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            console.log('title', title);
            this.props.create({ title }, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/hang-gplx/' + data.item._id);
                }
            });
        }
    }
    render = () => this.renderModal({
        title: 'Hạng giấy phép lái xe',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên hạng giấy phép lái xe' />
    });
}

class HangGPLXView extends React.Component {
    componentDidMount() {
        this.props.getHangGPLXAll();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa hạng GPLX', 'Bạn có chắc bạn muốn xóa hạng GPLX này?', true, isConfirm =>
        isConfirm && this.props.deleteHangGPLX(item._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.hangGPLX && this.props.component.hangGPLX.list,
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
                    <TableCell type='link' content={item.title} url={'/user/hang-gplx/' + item._id} />
                    {/* <TableCell type='image' content={item.image || '/img/avatar.png'} style={{ height: '32px' }} /> */}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/hang-gplx/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return <>
            {table}
            <HangGPLXModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createHangGPLX} history={this.props.history} />
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { getHangGPLXAll, createHangGPLX, deleteHangGPLX };
export default connect(mapStateToProps, mapActionsToProps)(HangGPLXView);