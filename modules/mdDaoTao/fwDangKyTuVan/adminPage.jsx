import React from 'react';
import { connect } from 'react-redux';
import { getAllDangKyTuVan, createDangKyTuVan, deleteDangKyTuVan } from './redux/reduxDangKyTuVan';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';
import Pagination from 'view/component/Pagination';

class DangKyTuVanModal extends React.Component {
    constructor(props) {
        super(props);

        this.modal = React.createRef();
        this.btnSave = React.createRef();
        this.editor = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('hidden.bs.modal', () => $('#dangKyTuVanTabs li:first-child a').tab('show'))
                .on('shown.bs.modal', () => $('#dangKyTuVanName').focus());
        }, 250));
    }

    show = () => {
        $('#dangKyTuVanName').val('');
        this.editor.current.html('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const dangKyTuVanName = $('#dangKyTuVanName').val().trim();
        const description = this.editor.current.html();

        if (dangKyTuVanName === '') {
            T.notify('Tên đăng ký tư vấn bị trống!', 'danger');
            $('#dangKyTuVanName').focus();
        } else {
            this.props.createDangKyTuVan(dangKyTuVanName, description, '', data => {
                if (data.error === undefined || data.error == null) {
                    $(this.modal.current).modal('hide');
                    if (data.item) {
                        this.props.showDangKyTuVan(data.item);
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
                            <h5 className='modal-title'>Đăng ký tư vấn</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='tab-content'>
                                <div id='statisticViTab' className='tab-pane fade show active mt-3'>
                                    <div className='form-group'>
                                        <label htmlFor='dangKyTuVanName'>Tên đăng ký tư vấn</label>
                                        <input className='form-control' id='dangKyTuVanName' type='text' placeholder='Tên đăng ký tư vấn' />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='dangKyTuVanDescription'>Mô tả</label>
                                        <Editor ref={this.editor} id='dangKyTuVanDescription' /><br />
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

class DangKyTuVanPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllDangKyTuVan();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    show = (item) => {
        this.props.history.push('/user/dang-ky-tu-van/edit/' + item._id);
    }

    delete = (e, item) => {
        T.confirm('Xóa đăng ký tư vấn', 'Bạn có chắc bạn muốn xóa đăng ký tư vấn này?', true, isConfirm => isConfirm && this.props.deleteDangKyTuVan(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = null;
        if (this.props.dangKyTuVan && this.props.dangKyTuVan.list && this.props.dangKyTuVan.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên nhóm</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dangKyTuVan.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/dang-ky-tu-van/edit/' + item._id} data-id={item._id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/dang-ky-tu-van/edit/' + item._id} data-id={item._id} className='btn btn-primary' data-toggle='tooltip' title='Chỉnh sửa'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.includes('dangKyTuVan:write') ?
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
            table = <p key={0}>Không có đăng ký tư vấn nào!</p>;
        }

        const result = [table, <DangKyTuVanModal key={1} createDangKyTuVan={this.props.createDangKyTuVan} showDangKyTuVan={this.show} ref={this.modal} />];
        if (currentPermissions.includes('dangKyTuVan:write')) {
            result.push(
                <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                    <i className='fa fa-lg fa-plus' />
                </button>
            );
        }
        return result;
    }
}

const mapStateToProps = state => ({ system: state.system, dangKyTuVan: state.dangKyTuVan });
const mapActionsToProps = { getAllDangKyTuVan, createDangKyTuVan, deleteDangKyTuVan };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanPage);