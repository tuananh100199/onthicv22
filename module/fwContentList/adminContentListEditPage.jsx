import React from 'react';
import { connect } from 'react-redux';
import { getAllContentList, updateContentList } from './redux.jsx';
import { getAllContents, ajaxSelectUser } from '../fwHome/redux/reduxContent.jsx';
import { Link } from 'react-router-dom';
import { Select } from '../../view/component/Input.jsx';
// import { ajaxSelectUser } from '../../module/fwUser/redux.jsx';
class ContentModal extends React.Component {
    modal = React.createRef();
    userSelect = React.createRef();

    show = () => {
        this.userSelect.current.val(null);
        $(this.modal.current).modal('show');
    }

    // switchUser = () => {
    //     const userId = this.userSelect.current.val();
    //     this.props.switchUser(userId);
    // }

    save = (event) => {
        const newItem = this.userSelect.current.val();
        const listItem = this.props.item.items;
        listItem.push(newItem);
        const changes = {
            items: listItem,
            // items: $('#contentListSelect').val(),
            // title: this.state.item.title,
        };

        if (this.props.item && this.props.item._id) {
            // if ($('#contentListSelect').val() == '') {
            //     // changes.items = JSON.stringify([]);
            //     changes.items = [];
            // }
            this.props.updateContentList(this.props.item._id, changes, () => {
                $(this.modal.current).modal('hide');
            });
            this.props.reRenderPage(this.props.item);
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thêm bài viết</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='form-group'>
                                <label>Chọn bài viết</label>
                                {/* <Select ref={this.userSelect} displayLabel={false} adapter={ajaxSelectUser} label='Bài viết' /> */}
                                <Select ref={this.userSelect} displayLabel={false} adapter={ajaxSelectUser} label='Bài viết' />
                                {console.log('ajaxSelectUser conyeny', ajaxSelectUser)}
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
// class ContentModal extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { item: {} };
//         this.modal = React.createRef();
//     }

//     componentDidMount() {
//         $(document).ready(() => setTimeout(() => {
//             $(this.modal.current).on('shown.bs.modal', () => $('#sttTitle').focus())
//         }, 250));
//         $('#contentListSelect').select2();
//     }

//     show = (content, item) => {
//         let activeItems = content.filter(item => item.active === true);
//         let categories = activeItems.map(item => ({ id: item._id, text: T.language.parse(item.title) }));
//         $('#contentListSelect').select2({ data: categories }).val(item.items).trigger('change');
//         this.setState({ item: item })
//         $(this.modal.current).modal('show');
//     }

//     save = (event) => {
//         const changes = {
//             items: $('#contentListSelect').val(),
//             title: this.state.item.title,
//         };

//         if (this.state.item && this.state.item._id) {
//             if ($('#contentListSelect').val() == '') {
//                 // changes.items = JSON.stringify([]);
//                 changes.items = [];
//             }
//             this.props.updateContentList(this.state.item._id, changes, () => {
//                 $(this.modal.current).modal('hide');
//             });
//             this.props.reRenderPage(this.state.item);
//         }
//         event.preventDefault();
//     }

//     render() {
//         return (
//             <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
//                 <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
//                     <div className='modal-content'>
//                         <div className='modal-header'>
//                             <h5 className='modal-title'>Thêm/Gỡ bài viết</h5>
//                             <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
//                                 <span aria-hidden='true'>&times;</span>
//                             </button>
//                         </div>
//                         <div className='modal-body'>
//                             <div className='row'>
//                                 <div className='col-12'>
//                                     <div className='form-group'>
//                                         <label className='control-label'>Thêm/gỡ bài viết có sẵn</label>
//                                         <select className='form-control' id='contentListSelect' multiple={true} defaultValue={[]} >
//                                             <optgroup label='Lựa chọn bài viết' />
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className='modal-footer'>
//                             <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
//                             <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         );
//     }
// }
class ListContentEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: [] };
        this.modal = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/list-content/edit/:listContentId'), params = route.parse(window.location.pathname);
            this.props.getAllContentList(data => {
                if (data) {
                    const currentList = data.find(item => item._id === params.listContentId);
                    let title = T.language.parse(currentList.title, true);
                    $('#listContentTitle').val(title.vi).focus();
                    this.setState({ item: currentList });
                    this.getContentItem();
                } else {
                    this.props.history.push('/user/component');
                }
            }
            );
        });
    }
    getContentItem = () => {
        const item = this.state.item;
        if (item.items) {
            this.props.getAllContents(content => {
                this.setState({
                    items: item.items.map(idC => content.find(ele => ele._id === idC))
                });
            }
            );
        }
    }

    deleteItem = (_id) => {
        const remainList = this.state.items.filter(item => item._id != _id)
        this.props.updateContentList(this.state.item._id, { items: remainList.map(ele => ele._id) });
        T.alert('Gỡ bài viết trong danh sách thành công!', 'error', false, 800);
        this.setState({
            item: Object.assign({}, this.state.item, { items: remainList.map(ele => ele._id) }),
            items: remainList
        });
    }
    remove = (e, _id) => {
        T.confirm('Gỡ bài viết ', 'Bạn có chắc muốn gỡ bài viết khỏi danh sách này?', true, isConfirm => {
            isConfirm && this.deleteItem(_id);
        })
        e.preventDefault();
    };

    swap = (e, item, index, isMoveUp) => {
        if (this.state && this.state.item) {
            let items = this.state.item.items;
            let itemContent = this.state.items;
            const content = items[index];
            const contentItem = itemContent[index];
            if (isMoveUp && index > 0) {
                items.splice(index, 1);
                itemContent.splice(index, 1);
                items.splice(index - 1, 0, content);
                itemContent.splice(index - 1, 0, contentItem);
            } else if (!isMoveUp && index < items.length - 1) {
                items.splice(index, 1);
                itemContent.splice(index, 1);
                items.splice(index + 1, 0, content);
                itemContent.splice(index + 1, 0, contentItem);
            }
            this.setState({
                item: Object.assign({}, this.state.item, { items: items }),
                items: itemContent
            });
            this.props.updateContentList(this.state.item._id, this.state.item);
            T.notify('Đổi thứ tự bài viết trong danh sách thành công!', 'success');
        }
        e.preventDefault();
    };
    // showSelectModal = (e, content, item) => {
    //     this.modal.current.show(content, item);
    //     e.preventDefault();
    // };
    showSelectModal = (e) => {
        this.modal.current.show();
        e.preventDefault();
    };
    save = () => {
        const changes = {
            title: JSON.stringify({ vi: $('#listContentTitle').val() }),
            items: this.state.item.items,
        };

        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            $('#listContentTitle').focus();
        } else {
            this.props.updateContentList(this.state.item._id, changes);
        }
        this.getContentItem();
    };
    reRenderPage = (item) => {
        if (item) {
            this.props.getAllContentList(data => {
                if (data) {
                    this.setState({ item: data.find(item => item._id === this.state.item._id) });
                };
                const item = this.state.item;
                if (item.items) {
                    this.props.getAllContents(content => {
                        this.setState({
                            items: item.items.map(idC => content.find(ele => ele._id === idC))
                        });
                    }
                    );
                }
            })
        }
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');

        let table = null, currentContent = this.state.item || {};
        if (this.state.item.items && this.state.item.items.length && this.state.items && this.state.items.length) {
            table = (
                <table key={0} className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '100%' }}>Tên </th>
                            {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.items.map((item, index) => {
                            if (item) {
                                let title = T.language.parse(item.title, true);
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {readOnly ? title.vi :
                                                <Link to={'/user/content/edit/' + item._id}>
                                                    {title.vi}
                                                </Link>

                                            }
                                        </td>

                                        <td>
                                            {/* {(readOnly || this.state.item.items.length === 1) ? null : */}
                                            {readOnly ? null :
                                                <div className='btn-group'>
                                                    <Link to={'/user/content/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                                        <i className='fa fa-lg fa-edit' />
                                                    </Link>
                                                    <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, index, true)}>
                                                        <i className='fa fa-lg fa-arrow-up' />
                                                    </a>
                                                    <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, index, false)}>
                                                        <i className='fa fa-lg fa-arrow-down' />
                                                    </a>
                                                    <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item._id)}>
                                                        <i className='fa fa-lg fa-trash' />
                                                    </a>
                                                </div>
                                            }
                                        </td>

                                    </tr>
                                )
                            }
                        })
                        }
                    </tbody>
                </table>
            );
        } else {
            table = <p key={0}>Không có danh sách các bài viết!</p>;
        }
        const result = [table, <ContentModal key={1} ref={this.modal} updateContentList={this.props.updateContentList} reRenderPage={this.reRenderPage} history={this.props.history}
            item={this.state.item} content={this.props.content} />];
        if (currentPermissions.includes('component:write')) {
            result.push(
                <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={e => this.showSelectModal(e, this.props.content, this.state.item)}>
                    <i className='fa fa-lg fa-plus' />
                </button>
            );
        }
        const title = currentContent && currentContent.title ? T.language.parse(currentContent.title, true).vi : '<Trống>';
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
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-check-circle' /> Lưu
                                </button>
                        </div>
                    </div>

                    <div className='tile col-md-12'>
                        <h3 className='tile-title'>Danh sách bài viết</h3>
                        <div className='tile-body'>
                            <div className='form-group'>
                                {result.slice(0, 2)}
                            </div>
                        </div>
                        {/* {readOnly ? null :
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={e => this.showSelectModal(e, this.props.content, this.state.item)}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm/Gỡ bài viết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        } */}
                        <div className='tile-footer'>
                            <div className='row'>
                                <div className='col-md-12' style={{ textAlign: 'right' }}>
                                    {result[2]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {/* <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button> */}
                {/* <ContentModal ref={this.modal} updateContentList={this.props.updateContentList} reRenderPage={this.reRenderPage} /> */}
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, content: state.content });
const mapActionsToProps = { updateContentList, getAllContents, getAllContentList };
export default connect(mapStateToProps, mapActionsToProps)(ListContentEditPage);
