import React from 'react';
import { connect } from 'react-redux';
import { getAllLogos, createLogo, deleteLogo } from './redux/reduxLogo.jsx';
import { Link } from 'react-router-dom';

class LogoModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.btnSave = React.createRef();
        this.editor = { vi: React.createRef(), en: React.createRef() };
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).on('shown.bs.modal', () => $('#logoViName').focus()), 250);
        });
    }

    show = () => {
        $('#logoViName').val('');
        $('#logoEnName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const logoName = {
            vi: $('#logoViName').val().trim(),
            en: $('#logoEnName').val().trim()
        };
        if (logoName.vi === '') {
            T.notify('Tên nhóm logo bị trống!', 'danger');
            $('#logoViName').focus();
        } else if (logoName.en === '') {
            T.notify('Name of logos group is empty!', 'danger');
            $('#logoEnName').focus();
        } else {
            this.props.createLogo(JSON.stringify(logoName), data => {
                if (data.error === undefined || data.error == null) {
                    $(this.modal.current).modal('hide');
                    if (data.item) {
                        this.props.showLogo(data.item);
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
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#logoViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#logoEnTab'>English</a>
                                </li>
                            </ul>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='tab-content'>
                            <div id='logoViTab' className='tab-pane fade show active'>
                                <div className='modal-header'>
                                    <h5 className='modal-title'>Thông tin nhóm logo</h5>
                                </div>
                                <div className='modal-body'>
                                    <div className='form-group'>
                                        <label htmlFor='logoViName'>Tên nhóm logo</label>
                                        <input className='form-control' id='logoViName' type='text' placeholder='Tên nhóm logo' />
                                    </div>
                                </div>
                                <div className='modal-footer'>
                                    <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                                    <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                                </div>
                            </div>

                            <div id='logoEnTab' className='tab-pane fade'>
                                <div className='modal-header'>
                                    <h5 className='modal-title'>Information of logos group</h5>
                                </div>
                                <div className='modal-body'>
                                    <div className='form-group'>
                                        <label htmlFor='logoEnName'>Name of logos group</label>
                                        <input className='form-control' id='logoEnName' type='text' placeholder='Name of logos group' />
                                    </div>
                                </div>
                                <div className='modal-footer'>
                                    <button type='button' className='btn btn-secondary' data-dismiss='modal'>Cancel</button>
                                    <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class LogoPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllLogos();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    show = (item) => {
        this.props.history.push('/user/logo/edit/' + item._id);
    }

    delete = (e, item) => {
        T.confirm('Xóa nhóm logo', 'Bạn có chắc bạn muốn xóa nhóm logo này?', true, isConfirm => isConfirm && this.props.deleteLogo(item._id));
        e.preventDefault();
    }

    render() {
        let table = null;
        if (this.props.logo && this.props.logo.list && this.props.logo.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên nhóm</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lượng</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.logo.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/logo/edit/' + item._id} data-id={item._id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
                                <td style={{ textAlign: 'right' }}>{item.items.length}</td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/logo/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p key={0}>Không có nhóm logo!</p>;
        }

        return [
            table,
            <LogoModal key={1} createLogo={this.props.createLogo} showLogo={this.show} ref={this.modal} />,
            <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                onClick={this.create}>
                <i className='fa fa-lg fa-plus' />
            </button>
        ];
    }
}

const mapStateToProps = state => ({ logo: state.logo });
const mapActionsToProps = { getAllLogos, createLogo, deleteLogo };
export default connect(mapStateToProps, mapActionsToProps)(LogoPage);