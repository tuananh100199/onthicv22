import React from 'react';
import { connect } from 'react-redux';
import { getSimulatorPage, createSimulator, updateSimulator, deleteSimulator, swapSimulator } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormCheckbox, FormImageBox} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class SimulatorModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
        
    }

    onShow = (item) => {
        const { _id, title, link, maxPointAnswer, minPointAnswer, active, image } = item || { _id: null, title: '', active:true, maxPointAnswer: '', minPointAnswer: '', link:'' };
        this.itemTitle.value(title);
        this.itemActive.value(active);
        this.itemLink.value(link);
        this.itemMaxPointAnswer.value(maxPointAnswer);
        this.itemMinPointAnswer.value(minPointAnswer);
        this.imageBox.setData(`image:${_id || 'new'}`);
        this.setState({ _id, image});
    }

    onSubmit = () => {
        let data = {
            title: this.itemTitle.value(),
            active: this.itemActive.value(),
            link:  this.itemLink.value(),
            maxPointAnswer:  this.itemMaxPointAnswer.value(),                             //Thời gian trả lời để đạt điểm tối đa
            minPointAnswer: this.itemMinPointAnswer.value(),                             //Thời gian trả lời đạt điểm tối thiểu
        };
        if (data.title == '') {
            T.notify('Tên lớp bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.maxPointAnswer == '' || !data.maxPointAnswer) {
            T.notify('Thời gian đạt điểm tối đa bị trống!', 'danger');
            this.itemMaxPointAnswer.focus();
        } else if (data.maxPointAnswer == '' || !data.minPointAnswer) {
            T.notify('Thời gian đạt điểm tối thiểu bị trống!', 'danger');
            this.itemMinPointAnswer.focus();
        } else if (data.link == '') {
            T.notify('Đường dẫn bị trống!', 'danger');
            this.itemLink.focus();
        } else {
            if(this.state._id){
                this.props.update(this.state._id, data, this.hide());
            } else {
                this.props.create({ ...data, image: this.state.image }, this.hide());
            }
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            item && image && this.setState({ image });
            // item && this.props.change(item);
        }
    }

    render = () => this.renderModal({
        title: 'Mô phỏng',
        size: 'large',
        body: 
            <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tên bài mô phỏng' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLink = e} label='Đường dẫn' readOnly={this.props.readOnly} />
                </div>
                <FormImageBox className='col-md-4' ref={e => this.imageBox = e} label='Hình gợi ý' uploadType='ImageSimulator' image={this.state.image} readOnly={this.props.readOnly}
                    onSuccess={this.onUploadSuccess} />
            <FormTextBox className='col-md-6' ref={e => this.itemMaxPointAnswer = e} label='Số giây để đạt điểm tối đa' readOnly={this.props.readOnly}/>
            <FormTextBox className='col-md-6' ref={e => this.itemMinPointAnswer = e} label='Số giây để đạt điểm tối thiểu' readOnly={this.props.readOnly } />
            <FormCheckbox className='col-md-6' ref={e => this.itemActive = e} isSwitch={true} label='Kích hoạt' readOnly={this.props.readOnly } />
            </div>,
    });
}

class SimulatorPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getSimulatorPage();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Lớp ôn tập', 'Bạn có chắc bạn muốn lớp ôn tập này?', true, isConfirm =>
        isConfirm && this.props.deleteSimulator(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapSimulator(item._id, isMoveUp);

    render() {
        const permission = this.getUserPermission('simulator'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.simulator && this.props.simulator.page ?
                this.props.simulator.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên bài học</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Link</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình gợi ý</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.title} onClick={() => this.modal.show(item)}/>
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.link} />
                        <TableCell type='image' content={item.image || '/img/avatar.png'} />
                        <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateSimulator(item._id, {active})} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onSwap={this.swap} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Mô phỏng',
            breadcrumb: ['Mô phỏng'],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <SimulatorModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSimulator} change={this.props.changeSimulator} update={this.props.updateSimulator} permission={permission} />
                <Pagination name='pageSimulator' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getSimulatorPage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, simulator: state.training.simulator });
const mapActionsToProps = { getSimulatorPage, createSimulator, updateSimulator, deleteSimulator, swapSimulator };
export default connect(mapStateToProps, mapActionsToProps)(SimulatorPage);
