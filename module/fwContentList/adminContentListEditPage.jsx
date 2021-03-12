import React from 'react';
import { connect } from 'react-redux';
import { getContentListItem, updateContentList } from './redux';
import { ajaxSelectContent } from '../fwHome/redux/reduxContent';
import { Link } from 'react-router-dom';
import { Select } from 'view/component/Input';
import ImageBox from 'view/component/ImageBox';

class ContentModal extends React.Component {
    state = { item: null };
    modal = React.createRef();
    contentSelect = React.createRef();

    show = (item = null) => {
        this.setState({ item }, () => {
            if (item) {
                this.contentSelect.current.val({ id: item._id, text: item.title });
            } else {
                this.contentSelect.current.val('');
            }
            $(this.modal.current).modal('show');
        });
    }

    save = (event) => {
        const changeItem = this.contentSelect.current.val();
        const listItem = this.props.item.items;
        if (this.state.item && this.state.item._id) {
            // Update
            let index = 0;
            for (; index < listItem.length; index++) {
                if (this.state.item._id == listItem[index]._id) {
                    break;
                }
            }
            listItem.splice(index, 1, changeItem);
        } else {
            // Create
            listItem.push(changeItem);
        }

        if (this.props.item && this.props.item._id) {
            this.props.updateContentList(this.props.item._id, { items: listItem }, () => {
                T.notify('Cập nhật danh sách bài viết thành công', 'success');
                $(this.modal.current).modal('hide');
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Bài viết</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='form-group'>
                                <Select ref={this.contentSelect} displayLabel={true} adapter={ajaxSelectContent} label='Bài viết' />
                            </div>
                        </div>

                        <div className='modal-footer'>
                            <button type='button' className='btn btn-success' onClick={this.save}>Lưu</button>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class ListContentEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: [] };
        this.modal = React.createRef();
        this.imageBox = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/settings', () => {
            const route = T.routeMatcher('/user/list-content/edit/:listContentId'), params = route.parse(window.location.pathname);
            this.props.getContentListItem(params.listContentId, data => {
                if (data.item) {
                    const { _id = 'new', title = '', image = '/img/avatar.jpg' } = data.item || {};
                    $('#listContentTitle').val(data.item.title).focus();
                    $('#listContentAbstract').val(data.item.abstract);
                    this.imageBox.current.setData('contentList:' + _id, image);
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
                const item = this.props.contentList.item;
                let items = item.items || [];
                const changes = {};
                items.splice(index, 1);
                if (items.length == 0) items = 'empty';
                changes.items = items;
                this.props.updateContentList(item._id, changes, () => {
                    T.alert('Xoá bài viết trong danh sách thành công!', 'error', false, 800);
                });
            }
        })
    };

    swap = (e, index, isMoveUp) => {
        const item = this.props.contentList.item;
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
                    this.props.updateContentList(item._id, changes, () => {
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
                    this.props.updateContentList(item._id, changes, () => {
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
            title: $('#listContentTitle').val(),
            abstract: $('#listContentAbstract').val(),
            items: this.state.item.items
        };

        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            $('#listContentTitle').focus();
        } else {
            this.props.updateContentList(this.state.item._id, changes, () => {
                T.notify('Cập nhật danh sách bài viết thành công!', 'success');
            });
        }
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        const item = this.props.contentList && this.props.contentList.item ? this.props.contentList.item : { items: [] };

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
                                <label className='control-label' htmlFor='listContentTitle'>Tiêu đề</label>
                                <input className='form-control' type='text' placeholder='Tiêu đề' id='listContentTitle' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label className='control-label' htmlFor='listContentAbstract'>Mô tả ngắn</label>
                                <input className='form-control' type='text' placeholder='Mô tả ngắn' id='listContentAbstract' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label className='control-label'>Hình ảnh nền</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ContentListImage' readOnly={!currentPermissions.includes('component:write')} />
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

                <ContentModal ref={this.modal} updateContentList={this.props.updateContentList} history={this.props.history} item={item} />

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
const mapStateToProps = state => ({ system: state.system, content: state.content, contentList: state.contentList });
const mapActionsToProps = { updateContentList, getContentListItem };
export default connect(mapStateToProps, mapActionsToProps)(ListContentEditPage);
