import React from 'react';
import { connect } from 'react-redux';
import { getDKTVListPage, getDKTVListItem, updateDKTVList, deleteDKTVListItem, exportDangKyTuVanToExcel } from './redux/reduxDangKyTuVanList';
import { getAllCourseType } from '../fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import FileSaver from 'file-saver'

class AdminDangKyTuVanModal extends React.Component {
    state = {};
    modal = React.createRef();
    editor = React.createRef();
    btnSave = React.createRef();

    show = (item) => {
        this.setState(item);
        $('#courseTypeRecommend').val(item.courseTypeRecommend);
        $('#dangKyTuVanresult').val(item.result);
        if(!item){
            T.notify('Lấy đăng ký tư vấn bị lỗi', 'danger');
            this.props.history.push('/user/dang-ky-tu-van/list');
        }else{
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
        this.props.updateDKTVList(this.state._id, changes);
}
    render() {
        const { lastname, firstname, email, phone, courseType, courseTypeRecommend, result } = this.state;

        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin đăng ký tư vấn</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body modal-dktv'>
                            <div className='row'>
                                <div className='col-12'>
                                    <div className='row'>
                                        <div className='col-6'>
                                            <label htmlFor='userLastname'>Tên người dùng:&nbsp; </label>
                                            <label>
                                                <b>{lastname} {firstname}</b>
                                            </label>
                                        </div>
                                        <div className='col-6'>
                                            <label htmlFor='userFirstname'>Số điện thoại: &nbsp; </label>
                                            <label>
                                                <b>{phone}</b>
                                            </label>
                                        </div>
                                    </div>
                                   
                                    <div className='row'>
                                        <div className='col-6'>
                                            <label>Loại khóa học:&nbsp; </label> 
                                            <label>
                                                    <b>{courseType ? courseType.title : 'Chưa đăng ký'}</b>
                                            </label>
                                            </div>
                                        <div className='col-6'>
                                            <div className='form-group'>
                                                <label  htmlFor='courseTypeRecommend'>Loại khóa học tư vấn:&nbsp; </label>
                                                <select  id='courseTypeRecommend' >
                                                    <optgroup  label='Loại' />
                                                </select>
                                            </div>
                                           
                                        </div>
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <label>Email:&nbsp; </label> 
                                    <label>
                                            <b>{email ? email : 'Chưa đăng ký'}</b>
                                    </label>
                                </div>
                                <div className='col-md-12'>
                                    <h6 style={{ marginTop: 20, marginBottom: 10 }}>Kết quả tư vấn</h6>
                                    <textarea defaultValue='' className='form-control' id='dangKyTuVanresult' placeholder='Kết quả tư vấn' rows={5} />
                                </div>
                            </div>
                        </div>
                        <form>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                                <button type='button' className='btn btn-primary' id='submit-btn' onClick={this.save}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

class DKTVListPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDKTVListPage();
        T.ready('/user/dang-ky-tu-van-list');
    }

    showDKTVListItem = (e, DKTVListItemId) => {
        e.preventDefault();
        this.props.getDKTVListItem(DKTVListItemId, DKTVListItem => this.modal.current.show(DKTVListItem));
    }

    delete = (e, item) => {
        T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm => isConfirm && this.props.deleteDKTVListItem(item._id));
        e.preventDefault();
    }

    exportDangKyTuVan = (e) => {
        this.props.exportDangKyTuVanToExcel();
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dangKyTuVanList && this.props.dangKyTuVanList.page ?
            this.props.dangKyTuVanList.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = 'Không có đăng ký tư vấn!';
        if (this.props.dangKyTuVanList && this.props.dangKyTuVanList.page && this.props.dangKyTuVanList.page.list && this.props.dangKyTuVanList.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '20%' }}>Họ & Tên</th>
                            <th style={{ width: '20%' }}>Số điện thoại</th>
                            <th style={{ width: '30%' }}>Email</th>
                            <th style={{ width: '30%' }}>Loại khóa học</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dangKyTuVanList.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.showDKTVListItem(e, item._id)} style={item.read ? readStyle : unreadStyle}>{item.lastname + ' ' + item.firstname}</a>
                                    <br />
                                    {new Date(item.createdDate).getText()}
                                </td>
                                <td>{item.phone}</td>
                                <td>{item.email}</td>
                                <td>{item.courseType? item.courseType.title : 'Chưa đăng ký'}</td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showDKTVListItem(e, item._id)}>
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
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} data-toggle='tooltip' title='Xuất Excel' onClick={e => this.exportDangKyTuVan(e)}>
                        <i className='fa fa-file-excel-o' />
                </button>
                <AdminDangKyTuVanModal ref={this.modal} getAllCourseType= {this.props.getAllCourseType} updateDKTVList={this.props.updateDKTVList}/>
            </main>
        );
    }
}

const mapStateToProps = state => ({ dangKyTuVanList: state.dangKyTuVanList });
const mapActionsToProps = { getDKTVListPage, getDKTVListItem, updateDKTVList, deleteDKTVListItem, getAllCourseType, exportDangKyTuVanToExcel };
export default connect(mapStateToProps, mapActionsToProps)(DKTVListPage);