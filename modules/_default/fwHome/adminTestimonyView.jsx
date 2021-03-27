import React from 'react';
import { connect } from 'react-redux';
import { getAllTestimonys, createTestimony, deleteTestimony } from './redux/reduxTestimony';
import { Link } from 'react-router-dom';

class TestimonyModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).on('shown.bs.modal', () => $('#testimonyViName').focus()), 250);
        });
    }

    show = () => {
        $('#testimonyViName').val('');
        $('#testimonyEnName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const item = { vi: $('#testimonyViName').val().trim(), en: $('#testimonyEnName').val().trim() };
        if (item.vi == '') {
            T.notify('Tên nhóm testimony bị trống!', 'danger');
            $('#testimonyViName').focus();
        } else if (item.en == '') {
            T.notify('The name of testimony is empty now!', 'danger');
            $('#testimonyEnName').focus();
        } else {
            this.props.createTestimony(JSON.stringify(item), data => {
                if (data.error == undefined || data.error == null) {
                    $(this.modal.current).modal('hide');
                    data.testimony && this.props.showTestimony(data.testimony);
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
                            <h5 className='modal-title'>Thông tin nhóm testimony</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='testimonyViName'>Tên nhóm testimony</label>
                                <input className='form-control' id='testimonyViName' type='text' placeholder='Tên nhóm testimony' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='testimonyEnName'>The name of testimony</label>
                                <input className='form-control' id='testimonyEnName' type='text' placeholder='The name of testimony' />
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

class TestimonyPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllTestimonys();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    show = (item) => {
        this.props.history.push('/user/testimony/' + item._id);
    }

    delete = (e, item) => {
        T.confirm('Xóa nhóm testimony', 'Bạn có chắc bạn muốn xóa nhóm testimony này?', true, isConfirm => isConfirm && this.props.deleteTestimony(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = null;
        if (this.props.testimony && this.props.testimony.list && this.props.testimony.list.length > 0) {
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
                        {this.props.testimony.list.map((testimony, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/testimony/' + testimony._id} data-id={testimony._id}>{testimony.title}</Link>
                                </td>
                                <td style={{ textAlign: 'right' }}>{testimony.items.length}</td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/testimony/' + testimony._id} data-id={testimony._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.includes('component:write') ? <a className='btn btn-danger' href='#' onClick={e => this.delete(e, testimony)}>
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
            table = <p key={0}>Không có nhóm testimony!</p>;
        }

        return ([
            table,
            <TestimonyModal key={1} createTestimony={this.props.createTestimony} showTestimony={this.show} ref={this.modal} />,

            currentPermissions.includes('component:write') ? <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                <i className='fa fa-lg fa-plus' />
            </button> : null,
        ]);
    }
}

const mapStateToProps = state => ({ system: state.system, testimony: state.testimony });
const mapActionsToProps = { getAllTestimonys, createTestimony, deleteTestimony };
export default connect(mapStateToProps, mapActionsToProps)(TestimonyPage);
