import React from 'react';
import { connect } from 'react-redux';
import { getLawPage, createLaw, updateLaw, deleteLaw,swapLaw } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
console.log('into lawPage');
class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id = null, title = '', active = true } = item || {};
        this.itemTitle.value(title);
        this.itemActive.value(active);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            active: this.itemActive.value(),
        };
        if (data.title == '') {
            T.notify('Tên quy định bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data,({item})=>{
                this.hide();
                this.props.history.push('/user/law/'+item._id);
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quy định pháp luật',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Tiêu đề' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class AdminLawPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(() => {
            this.props.getLawPage(1);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa quy định pháp luật?', 'Bạn có chắc bạn muốn xóa quy định pháp luật này?', true, isConfirm =>
        isConfirm && this.props.deleteLaw(item._id));
    
    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapLaw(item._id, isMoveUp);

    render() {
        const permission = this.getUserPermission('law');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.law && this.props.law.page ?
            this.props.law.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tiêu đề</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/law/' + item._id} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} style={{ height: '32px' }} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateLaw(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.props.history.push('/user/law/' + item._id)} onDelete={this.delete} onSwap={this.swap} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Quy định pháp luật',
            breadcrumb: ['Quy định pháp luật'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageLaw' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getLawPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createLaw} update={this.props.updateLaw} history={this.props.history}/>
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, law: state.communication.law });
const mapActionsToProps = { getLawPage, createLaw, updateLaw, deleteLaw,swapLaw };
export default connect(mapStateToProps, mapActionsToProps)(AdminLawPage);