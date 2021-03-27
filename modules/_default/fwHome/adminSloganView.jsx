import React from 'react';
import { connect } from 'react-redux';
import { getAllSlogans, createSlogan, deleteSlogan } from './redux/reduxSlogan';
import { Link } from 'react-router-dom';

class SloganModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#sloganName').focus());
        }, 250));
    }

    show = () => {
        $('#sloganName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const sloganName = $('#sloganName').val().trim();
        if (sloganName == '') {
            T.notify('Tên nhóm slogan bị trống!', 'danger');
            $('#sloganName').focus();
        } else {
            this.props.createSlogan(sloganName, data => {
                if (data.error == undefined || data.error == null) {
                    $(this.modal.current).modal('hide');
                    if (data.slogan) {
                        this.props.showSlogan(data.slogan);
                    }
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
                            <h5 className='modal-title'>Thông tin nhóm slogan</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='sloganName'>Tên nhóm slogan</label>
                                <input className='form-control' id='sloganName' type='text' placeholder='Tên nhóm slogan' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' ref={this.btnSave}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class SloganPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllSlogans();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    show = (item) => {
        this.props.history.push('/user/slogan/' + item._id);
    }

    delete = (e, item) => {
        T.confirm('Xóa nhóm slogan', 'Bạn có chắc bạn muốn xóa nhóm slogan này?', true, isConfirm => isConfirm && this.props.deleteSlogan(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = null;
        if (this.props.slogan && this.props.slogan.list && this.props.slogan.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên nhóm</th>
                            <th style={{ width: 'auto', textAlign: 'right' }} nowrap='true'>Số lượng</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.slogan.list.map((slogan, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/slogan/' + slogan._id} data-id={slogan._id}>{slogan.title}</Link>
                                </td>
                                <td style={{ textAlign: 'right' }}>{slogan.items.length}</td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/slogan/' + slogan._id} data-id={slogan._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.contains('component:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, slogan)}>
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
            table = <p key={0}>Không có nhóm slogan!</p>;
        }

        const components = [table, <SloganModal key={1} createSlogan={this.props.createSlogan} showSlogan={this.show} ref={this.modal} />];
        if (currentPermissions.contains('component:write')) {
            components.push(
                <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                    <i className='fa fa-lg fa-plus' />
                </button>);
        }
        return components;
    }
}

const mapStateToProps = state => ({ system: state.system, slogan: state.slogan });
const mapActionsToProps = { getAllSlogans, createSlogan, deleteSlogan };
export default connect(mapStateToProps, mapActionsToProps)(SloganPage);