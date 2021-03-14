import React from 'react';
import { connect } from 'react-redux';
import { getAllDivisions, createDivision, deleteDivision, updateDivision } from './redux';
import { Link } from 'react-router-dom';
import AdminPage from 'view/component/AdminPage';
// import { getUserPermission, renderListPage } from 'view/component/AdminCommon';

class DivisionModal extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#addressName').focus());
        });
    }

    show = () => {
        $('#addressName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const newData = { title: $('#addressName').val() };
        if (newData.title == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            $('#addressName').focus();
        } else {
            this.props.createDivision(newData, data => {
                if (data.item) {
                    $(this.modal.current).modal('hide');
                    this.props.history.push('/user/division/edit/' + data.item._id);
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
                            <h5 className='modal-title'>Cơ sở mới</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='addressName'>Tên cơ sở</label>
                                <input className='form-control' id='addressName' type='text' placeholder='Nhập tên cơ sở' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary'>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DivisionPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready();
        this.props.getAllDivisions();
        T.onSearch = (searchText) => this.props.getAllDivisions(searchText);
    }
    componentWillUnmount() {
        T.onSearch = null;
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    delete = (e, item) => {
        T.confirm('Xóa cơ sở', 'Bạn có chắc bạn muốn xóa cơ sở này?', true, isConfirm => isConfirm && this.props.deleteDivision(item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('division');
        let table = 'Không có cơ sở!';
        if (this.props.division && this.props.division.list && this.props.division.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên cơ sở</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Cơ sở ngoài</th>
                            <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.division.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'/user/division/edit/' + item._id}>{item.title}</Link></td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.isOutside}
                                            onChange={() => permission.write && this.props.updateDivision(item._id, { isOutside: item.isOutside ? 0 : 1 }, () => T.notify('Cập nhật cơ sở thành công!', 'success'))} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatarDivision' style={{ height: '32px' }} />
                                </td>
                                {permission.write || permission.delete ? <td>
                                    <div className='btn-group'>
                                        {permission.write ?
                                            <Link to={'/user/division/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                                <i className='fa fa-lg fa-edit' />
                                            </Link> : null}
                                        {permission.delete ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td> : null}
                            </tr>))}
                    </tbody>
                </table>);
        }

        const renderData = {
            icon: 'fa fa-university',
            title: 'Cơ sở đào tạo',
            breadcrumb: [],
            content: <>
                <div className='tile'>{table}</div>
                <DivisionModal ref={this.modal} createDivision={this.props.createDivision} history={this.props.history} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.create;
        return this.renderListPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division });
const mapActionsToProps = { getAllDivisions, createDivision, deleteDivision, updateDivision };
export default connect(mapStateToProps, mapActionsToProps)(DivisionPage);
