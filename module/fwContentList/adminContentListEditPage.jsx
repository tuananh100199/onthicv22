import React from 'react';
import { connect } from 'react-redux';
import { getContentListItem, updateContentList } from './redux.jsx';
import { getAllContents, createContent, updateContent, deleteContent, swapContent } from '../fwHome/redux/reduxContent.jsx';
import { Link } from 'react-router-dom';
// import ImageBox from '../../view/component/ImageBox.jsx';
class ListContentEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: [] };
    }

    componentDidMount() {
        T.ready('/user/component', () => {
            this.getData();
            $('#listContentTitle').focus();
            $('#contentListSelect').select2();
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/list-content/edit/:listContentId'),
            params = route.parse(window.location.pathname);
        const currentList = this.props.contentList.find(list => list._id === params.listContentId);
        console.log('currentList', currentList)
        let title = T.language.parse(currentList.title, true);
        $('#listContentTitle').val(title.vi).focus();
        let categories = this.props.content.map(item => ({ id: item._id, text: T.language.parse(item.title) }));
        $('#contentListSelect').select2({ data: categories }).val(currentList.listOfContentId).trigger('change');
        this.setState({ item: currentList });
        this.getListContentItem();
        console.log('state', this.state)
    }

    getListContentItem = () => {
        const listItem = this.state.item.listOfContentId.map(item => this.props.content.find(ele => ele._id === item))
        this.setState({ items: listItem });
    }

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
    deleteItem = (_id) => {
        const remainList = this.state.items.filter(item => item._id != _id)
        this.setState({
            item: Object.assign({}, this.state.item, { listOfContentId: remainList.map(ele => ele._id) }),
            items: remainList
        });
        console.log('state delete', this.state)
    }
    remove = (e, _id) => {
        T.confirm('Xoá Content', 'Bạn có chắc muốn xoá Content này?', 'info', isConfirm => {
            isConfirm && this.deleteItem(_id);
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
            title: JSON.stringify({ vi: $('#listContentTitle').val() }),
            listOfContentId: $('#contentListSelect').val()
        };

        if (changes.title == '') {
            T.notify('Tên danh sách bị trống!', 'danger');
            $('#listContentTitle').focus();
        } else {
            console.log("this.state", this.state)
            // this.props.updateContentList(this.state.item._id, changes);
            this.props.updateContentList(T.routeMatcher('/user/list-content/edit/:listContentId').parse(window.location.pathname).listContentId, changes);
        }
        this.getListContentItem();
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
                            if (item) {
                                let title = T.language.parse(item.title, true);
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {readOnly ? title.vi : <a href='#'>{title.vi}</a>}
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
                                                    {/* <a className='btn btn-primary' href='#' onClick={this.props.history.push('/user/content/edit/' + item._id)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a> */}
                                                    <a className='btn btn-danger' href='#' onClick={e => this.remove(e, item._id)}>
                                                        <i className='fa fa-lg fa-trash' />
                                                    </a>
                                                </div>
                                            </td>
                                        }
                                    </tr>
                                )
                            }
                        })
                        }
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có danh sách các Content!</p>;
        }

        const title = currentContent && currentContent.title ? T.language.parse(currentContent.title, true).vi : '<Trống>';
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
                                <div className='form-group'>
                                    <label className='control-label'>Chen/xoa bài viết trong list</label>
                                    <select className='form-control' id='contentListSelect' multiple={true} defaultValue={[]} disabled={readOnly} >
                                        <optgroup label='Lựa chọn bài viết' />
                                    </select>
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
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, content: state.content, contentList: state.contentList.list });
const mapActionsToProps = { getContentListItem, updateContentList, getAllContents, createContent, updateContent, deleteContent, swapContent };
export default connect(mapStateToProps, mapActionsToProps)(ListContentEditPage);
