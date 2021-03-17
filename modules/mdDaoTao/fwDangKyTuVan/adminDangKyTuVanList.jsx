import React from 'react';
import { connect } from 'react-redux';
import { getDKTVListPage, getDKTVListItem, updateDKTVList, deleteDKTVListItem, exportDangKyTuVanToExcel } from './redux/reduxDangKyTuVanList';
import { getAllCourseType } from '../fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal } from 'view/component/AdminPage';

class DangKyTuVanModal extends React.Component {
    state = {};
    modal = React.createRef();
    editor = React.createRef();

    show = (item) => {
        this.setState(item);
        $('#courseTypeRecommend').val(item.courseTypeRecommend);
        $('#dangKyTuVanresult').val(item.result);
        if (!item) {
            T.notify('Lấy đăng ký tư vấn bị lỗi', 'danger');
            this.props.history.push('/user/dang-ky-tu-van/list');
        } else {
            this.props.getAllCourseType(datacType => {
                if (datacType) {
                    let courseTypeRecommend = datacType ? datacType.map(item => ({ id: item._id, text: item.title })) : null;
                    $('#courseTypeRecommend').select2({ data: courseTypeRecommend }).val(item.courseTypeRecommend).trigger('change');
                }
            });
        }
        $(this.modal.current).modal('show');
    }

    save = () => {
        const courseTypeRecommend = $('#courseTypeRecommend').val(),
            dangKyTuVanresult = $('#dangKyTuVanresult').val();
        const changes = {
            courseTypeRecommend: courseTypeRecommend,
            result: dangKyTuVanresult,
        };
        this.props.updateDKTVList(this.state._id, changes, () => {
            $(this.modal.current).modal('hide');
        });
    }

    render() {
        const { lastname, firstname, email, phone, courseType } = this.state;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin đăng ký tư vấn</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='form-group col-md-6'>
                                <label>Tên người đăng ký: <b>{lastname} {firstname}</b></label>
                            </div>
                            <div className='form-group col-md-6'>
                                <label>Loại khóa học đăng ký: <b>{courseType ? courseType.title : 'Chưa đăng ký'}</b></label>
                            </div>
                            <div className='form-group col-md-6'>
                                <label>Email: <b>{email || 'Chưa đăng ký'}</b></label>
                            </div>
                            <div className='form-group col-md-6'>
                                <label>Số điện thoại: <b>{phone}</b></label>
                            </div>

                            <div className='form-group col-md-12'>
                                <label htmlFor='courseTypeRecommend'>Loại khóa học tư vấn:&nbsp; </label>
                                <select id='courseTypeRecommend' >
                                    <optgroup label='Loại' />
                                </select>
                            </div>
                            <div className='form-group col-md-12'>
                                <label htmlFor='courseTypeRecommend'>Kết quả tư vấn:</label>
                                <textarea defaultValue='' className='form-control' id='dangKyTuVanresult' placeholder='Kết quả tư vấn' rows={6} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DangKyTuVanPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready();
        this.props.getDKTVListPage();
        T.onSearch = (searchText) => this.props.getDKTVListPage(1, 25, searchText);
    }

    show = (e, _id) => {
        e.preventDefault();
        this.props.getDKTVListItem(_id, item => this.modal.current.show(item));
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm => isConfirm && this.props.deleteDKTVListItem(item._id));
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dangKyTuVanList && this.props.dangKyTuVanList.page ?
            this.props.dangKyTuVanList.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = 'Không có đăng ký tư vấn!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '50%' }} nowrap='true'>Họ & Tên</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                            <th style={{ width: '50%' }}>Email</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Loại khóa học</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.show(e, item._id)} style={item.read ? readStyle : unreadStyle}>{item.lastname + ' ' + item.firstname}</a>
                                    <br />
                                    {new Date(item.createdDate).getText()}
                                </td>
                                <td>{item.phone}</td>
                                <td>{item.email}</td>
                                <td nowrap='true'>{item.courseType ? item.courseType.title : ''}</td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.show(e, item._id)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
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
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa fa-envelope-o' /> Danh sách đăng ký tư vấn</h1>
                </div>
                <div className='tile'>{table}</div>
                <Pagination name='pageDKTVList' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDKTVListPage} />
                <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} data-toggle='tooltip' title='Xuất Excel'
                    onClick={() => this.props.exportDangKyTuVanToExcel()}>
                    <i className='fa fa-file-excel-o' />
                </button>
                <DangKyTuVanModal ref={this.modal} getAllCourseType={this.props.getAllCourseType} updateDKTVList={this.props.updateDKTVList} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ dangKyTuVanList: state.dangKyTuVanList });
const mapActionsToProps = { getDKTVListPage, getDKTVListItem, updateDKTVList, deleteDKTVListItem, getAllCourseType, exportDangKyTuVanToExcel };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanPage);