import React from 'react';
import { connect } from 'react-redux';
import { getAllListVideo, createListVideo, deleteListVideo } from './redux/reduxListVideo.jsx';
import { Link } from 'react-router-dom';

class ListVideoModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#listVideoName').focus());
        });
    }

    show = () => {
        $('#listVideoName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const newData = {
            title: $('#listVideoName').val().trim()
        };
        
        if (newData.title == '') {
            T.notify('Tên danh sách video bị trống!', 'danger');
            $('#listVideoName').focus();
        } else {
            this.props.createListVideo(newData, data => {
                if (data.item) {
                    $(this.modal.current).modal('hide');
                    this.props.history.push('/user/list-video/edit/' + data.item._id);
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
                            <div className='tab-content'>
                                <div id='listVideoViTab' className='tab-pane fade show active mt-3'>
                                    <div className='form-group'>
                                        <label htmlFor='listVideoName'>Tên danh sách video</label>
                                        <input className='form-control' id='listVideoName' type='text' placeholder='Tên danh sách video' />
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
    
    delete = (e, item) => {
        T.confirm('Xóa danh sách video', 'Bạn có chắc bạn muốn xóa danh sách video này?', true, isConfirm => isConfirm && this.props.deleteListVideo(item._id));
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
                            <th style={{ width: '100%' }}>Tên danh sách</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.listVideo.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/list-video/edit/' + item._id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
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

        const result = [table, <ListVideoModal key={1} createListVideo={this.props.createListVideo} ref={this.modal} history={this.props.history}/>];
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