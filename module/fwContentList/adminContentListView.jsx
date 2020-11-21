import React from 'react';
import { connect } from 'react-redux';
import { getAllContentList, createContentList, deleteContentList } from './redux.jsx';
// import { getAllContents } from '../fwHome/redux/reduxContent.jsx'
import { Link } from 'react-router-dom';
// import ContentListModal from './contentListModal.jsx';


class ContentListModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        // this.props.getAllContents();
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#contentListName').focus());
        });
    }

    show = () => {
        $('#contentListName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const newData = {
            title: $('#contentListName').val().trim()
        };

        if (newData.title == '') {
            T.notify('Tên danh sách noi dung bị trống!', 'danger');
            $('#contentListName').focus();
        } else {
            this.props.createContentList(newData, data => {
                if (data.item) {
                    $(this.modal.current).modal('hide');
                    this.props.history.push('/user/list-content/edit/' + data.item._id);
                }
            });
        }
        // this.props.getAllContentList();
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Danh sách noi dung</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='tab-content'>
                                <div id='contentListViTab' className='tab-pane fade show active mt-3'>
                                    <div className='form-group'>
                                        <label htmlFor='contentListName'>Tên danh sách noi dung</label>
                                        <input className='form-control' id='contentListName' type='text' placeholder='Tên danh sách noi dung' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary'>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
class ContentListPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllContentList();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    delete = (e, item) => {
        T.confirm('Xóa danh sách noi dung', 'Bạn có chắc bạn muốn xóa danh sách noi dung này?', true, isConfirm => isConfirm && this.props.deleteContentList(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = null;
        // console.log('test', this.props.contentList)
        if (this.props.contentList && this.props.contentList.list && this.props.contentList.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên danh sách</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.contentList.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/list-content/edit/' + item._id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/list-content/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.includes('component:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p key={0}>Không có danh sách các noi dung!</p>;
        }

        const result = [table, <ContentListModal key={1} createContentList={this.props.createContentList} ref={this.modal} history={this.props.history} />];
        if (currentPermissions.includes('component:write')) {
            result.push(
                <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                    <i className='fa fa-lg fa-plus' />
                </button>
            );
        }
        return result;
    }
}

const mapStateToProps = state => ({ system: state.system, contentList: state.contentList, content: state.content });
// const mapStateToProps = state => ({ system: state.system, contentList: state.contentList });
const mapActionsToProps = { getAllContentList, createContentList, deleteContentList };
export default connect(mapStateToProps, mapActionsToProps)(ContentListPage);