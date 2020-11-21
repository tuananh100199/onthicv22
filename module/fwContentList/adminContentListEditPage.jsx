import React from 'react';
import { connect } from 'react-redux';
import { getContentListItem, updateContentList } from './redux.jsx';
import { getAllContents, createContent, updateContent, deleteContent, swapContent } from '../fwHome/redux/reduxContent.jsx';
import { Link } from 'react-router-dom';
import ImageBox from '../../view/component/ImageBox.jsx';

class ContentModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {} };
        this.modal = React.createRef();
        this.imageBox = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#sttTitle').focus())
        }, 250));
    }

    show = (selectedItem) => {
        let { _id, title, image } = selectedItem ? selectedItem : { _id: null, title: '', image: '' };
        $('#contentTitle').val(title);
        this.imageBox.current.setData('Content:' + (_id ? _id : 'new'), image || '/img/avatar.jpg');
        this.setState({ item: selectedItem })

        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const changes = {
            title: $('#contentTitle').val().trim()
        };
        if (changes.title == '') {
            T.notify('Tiêu đề Content bị trống!', 'danger');
            $('#contentViTitle').focus();
        }
        else {
            if (this.state.item && this.state.item._id) {
                this.props.updateContent(this.state.item._id, changes, () => {
                    $(this.modal.current).modal('hide');
                });
            } else { // Create
                this.props.addContent(changes, () => {
                    $(this.modal.current).modal('hide');
                });
            }
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thêm/Sửa Content</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='row'>
                                <div className='col-12'>
                                    <div className='form-group'>
                                        <label htmlFor='contentTitle'>Tiêu đề</label><br />
                                        <input className='form-control' id='contentTitle' type='text' placeholder='Tiêu đề' />
                                    </div>
                                </div>

                                <div className='col-12'>
                                    <div className='form-group'>
                                        <label>Hình đại diện</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ContentImage' image={this.state.image} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class ListContentEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: [] };
        this.modal = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/list-content/edit/:listContentId'), params = route.parse(window.location.pathname);
            console.log('param', params)
            this.props.getContentListItem(params.listContentId, data => {
                if (data.error) {
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    $('#listContentTitle').val(data.item.title).focus();
                    this.props.getAllContents({ listContentId: data.item._id }, (items) => {
                        this.setState({ item: data.item, items });
                    })
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    showAddContentModal = (e) => {
        this.modal.current.show();
        e.preventDefault();
    };

    showEditContentModal = (e, selectedContent) => {
        this.modal.current.show(selectedContent);
        e.preventDefault();
    };

    add = (newData, done) => {
        newData.contentListId = this.state.item._id;
        this.props.createContent(newData, newContent => {
            let items = this.state.items;
            items.push(newContent);
            this.setState({ items }, done);
        });
    };

    update = (_id, changes, done) => {
        this.props.updateContent(_id, changes, editedContent => {
            let items = this.state.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i]._id == _id) {
                    items.splice(i, 1, editedContent);
                }
            }

            this.setState({ items }, done);
        });
    };

    remove = (e, _id) => {
        T.confirm('Xoá Content', 'Bạn có chắc muốn xoá Content này?', 'info', isConfirm => {
            isConfirm && this.props.deleteContent(_id, () => {
                let items = this.state.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i]._id == _id) {
                        items.splice(i, 1);
                    }
                }
                this.setState({ items });
            });
        })
        e.preventDefault();
    };

    swap = (e, item, index, isMoveUp, done) => {
        this.props.swapContent(item._id, isMoveUp, () => {
            if (this.state && this.state.item) {
                let items = this.state.items;
                const content = items[index];
                if (isMoveUp && index > 0) {
                    items.splice(index, 1);
                    items.splice(index - 1, 0, content);
                } else if (!isMoveUp && index < items.length - 1) {
                    items.splice(index, 1);
                    items.splice(index + 1, 0, content);
                }
                this.setState({ items }, done);
            }
        })

        e.preventDefault();
    };

    save = () => {
        const changes = {
            title: $('#listContentTitle').val().trim(),
        };

        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            $('#listContentTitle').focus();
        } else {
            console.log("this.state", this.state)
            // this.props.updateContentList(this.state.item._id, changes);
            this.props.updateContentList(T.routeMatcher('/user/list-content/edit/:listContentId').parse(window.location.pathname).listContentId, changes);
        }
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null, currentContent = this.state.item || {};
        if (this.state.items && this.state.items.length) {
            table = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '50%' }}>Tên </th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.items.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {readOnly ? item.title : <a href='#' onClick={e => this.showEditContentModal(e, item)}>{item.title}</a>}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <img src={item.image ? item.image : '/img/avatar.jpg'} alt='avatar' style={{ height: '32px' }} />
                                    </td>
                                    {readOnly ? null :
                                        <td>
                                            <div className='btn-group'>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, index, true)}>
                                                    <i className='fa fa-lg fa-arrow-up' />
                                                </a>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, index, false)}>
                                                    <i className='fa fa-lg fa-arrow-down' />
                                                </a>
                                                <a className='btn btn-primary' href='#' onClick={e => this.showEditContentModal(e, item)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a>
                                                <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item._id)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </a>
                                            </div>
                                        </td>
                                    }
                                </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có danh sách các Content!</p>;
        }

        const title = currentContent && currentContent.title ? T.language.parse(currentContent.title, true) : '<Trống>';
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Danh Sách Content: Chỉnh sửa</h1>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <div className='row'>
                                <div className="col-md-6">
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='listContentTitle'>Tiêu đề</label>
                                        <input className='form-control' type='text' placeholder='Tiêu đề' id='listContentTitle' defaultValue={title} readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='tile col-md-12'>
                        <h3 className='tile-title'>Danh sách Content</h3>
                        <div className='tile-body'>
                            <div className='form-group'>
                                {table}
                            </div>
                        </div>
                        {readOnly ? null :
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={this.showAddContentModal}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm Content
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
                <ContentModal ref={this.modal} addContent={this.add} updateContent={this.update} />
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, content: state.content });
const mapActionsToProps = { getContentListItem, updateContentList, getAllContents, createContent, updateContent, deleteContent, swapContent };
export default connect(mapStateToProps, mapActionsToProps)(ListContentEditPage);
