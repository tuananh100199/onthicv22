import React from 'react';
import { connect } from 'react-redux';
import { getAddressItem, updateAddress } from './redux.jsx';
import { Link } from 'react-router-dom';

class AddressEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: [] };
        this.modal = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/address/edit/:addressId'), params = route.parse(window.location.pathname);
            this.props.getAddressItem(params.addressId, data => {
                if (data.item) {
                    $('#addressTitle').val(data.item.title).focus();
                    this.setState({ item: data.item });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    remove = (e, index) => {
        e.preventDefault();
        T.confirm('Xoá bài viết ', 'Bạn có chắc muốn xoá bài viết khỏi danh sách này?', true, isConfirm => {
            if (isConfirm) {
                const item = this.props.Address.item;
                let items = item.items || [];
                const changes = {};
                items.splice(index, 1);
                if (items.length == 0) items = 'empty';
                changes.items = items;
                this.props.updateAddress(item._id, changes, () => {
                    T.alert('Xoá bài viết trong danh sách thành công!', 'error', false, 800);
                });
            }
        })
    };

    swap = (e, index, isMoveUp) => {
        const item = this.props.Address.item;
        let items = item.items || [];
        if (items.length == 1) {
            T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
                } else {
                    const temp = items[index - 1], changes = {};

                    items[index - 1] = items[index];
                    items[index] = temp;

                    changes.items = items;
                    this.props.updateAddress(item._id, changes, () => {
                        T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
                    });
                }
            } else {
                if (index == items.length - 1) {
                    T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
                } else {
                    const temp = items[index + 1], changes = {};

                    items[index + 1] = items[index];
                    items[index] = temp;

                    changes.items = items;
                    this.props.updateAddress(item._id, changes, () => {
                        T.notify('Thay đổi thứ tự bài viết trong danh sách thành công!', 'info');
                    });
                }
            }
        }
        e.preventDefault();
    };

    showSelectModal = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    save = () => {
        const changes = {
            title: $('#AddressTitle').val(),
            items: this.state.item.items,
        };

        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            $('#AddressTitle').focus();
        } else {
            this.props.updateAddress(this.state.item._id, changes, () => {
                T.notify('Cập nhật danh sách bài viết thành công!', 'success');
            });
        }
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        const item = this.props.Address && this.props.Address.item ? this.props.Address.item : { items: [] };

        let table = item.items && item.items.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto' }}>#</th>
                        <th style={{ width: '100%' }}>Tên </th>
                        {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                    </tr>
                </thead>
                <tbody>
                    {item.items.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                                <a href='#' onClick={e => this.showSelectModal(e, item)}>
                                    {item.title}
                                </a><br />
                                <Link to={'/user/content/edit/' + item._id}>Xem chi tiết</Link>
                            </td>
                            <td>
                                {!readOnly &&
                                    <div className='btn-group'>
                                        <a href='#' className='btn btn-primary' onClick={e => this.showSelectModal(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item._id)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <p>Không có danh sách các bài viết!</p>

        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Danh Sách Bài Viết: Chỉnh sửa</h1>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='tile col-md-6'>
                        <div className='tile-body'>
                            <div className='form-group'>
                                <label className='control-label' htmlFor='AddressTitle'>Tiêu đề</label>
                                <input className='form-control' type='text' placeholder='Tiêu đề' id='AddressTitle' readOnly={readOnly} />
                            </div>
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>

                    <div className='tile col-md-12'>
                        <h3 className='tile-title'>Danh sách bài viết</h3>
                        <div className='tile-body'>
                            {table}
                        </div>
                    </div>
                </div>

                <ContentModal ref={this.modal} updateAddress={this.props.updateAddress} history={this.props.history} item={item} />

                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {!readOnly && (
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={e => this.showSelectModal(e, null)}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                )}
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, content: state.content, Address: state.Address });
const mapActionsToProps = { updateAddress, getAddressItem };
export default connect(mapStateToProps, mapActionsToProps)(AddressEditPage);
