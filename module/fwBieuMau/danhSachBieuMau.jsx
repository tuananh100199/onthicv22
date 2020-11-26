import React from 'react';
import { connect } from 'react-redux';
import { getFormInPage, createForm, updateForm, deleteForm } from './redux.jsx';
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';

class FormPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.getFormInPage();
        T.ready();
    }

    create = (e) => {
        this.props.createForm(data => this.props.history.push('/user/user-form/edit/' + data.item._id));
        e.preventDefault();
    };

    changeActive = (item) => {
        this.props.updateForm(item._id, { active: !item.active }, () => T.notify((item.active ? 'Hủy kích hoạt ' : 'Kích hoạt ') + 'thành công!'));
    };

    changeLock = (item) => {
        this.props.updateForm(item._id, { lock: !item.lock }, () => T.notify((!item.lock ? 'Khóa form ' : 'Hủy khóa form ') + 'thành công!'));
    };

    delete = (e, item) => {
        T.confirm('Xóa form', `Bạn có chắc bạn muốn xóa form <strong>${item.title.viText()}</strong>?`, 'warning', true, isConfirm =>
            isConfirm && this.props.deleteForm(item._id));
        e.preventDefault();
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('user-form:write');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.form && this.props.form.page ?
            this.props.form.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = list && list.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tiêu đề</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Khóa form</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {list.map((item, index) => (
                    <tr key={index}>
                        <td style={{ textAlign: 'right' }}>{(Math.max(pageNumber - 1, 0)) * pageSize + index + 1}</td>
                        <td>
                            <Link to={'/user/user-form/edit/' + item._id}>{item.title.viText()}</Link>
                        </td>
                        <td style={{ width: '20%', textAlign: 'center' }}>
                            <img src={item.image ? item.image : '/img/avatar.jpg' } alt='avatar' style={{ height: '32px' }} />
                        </td>
                        <td className='toggle' style={{ textAlign: 'center' }} >
                            <label>
                                <input type='checkbox' checked={item.active} onChange={() => this.changeActive(item)} disabled={readOnly} />
                                <span className='button-indecator' />
                            </label>
                        </td>
                        <td className='toggle' style={{ textAlign: 'center' }} >
                            <label>
                                <input type='checkbox' checked={item.lock} onChange={() => this.changeLock(item)} disabled={readOnly} />
                                <span className='button-indecator' />
                            </label>
                        </td>
                        <td className='btn-group'>
                            <Link to={'/user/form/registration/' + item._id} data-id={item._id} className='btn btn-warning'>
                                <i className='fa fa-lg fa-list-alt' />
                            </Link>
                            <Link to={'/user/user-form/edit/' + item._id} className='btn btn-primary'>
                                <i className='fa fa-lg fa-edit' />
                            </Link>
                            {!readOnly ?
                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </a> : null
                            }
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        ) : <p>Không có form!</p>;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file-text-o' /> Form: Danh sách</h1>
                </div>

                <div className='row tile'>
                    {table}
                </div>
                <Pagination name='pageForm' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getFormInPage} />
                {!readOnly ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null
                }
            </main>
        );
    }
}

const mapStateToProps = state => ({ form: state.form, system: state.system });
const mapActionsToProps = { getFormInPage, createForm, updateForm, deleteForm };
export default connect(mapStateToProps, mapActionsToProps)(FormPage);
