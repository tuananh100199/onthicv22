import React from 'react';
import { connect } from 'react-redux';
import { getCarousel, updateCarousel, createCarouselItem, updateCarouselItem, swapCarouselItem, deleteCarouselItem } from './redux/reduxCarousel';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';

class CarouselItemModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.modal = React.createRef();
        this.imageBox = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(this.modal.current).on('shown.bs.modal', () => $('#carouselName').focus());
    }

    show = (item, carouselId) => {
        let { _id, title, image, link, subtitle, description } = item || { _id: null, title: '', image: '/img/avatar.jpg', link: '' };

        $(this.btnSave.current).data('id', _id).data('carouselId', carouselId);
        $('#carouselName').val(title);
        $('#carouselLink').val(link);
        $('#carouselSubTitle').val(subtitle);
        $('#carouselDescription').val(description);
        this.imageBox.current.setData('carouselItem:' + (_id ? _id : 'new'), image);
        $(this.modal.current).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const _id = $(e.target).data('id'),
            carouselId = $(e.target).data('carouselId'),
            changes = {
                title: $('#carouselName').val().trim(),
                link: $('#carouselLink').val().trim(),
                subtitle: $('#carouselSubTitle').val().trim(),
                description: $('#carouselDescription').val().trim()
            };

        if (changes.title == '') {
            T.notify('Tên hình ảnh bị trống!', 'danger');
            $('#carouselName').focus();
        } else {
            if (_id) { // Update
                this.props.updateCarouselItem(_id, changes, error => {
                    if (error == undefined || error == null) {
                        $(this.modal.current).modal('hide');
                    }
                });
            } else { // Create
                changes.carouselId = carouselId;
                this.props.createCarouselItem(changes, () => $(this.modal.current).modal('hide'));
            }
        }
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Hình ảnh</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='carouselName'>Tiêu đề chính</label>
                                <input className='form-control' id='carouselName' type='text' placeholder='Tiêu đề' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='carouselName'>Tiêu đề phụ</label>
                                <input className='form-control' id='carouselSubTitle' type='text' placeholder='Tiêu đề' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='carouselName'>Mô tả</label>
                                <textarea defaultValue='' className='form-control' id='carouselDescription' placeholder='Mô tả'
                                    style={{ minHeight: '100px', marginBottom: '12px' }} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='carouselLink'>Link liên kết</label>
                                <input className='form-control' id='carouselLink' type='text' placeholder='Link liên kết' />
                            </div>
                            <div className='form-group'>
                                <label>Hình ảnh nền</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='CarouselItemImage' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class CarouselEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { single: false, active: false };
        this.modal = React.createRef();
    }

    componentDidMount() {
        T.ready(() => {
            $('#crsTitle').focus();

            const route = T.routeMatcher('/user/carousel/edit/:carouselId'),
                params = route.parse(window.location.pathname);
            this.props.getCarousel(params.carouselId, data => {
                $('#crsTitle').val(data.title).focus();
                $('#crsHeight').val(data.height);
                this.setState(data);
            });
        });
    }

    save = () => {
        const changes = {
            title: $('#crsTitle').val(),
            height: parseInt($('#crsHeight').val()),
            single: this.state.single,
            active: this.state.active,
        };

        this.props.updateCarousel(this.state._id, changes);
    }

    createItem = (e) => {
        this.modal.current.show(null, this.state._id);
        e.preventDefault();
    }

    editItem = (e, item) => {
        this.modal.current.show(item);
        e.preventDefault();
    }

    swapItem = (e, item, isMoveUp) => {
        this.props.swapCarouselItem(item._id, isMoveUp);
        e.preventDefault();
    }

    changeItemActive = (item) => this.props.updateCarouselItem(item._id, { active: !item.active });

    deleteItem = (e, item) => {
        T.confirm('Xóa hình ảnh', 'Bạn có chắc bạn muốn xóa hình ảnh này?', true, isConfirm =>
            isConfirm && this.props.deleteCarouselItem(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let items = this.props.carousel && this.props.carousel.selectedItem && this.props.carousel.selectedItem.items ? this.props.carousel.selectedItem.items : [],
            table = 'Không có hình ảnh!';

        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            {!readOnly ? <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    {readOnly ? item.title : <a href='#' onClick={e => this.editItem(e, item, index)}>
                                        {item.title}
                                    </a>}
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={T.url(item.image || '/img/avatar.jpg')} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => !readOnly && this.changeItemActive(item, index)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                {!readOnly ? <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-success' href='#' onClick={e => this.swapItem(e, item, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swapItem(e, item, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>
                                        <a className='btn btn-primary' href='#' onClick={e => this.editItem(e, item, index)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.deleteItem(e, item, index)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        const { title, height } = this.props.carousel && this.props.carousel.selectedItem ? this.props.carousel.selectedItem : { title: '', height: 0 };
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <h1><i className='fa fa-image' /> Tập hình ảnh: {title}</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>&nbsp;/&nbsp;Tập hình ảnh
                    </ul>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-md-6'>
                            <label className='control-label'>Tiêu đề tập hình ảnh</label>
                            <input className='form-control' type='text' placeholder='Tiêu đề tập hình ảnh' id='crsTitle' defaultValue={title} readOnly={readOnly} />
                        </div>
                        <div className='form-group col-md-6'>
                            <label className='control-label'>Chiều cao</label>
                            <input className='form-control' type='number' placeholder='Chiều cao' id='crsHeight' defaultValue={height} style={{ textAlign: 'right' }} readOnly={readOnly} />
                        </div>
                        <div className='form-group col-md-6' style={{ display: 'flex' }}>
                            <label className='control-label'>Đơn ảnh:</label>&nbsp;
                            <div className='toggle'>
                                <label>
                                    <input type='checkbox' checked={this.state.single} onChange={e => !readOnly && this.setState({ single: e.target.checked })} /><span className='button-indecator' />
                                </label>
                            </div>
                        </div>
                        <div className='form-group col-md-6' style={{ display: 'flex' }}>
                            <label className='control-label'>Kích hoạt:</label>&nbsp;
                            <div className='toggle'>
                                <label>
                                    <input type='checkbox' checked={this.state.active} onChange={e => !readOnly && this.setState({ active: e.target.checked })} /><span className='button-indecator' />
                                </label>
                            </div>
                        </div>
                    </div>
                    {readOnly ? null :
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>}
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Danh sách hình ảnh</h3>
                    <div className='tile-body'>
                        {table}
                        {readOnly ? null :
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.createItem}>
                                    <i className='fa fa-fw fa-lg fa-plus'></i> Thêm
                                </button>
                            </div>}
                    </div>
                </div>

                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <CarouselItemModal ref={this.modal} createCarouselItem={this.props.createCarouselItem} updateCarouselItem={this.props.updateCarouselItem} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, carousel: state.carousel });
const mapActionsToProps = { getCarousel, updateCarousel, createCarouselItem, updateCarouselItem, swapCarouselItem, deleteCarouselItem };
export default connect(mapStateToProps, mapActionsToProps)(CarouselEditPage);
