import React from 'react';
import { connect } from 'react-redux';
import { getListContentAll, createListContent, deleteListContent } from './redux/reduxListContent';
import { FormModal, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class ListContentModal extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#listContentName').focus());
        });
    }

    show = () => {
        $('#listContentName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const newData = {
            title: $('#listContentName').val(),
            items: []
        };

        if (newData.title == '') {
            T.notify('Tên danh sách bài viết bị trống!', 'danger');
            $('#listContentName').focus();
        } else {
            this.props.create(newData, data => {
                if (data.item) {
                    $(this.modal.current).modal('hide');
                    this.props.history.push('/user/list-content/edit/' + data.item._id);
                }
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Danh sách bài viết</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='listContentName'>Tên danh sách bài viết</label>
                                <input className='form-control' id='listContentName' type='text' placeholder='Nhập tên danh sách bài viết' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary'>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class ListContentView extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getListContentAll();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa danh sách bài viết', 'Bạn có chắc bạn muốn xóa danh sách bài viết này?', true, isConfirm =>
        isConfirm && this.props.deleteListContent(item._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.listContent && this.props.component.listContent.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên danh sách</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh nền</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/list-content/edit/' + item._id} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} style={{ height: '32px' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/list-content/edit/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return <>
            {table}
            <ListContentModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createListContent} />
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getListContentAll: getListContentAll, createListContent, deleteListContent };
export default connect(mapStateToProps, mapActionsToProps)(ListContentView);