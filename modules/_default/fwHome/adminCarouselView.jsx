import React from 'react';
import { connect } from 'react-redux';
import { getCarouselAll, createCarousel, updateCarousel, deleteCarousel } from './redux/reduxCarousel';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class CarouselModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => {
        this.itemTitle.value('');
        this.itemHeight.value(100);
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value().trim(),
            height: this.itemHeight.value(),
        };
        if (data.title == '') {
            T.notify('Tên hình ảnh bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Tập hình ảnh',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' />
            <FormTextBox ref={e => this.itemHeight = e} type='number' label='Chiều cao' />
        </>,
    });
}

class CarouselView extends React.Component {
    componentDidMount() {
        this.props.getCarouselAll();
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa tập hình ảnh', 'Bạn có chắc bạn muốn xóa tập hình ảnh này?', true, isConfirm =>
        isConfirm && this.props.deleteCarousel(item._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.carousel && this.props.component.carousel.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chiều cao</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đơn ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/carousel/' + item._id} />
                    <TableCell type='number' content={item.height} />
                    <TableCell type='checkbox' content={item.single} permission={permission} onChanged={single => this.props.updateCarousel(item._id, { single })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/carousel/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return <>
            {table}
            <CarouselModal ref={e => this.modal = e} create={this.props.createCarousel} readOnly={!permission.write} />
            {permission.write ? <CirclePageButton type='create' onClick={() => this.modal.show()} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getCarouselAll, createCarousel, updateCarousel, deleteCarousel };
export default connect(mapStateToProps, mapActionsToProps)(CarouselView);
