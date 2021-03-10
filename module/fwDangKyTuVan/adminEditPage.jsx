import React from 'react';
import { connect } from 'react-redux';
import { getDangKyTuVanItem, updateDangKyTuVan, addDangKyTuVanIntoGroup, updateDangKyTuVanInGroup, removeDangKyTuVanFromGroup, swapDangKyTuVanInGroup } from './redux/reduxDangKyTuVan.jsx';
import {getAllCourseType} from '../fwCourseType/redux.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';


class DangKyTuVanModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.modal = React.createRef();
        this.editor = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#sttTitle').focus())
        }, 250));
    }

    show = (selectedItem, index) => {
        let { title, number } = selectedItem ? selectedItem : { title: '', number: 0 };
        $('#sttViTitle').val(title);
        $('#sttEnTitle').val(title);
        $('#sttNumber').val(number);
        $(this.btnSave.current).data('isNewMember', selectedItem == null).data('index', index);

        $(this.modal.current).modal('show');
    }
    hide = () => {
        $(this.modal.current).modal('hide');
    }

    save = (event) => {
        const btnSave = $(this.btnSave.current),
            isNewMember = btnSave.data('isNewMember'),
            index = btnSave.data('index'),
            title =  $('#sttViTitle').val(),
            number = $('#sttNumber').val();
        if (isNewMember) {
            this.props.addDKTV(title, number);
        } else {
            this.props.updateDKTV(index,title, number);
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='container-fluid row'>
                                <h5 className='modal-title col-6'>Thống kê</h5>
                            </div>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='container-fluid row'>
                                <div className='col-12'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='sttViTitle'>Tên</label><br />
                                        <input className='form-control' id='sttViTitle' type='text' placeholder='Tên' />
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='sttNumber'>Số lượng</label><br />
                                        <input className='form-control' id='sttNumber' type='number' placeholder='Số lượng' />
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DangKyTuVanEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { image: '' };
        this.modal = React.createRef();
        this.editor = React.createRef();
        this.image = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/dang-ky-tu-van', () => {
            const route = T.routeMatcher('/user/dang-ky-tu-van/edit/:dangKyTuVanId'),
                params = route.parse(window.location.pathname);
           
            this.props.getAllCourseType( data => {
                if(data){
                    console.log('data',data);
                    let courseType = data ? data.map(item => ({id: item._id, text: item.text})) : null;
                    $('#courseType').select2({ data: courseType}).val(data.courseType).trigger('change');
                }
                this.props.getDangKyTuVanItem(params.dangKyTuVanId, data => {
                    if (data.error) {
                        T.notify('Lấy đăng ký tư vấn bị lỗi', 'danger');
                        this.props.history.push('/user/dang-ky-tu-van');
                    } else if (data.item) {
                        console.log(data);
                        const title = data.item.title,
                            content = data.item.description,
                            courseType = data.item.courseType;
                        $('#title').val(title).focus();
                        $('#courseType').val(courseType).focus();
    
                        this.editor.current.html(content);
                    } else {
                        this.props.history.push('/user/dang-ky-tu-van');
                    }
                    this.setState(data);
                });
            });
            $('#courseType').select2();

          
        });
    }


    showAddDKTVModal = () => {
        this.modal.current.show();
    };

    showEditDKTVModal = (e, selectedDangKyTuVan, index) => {
        this.modal.current.show(selectedDangKyTuVan, index);
        e.preventDefault();
    };

    add = (title, number) => {
        this.props.addDangKyTuVanIntoGroup(title, number);
        this.modal.current.hide();
    };

    update = (index, title, number) => {
        this.props.updateDangKyTuVanInGroup(index, title, number);
        this.modal.current.hide();
    };

    remove = (e, index) => {
        this.props.removeDangKyTuVanFromGroup(index);
        e.preventDefault();
    };

    swap = (e, index, isMoveUp) => {
        this.props.swapDangKyTuVanInGroup(index, isMoveUp);
        e.preventDefault();
    }

    save = () => {
        const title =  $('#title').val().trim(),
            formTitle =  $('#formTitle').val().trim();

        const description = this.editor.current.html();

        if (title === '') {
            T.notify('Tiêu đề đăng ký tư vấn trống!', 'danger');
            $('#title').focus();
        }else if(formTitle === '') {
            T.notify('Tiều đề form đăng ký tư vấn trống!', 'danger');
            $('#formTitle').focus();
        } else {
            const changes = {
                title: title,
                formTitle: formTitle,
                description: description,
                statistic: this.props.dangKyTuVan.item.statistic,
                courseType: $('#courseType').val(),
            };
            console.log('changes',changes);
            if (changes.statistic && changes.statistic.length == 0) changes.statistic = 'empty';
            this.props.updateDangKyTuVan(this.props.dangKyTuVan.item._id, changes);
        }
    };

    render() {
       

        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('dangKyTuVan:write');
        let table = null,
            currentDangKyTuVan = this.props.dangKyTuVan ? this.props.dangKyTuVan.item : null;
        if (currentDangKyTuVan && currentDangKyTuVan.statistic.length > 0) {
            table = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên</th>
                            <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Số lượng</th>
                            {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentDangKyTuVan.statistic.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {readOnly ? title : <a href='#' onClick={e => this.showEditDKTVModal(e, item, index)}>{item.title}</a>}
                                    </td>
                                 
                                    <td style={{ textAlign: 'center' }}>{T.numberDisplay(item.number)}</td>
                                    {readOnly ? null :
                                        <td>
                                            <div className='btn-group'>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                                    <i className='fa fa-lg fa-arrow-up' />
                                                </a>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                                    <i className='fa fa-lg fa-arrow-down' />
                                                </a>
                                                <a className='btn btn-primary' href='#' onClick={e => this.showEditDKTVModal(e, item, index)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a>
                                                <a className='btn btn-danger' href='#' onClick={e => this.remove(e, index)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </a>
                                            </div>
                                        </td>
                                    }
                                </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có thống kê!</p>;
        }

        const {title, formTitle} = currentDangKyTuVan ? currentDangKyTuVan: {title: '', formTitle:''};
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Đăng ký tư vấn: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/dang-ky-tu-van'>Danh sách đăng ký tư vấn</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <div className='tab-content'>
                                <div id='statisticViTab' className='tab-pane fade show active'>
                                     <div className='form-group mt-3'>
                                        <label htmlFor='courseType' className='control-label'>Loại khóa học</label><br />
                                        <select className='form-control col-2' id='courseType' multiple={false} >
                                            <optgroup label='Lựa chọn loại khóa học' />
                                        </select>
                                    </div>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='title'>Tiêu đề</label>
                                        <input className='form-control col-6' type='text' placeholder='Tiêu đề' id='title' defaultValue={title} readOnly={readOnly} />
                                    </div>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='formTitle'>Tiêu đề form</label>
                                        <input className='form-control col-6' type='text' placeholder='Tiêu đề' id='formTitle' defaultValue={formTitle} readOnly={readOnly} />
                                    </div>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='tepViDescription'>Mô tả</label>
                                        <Editor ref={this.editor} placeholder='Nội dung' id='tepViDescription' readOnly={readOnly} /><br />
                                    </div>
                                </div>
                             
                            </div>
                          
                        </div>
                      
                    </div>
                    <div className='tile col-md-12'>
                        <div className='control-label'>
                            <label htmlFor='tepViDescription'>Thống kê</label>
                        </div>
                        <div>
                            {table}
                        </div>
                        {readOnly ? null :
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={this.showAddDKTVModal}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thống kê
                                    </button>&nbsp;
                                    <button className='btn btn-primary' type='button' onClick={this.save}>
                                            <i className='fa fa-fw fa-lg fa-save' />Lưu
                                    </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <Link to='/user/dang-ky-tu-van' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <DangKyTuVanModal ref={this.modal} addDKTV={this.add} updateDKTV={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dangKyTuVan: state.dangKyTuVan});
const mapActionsToProps = { getAllCourseType, getDangKyTuVanItem, updateDangKyTuVan, addDangKyTuVanIntoGroup, updateDangKyTuVanInGroup, removeDangKyTuVanFromGroup, swapDangKyTuVanInGroup };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanEditPage);
