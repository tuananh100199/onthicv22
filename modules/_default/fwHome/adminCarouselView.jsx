import React from 'react';
import { connect } from 'react-redux';
import { getCarouselInPage, createCarousel, updateCarousel, deleteCarousel } from './redux/reduxCarousel';
import { Link } from 'react-router-dom';

class CarouselModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        $(this.modal.current).on('shown.bs.modal', () => $('#crsTitle').focus());
    }

    show = () => {
        $('#crsTitle').val('');
        $('#crsHeight').val('0');

        $(this.modal.current).modal('show');
    }

    save = () => {
        const data = { title: $('#crsTitle').val().trim(), height: $('#crsHeight').val().trim() };
        if (data.title == '') {
            T.notify('Tên hình ảnh bị trống!', 'danger');
            $('#crsTitle').focus();
        } else {
            this.props.createCarousel(data, () => $(this.modal.current).modal('hide'));
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={e => { e.preventDefault(); this.save(); }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Hình ảnh</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label className='control-label'>Tiêu đề tập hình ảnh</label>
                                <input className='form-control' type='text' placeholder='Tiêu đề tập hình ảnh' id='crsTitle' />
                            </div>
                            <div className='form-group'>
                                <label className='control-label'>Chiều cao</label>
                                <input className='form-control' type='number' placeholder='Chiều cao' id='crsHeight' style={{ textAlign: 'right' }} />
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

class CarouselPage extends React.Component {
    constructor(props) {
        super(props);
        this.table = React.createRef();
        this.carouselModal = React.createRef();
    }

    componentDidMount() {
        this.props.getCarouselInPage();
    }

    create = (e) => {
        this.carouselModal.current.show();
        e.preventDefault();
    }

    delete = (e, item) => {
        T.confirm('Xóa tập hình ảnh', 'Bạn có chắc bạn muốn xóa tập hình ảnh này?', true, isConfirm => isConfirm && this.props.deleteCarousel(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null;
        if (this.props.carousel && this.props.carousel.page && this.props.carousel.page.list && this.props.carousel.page.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chiều cao</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Đơn ảnh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.carousel.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/carousel/edit/' + item._id} data-id={item._id}>{item.title}</Link>
                                </td>
                                <td style={{ textAlign: 'right' }}>{item.height}</td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.single} onChange={() => !readOnly && this.props.updateCarousel(item._id, { single: !item.single })} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => !readOnly && this.props.updateCarousel(item._id, { active: !item.active })} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/carousel/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.includes('component:write') ? <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
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
            table = <p key={0}>Không có tập ảnh nào cả!</p>;
        }

        return [
            table,
            currentPermissions.includes('component:write') ? <button key={1} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                onClick={this.create}>
                <i className='fa fa-lg fa-plus' />
            </button> : null,

            <CarouselModal key={2} ref={this.carouselModal} createCarousel={this.props.createCarousel} />
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, carousel: state.carousel });
const mapActionsToProps = { getCarouselInPage, createCarousel, updateCarousel, deleteCarousel };
export default connect(mapStateToProps, mapActionsToProps)(CarouselPage);
