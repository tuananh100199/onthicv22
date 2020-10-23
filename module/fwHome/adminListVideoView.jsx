import React from 'react';
import { connect } from 'react-redux';
import { getAllListVideo, createListVideo, deleteListVideo } from './redux/reduxListVideo.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';

class ListVideoModal extends React.Component {
    constructor(props) {
        super(props);

        this.modal = React.createRef();
        this.btnSave = React.createRef();
        this.editor = { vi: React.createRef(), en: React.createRef() };
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('hidden.bs.modal', () => $('#listVideoTabs li:first-child a').tab('show'))
                .on('shown.bs.modal', () => $('#listVideoViName').focus());
        }, 250));
    }

    show = () => {
        $('#listVideoViName').val('');
        // $('#listVideoEnName').val('');
        this.editor.vi.current.html('');
        this.editor.en.current.html('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const listVideoName = {
            vi: $('#listVideoViName').val().trim(),
            // en: $('#listVideoEnName').val().trim()
        };
        const description = {
            vi: this.editor.vi.current.html(),
            // en: this.editor.en.current.html(),
        }
        if (listVideoName.vi === '') {
            T.notify('Tên danh sách video bị trống!', 'danger');
            $('#listVideoViName').focus();
        
        } 
        // else if (listVideoName.en === '') {
        //     T.notify('Name of List Video group is empty!', 'danger');
        //     $('#listVideoEnName').focus();
        // } 
        else {
            this.props.createListVideo(JSON.stringify(listVideoName), JSON.stringify(description), '', data => {
                if (data.error === undefined || data.error == null) {
                    $(this.modal.current).modal('hide');
                    if (data.item) {
                        this.props.showListVideo(data.item);
                    }
                }
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Danh sách video</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul id='listVideoTabs' className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#listVideoViTab'>Việt Nam</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='listVideoViTab' className='tab-pane fade show active mt-3'>
                                    <div className='form-group'>
                                        <label htmlFor='listVideoViName'>Tên nhóm thống kê</label>
                                        <input className='form-control' id='listVideoViName' type='text' placeholder='Tên nhóm thống kê' />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='listVideoViDescription'>Mô tả</label>
                                        <Editor ref={this.editor.vi} id='listVideoViDescription' /><br />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' ref={this.btnSave}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class ListVideoPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllListVideo();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    show = (item) => {
        this.props.history.push('/user/list-video/edit/' + item._id);
    }

    delete = (e, item) => {
        T.confirm('Xóa nhóm thống kê', 'Bạn có chắc bạn muốn xóa nhóm thống kê này?', true, isConfirm => isConfirm && this.props.deleteListVideo(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = null;
        if (this.props.listVideo && this.props.listVideo.list && this.props.listVideo.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên nhóm</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lượng</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.listVideo.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/list-video/edit/:listVideoId' + item._id} data-id={item._id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
                                <td style={{ textAlign: 'right' }}>{item.items.length}</td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/list-video/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
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
            table = <p key={0}>Không có danh sách các video!</p>;
        }

        const result = [table, <ListVideoModal key={1} createListVideo={this.props.createListVideo} showListVideo={this.show} ref={this.modal} />];
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

const mapStateToProps = state => ({ system: state.system, listVideo: state.listVideo });
const mapActionsToProps = { getAllListVideo, createListVideo, deleteListVideo };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoPage);