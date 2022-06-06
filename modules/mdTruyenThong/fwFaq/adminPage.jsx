import React from 'react';
import { connect } from 'react-redux';
import { getFaqPage, createFaq, updateFaq, deleteFaq,swapFaq } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

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
            T.notify('Tên nhóm tin tức bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data,({item})=>{
                this.hide();
                console.log({item});
                this.props.history.push('/user/faq/'+item._id);
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Câu hỏi thường gặp',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Câu hỏi' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class AdminNewsGroupPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(() => {
            this.props.getFaqPage(1);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhóm tin tức?', 'Bạn có chắc bạn muốn xóa nhóm tin tức này?', true, isConfirm =>
        isConfirm && this.props.deleteFaq(item._id));
    
    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapFaq(item._id, isMoveUp);

    render() {
        const permission = this.getUserPermission('faq');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.faq && this.props.faq.page ?
            this.props.faq.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tiêu đề</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/faq/' + item._id} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateFaq(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.props.history.push('/user/faq/' + item._id)} onDelete={this.delete} onSwap={this.swap} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Câu hỏi thường gặp',
            breadcrumb: ['Câu hỏi thường gặp'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageFaq' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getFaqPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createFaq} update={this.props.updateFaq} history={this.props.history}/>
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, faq: state.communication.faq });
const mapActionsToProps = { getFaqPage, createFaq, updateFaq, deleteFaq,swapFaq };
export default connect(mapStateToProps, mapActionsToProps)(AdminNewsGroupPage);