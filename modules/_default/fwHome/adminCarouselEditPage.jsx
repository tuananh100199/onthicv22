import React from 'react';
import { connect } from 'react-redux';
import { getCarousel, updateCarousel, createCarouselItem, updateCarouselItem, swapCarouselItem, deleteCarouselItem, changeCarouselItem } from './redux/reduxCarousel';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, FormCheckbox, FormImageBox, TableCell, renderTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class CarouselItemModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        let { _id, title, image, link, subtitle, active, description, carouselId } = Object.assign({ title: '', subtitle: '', active: true, link: '', description: '' }, item);
        this.itemName.value(title);
        this.itemSubtitle.value(subtitle);
        this.itemLink.value(link);
        this.itemDescription.value(description);
        this.itemActive.value(active);
        this.imageBox.setData(`carouselItem:${_id || 'new'}`);

        this.setState({ _id, carouselId, image });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            title: this.itemName.value().trim(),
            subtitle: this.itemSubtitle.value().trim(),
            link: this.itemLink.value().trim(),
            description: this.itemDescription.value().trim(),
            carouselId: this.state.carouselId,
            active: this.itemActive.value(),
            image: this.state.image,
        };

        if (changes.title == '') {
            T.notify('Tên hình ảnh bị trống!', 'danger');
            this.itemName.focus();
        } else {
            if (this.state._id) {
                this.props.update(this.state._id, changes, this.hide);
            } else {
                this.props.create(changes, this.hide);
            }
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change(item);
        }
    }

    render = () => this.renderModal({
        title: 'Hình ảnh',
        size: 'large',
        body: <div className='row'>
            <div className='col-md-8'>
                <FormTextBox ref={e => this.itemName = e} label='Tiêu đề chính' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemSubtitle = e} label='Tiêu đề phụ' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemLink = e} type='link' label='Link liên kết' readOnly={this.props.readOnly} />
            </div>
            <div className='col-md-4'>
                <FormImageBox ref={e => this.imageBox = e} label='Hình ảnh nền' uploadType='CarouselItemImage' image={this.state.image} readOnly={this.props.readOnly}
                    onSuccess={this.onUploadSuccess} />
                <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
            </div>
            <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả' className='col-md-12' readOnly={this.props.readOnly} />
        </div>,
    });
}

class CarouselEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/carousel/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getCarousel(params._id, data => {
                this.itemTitle.value(data.item.title);
                this.itemHeight.value(data.item.height);
                this.itemSingle.value(data.item.single);

                this.itemTitle.focus();
                this.setState(data.item);
            });
        });
    }

    save = () => this.props.updateCarousel(this.state._id, {
        title: this.itemTitle.value(),
        height: parseInt(this.itemHeight.value()),
        single: this.itemSingle.value(),
    });

    createItem = (e) => e.preventDefault() || this.modal.show({ carouselId: this.state._id });

    editItem = (e, item) => e.preventDefault() || this.modal.show(item);

    swapItem = (e, item, isMoveUp) => e.preventDefault() || this.props.swapCarouselItem(item._id, isMoveUp);

    deleteItem = (e, item) => e.preventDefault() || T.confirm('Xóa hình ảnh', 'Bạn có chắc bạn muốn xóa hình ảnh này?', true, isConfirm =>
        isConfirm && this.props.deleteCarouselItem(item._id));

    render() {
        const permission = this.getUserPermission('component');
        const table = renderTable({
            getDataSource: () => this.props.component.carousel && this.props.component.carousel.selectedItem && this.props.component.carousel.selectedItem.items,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '80%' }}>Tiêu đề</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={this.editItem} />
                    <TableCell type='image' content={item.image || '/img/avatar.jpg'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateCarouselItem(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swapItem} onEdit={this.editItem} onDelete={this.deleteItem} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-picture-o',
            title: 'Tập hình ảnh: ' + (this.state.title || '...'),
            breadcrumb: [<Link to='/user/component'>Thành phần giao diện</Link>, 'Tập hình ảnh'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body row'>
                        <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' className='col-md-6' onChange={e => this.setState({ title: e.target.value })} readOnly={!permission.write} />
                        <FormTextBox ref={e => this.itemHeight = e} label='Chiều cao' className='col-md-6' readOnly={!permission.write} />
                        <FormCheckbox ref={e => this.itemSingle = e} label='Đơn ảnh' className='col-md-6' readOnly={!permission.write} />
                    </div>
                    {permission.write &&
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
                        {permission.write &&
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.createItem}>
                                    <i className='fa fa-fw fa-lg fa-plus'></i> Thêm
                                </button>
                            </div>}
                    </div>
                </div>

                <CarouselItemModal ref={e => this.modal = e} create={this.props.createCarouselItem} update={this.props.updateCarouselItem} change={this.props.changeCarouselItem} readOnly={!permission.write} />
            </>,
            backRoute: '/user/component',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getCarousel, updateCarousel, createCarouselItem, updateCarouselItem, swapCarouselItem, deleteCarouselItem, changeCarouselItem };
export default connect(mapStateToProps, mapActionsToProps)(CarouselEditPage);
