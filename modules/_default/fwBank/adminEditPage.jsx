import React from 'react';
import { connect } from 'react-redux';
import { getBank, updateBank } from './redux';
import { AdminPage, AdminModal, FormSelect, FormTextBox, FormRichTextBox, FormCheckbox, TableCell, renderTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class BankItemModal extends AdminModal {
    state = {};
    bankDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        let { number, active, holder } = Object.assign({ number: '', holder: '', active: false }, item);
        this.itemName.value(holder);
        this.itemNumber.value(number);
        this.itemActive.value(active);

        // this.setState({ _id });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            title: this.itemName.value().trim(),
            subtitle: this.itemSubtitle.value().trim(),
            active: this.itemActive.value(),
        };

        if (changes.title == '') {
            T.notify('Tên ngân hàng bị trống!', 'danger');
            this.itemName.focus();
        } else {
            if (this.state._id) {
                this.props.update(this.state._id, changes, this.hide);
            } else {
                this.props.create(changes, this.hide);
            }
        }
    }

    render = () => this.renderModal({
        title: 'Ngân hàng',
        size: 'large',
        body: <div className='row'>
            <div className='col-md-8'>
                <FormTextBox ref={e => this.itemName = e} label='Tiêu đề chính' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemSubtitle = e} label='Tiêu đề phụ' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemLink = e} type='link' label='Link liên kết' readOnly={this.props.readOnly} />
            </div>
            <div className='col-md-4'>
                <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
            </div>
            <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả' className='col-md-12' readOnly={this.props.readOnly} />
        </div>,
    });
}

class BankEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/bank', () => {
            this.getBanks();
            const route = T.routeMatcher('/user/bank/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getBank(params._id, item => {
                // this.itemTitle.value(data.item.title);{id:code,text:item.code+' - '+item.name}
                this.bank.value(item.code);
                this.active.value(item.active || false);
                this.contentSyntax.value(item.contentSyntax);
                this.moneyLine.value(item.moneyLine);
                this.moneyStr.value(item.moneyStr);
                this.contentLine.value(item.contentLine);
                this.contentStr.value(item.contentStr);
                this.setState({code: item.code, _id: item._id, name: item.name});
            });
        });
    }

    getBanks = () => {
        fetch('https://api.vietqr.io/v1/banks').then(
        (response) => response.json().then(
          (jsonData) => {
               this.setState({banks: jsonData.data && jsonData.data.map(({code,name})=>({id:code,text:code+' - '+name}))}, ()=>{
                    this.bank.value(this.state.code);
               });
          }
      )
    );}

    onChange = ({id, text}) => {
        text = text.split('-')[1];
        this.setState({
            name: text,
            code: id
        });
    }

    parseMoney = () => {
        const moneyStr = this.moneyStr.value();
        const moneyStartStr = moneyStr.split('/:money/')[0], moneyEndStr = moneyStr.split('/:money/')[1], reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
        const preRegex = str => str.replace(reEscape, '\\$&');
        const moneyRegex = new RegExp(preRegex(moneyStartStr) + '(.+)' + preRegex(moneyEndStr),  'i');
        const moneyStrEx = this.moneyStrEx.value();
        const moneyPart = moneyStrEx.match(moneyRegex);
        if(moneyPart){
            let money = moneyPart[1].replace(/\D/g,''); // Strip all non-numeric characters from string
            this.setState({money});
        } else this.setState({money:'Chưa tính được'});
    }

    parseContent = () => {
        const contentStr = this.contentStr.value();
        const contentStartStr = contentStr.split('/:content/')[0], contentEndStr = contentStr.split('/:content/')[1], reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
        const preRegex = str => str.replace(reEscape, '\\$&');
        const contentRegex = new RegExp(preRegex(contentStartStr) + '(.+)' + preRegex(contentEndStr),  'i');
        const contentStrEx = this.contentStrEx.value();
        const contentPart = contentStrEx.match(contentRegex);
        if(contentPart){
            let content = contentPart[1].trim();
            this.setState({content});
        } else this.setState({content:'Chưa tính được'});
    }

    save = () => {
        const { code, name, _id } = this.state;
        const changes = {
            code: code.trim(),
            name: name.trim(),
            active: this.active.value(),
            contentSyntax: this.contentSyntax.value().trim(),
            moneyLine: parseInt(this.moneyLine.value()),
            moneyStr: this.moneyStr.value().trim(),
            contentLine: parseInt(this.contentLine.value()),
            contentStr: this.contentStr.value().trim(),
        };
        if (changes.contentSyntax == '') {
            T.notify('Cú pháp chuyển tiền của học viên bị trống!', 'danger');
            this.contentSyntax.focus();
        } else if (changes.moneyLine == '') {
            T.notify('Dòng biến động số dư bị trống!', 'danger');
            this.moneyLine.focus();
        } else if (changes.moneyStr == '') {
            T.notify('Chuỗi biến động số dư bị trống!', 'danger');
            this.moneyStr.focus();
        } else if (changes.contentLine == '') {
            T.notify('Dòng nội dung giao dịch bị trống!', 'danger');
            this.contentLine.focus();
        } else if (changes.contentStr == '') {
            T.notify('Chuỗi nội dung giao dịch bị trống!', 'danger');
            this.contentStr.focus();
        } else if (changes.code == '') {
            T.notify('Ngân hàng không được trống', 'danger');
            this.bank.focus();
        } else {
            // if (changes.roles.length == 0) changes.roles = 'empty';
            this.props.updateBank(_id, changes, (item) => {
                this.props.getBank(item._id);
            });
        }
    }
    // createItem = (e) => e.preventDefault() || this.modal.show({ bankId: this.state._id });

    // editItem = (e, item) => e.preventDefault() || this.modal.show(item);

    // swapItem = (e, item, isMoveUp) => e.preventDefault() || this.props.swapBankItem(item._id, isMoveUp);

    // deleteItem = (e, item) => e.preventDefault() || T.confirm('Xóa ngân hàng', 'Bạn có chắc bạn muốn xóa ngân hàng này?', true, isConfirm =>
    //     isConfirm && this.props.deleteBankItem(item._id));

    render() {
        const permission = this.getUserPermission('bank');
        const readOnly = !permission.write;
        const bank = this.props.bank && this.props.bank.item || { code: ''};
        const listParams = ['{cmnd}', '{ten_loai_khoa_hoc}'];
        const table = renderTable({
            getDataSource: () => this.props.bank.bank && this.props.bank.bank.selectedItem && this.props.bank.bank.selectedItem.items,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '80%' }}>Tiêu đề</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Ngân hàng</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={this.editItem} />
                    <TableCell type='image' content={item.image || '/img/avatar.jpg'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateBankItem(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swapItem} onEdit={this.editItem} onDelete={this.deleteItem} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Ngân hàng: ' + (bank.code || '...'),
            breadcrumb: [<Link key={0} to='/user/bank'>Ngân hàng</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Cấu hình SMS</h3>
                    <div className='tile-body row'>
                        <div className='col-md-4'>
                        <FormSelect ref={e => this.bank = e} label='Ngân hàng' data={this.state.banks} readOnly={readOnly} onChange={data => this.onChange(data)}/>
                        <FormCheckbox ref={e => this.active = e} label='Kích hoạt' readOnly={readOnly} />
                        <FormRichTextBox ref={e => this.contentSyntax = e} rows={1} listParams={listParams} label='Cú pháp chuyển tiền của học viên' readOnly={readOnly} />
                        </div>
                        <div className='col-md-4'>
                        <FormTextBox ref={e => this.moneyLine = e} label='Dòng biến động số dư' readOnly={readOnly} />
                        <FormTextBox ref={e => this.moneyStr = e} label='Chuỗi phần biến động số dư' readOnly={readOnly} />
                        <FormTextBox ref={e => this.moneyStrEx = e} label='Chuỗi phần biến động số dư ví dụ' readOnly={readOnly} />
                        <button className='btn btn-warning' type='button' onClick={()=>this.parseMoney()}>Tính
                        </button> &nbsp; Số tiền(money): <label style={{fontWeight:'bold'}}>{this.state.money}</label>                      
                        </div>
                        <div className='col-md-4'>
                        <FormTextBox ref={e => this.contentLine = e} label='Dòng nội dung giao dịch' readOnly={readOnly} />
                        <FormTextBox ref={e => this.contentStr = e} label='Chuỗi phần nội dung giao dịch' readOnly={readOnly} />
                        <FormTextBox ref={e => this.contentStrEx = e} label='Chuỗi phần nội dung giao dịch ví dụ' readOnly={readOnly} />
                        <button className='btn btn-warning' type='button' onClick={()=>this.parseContent()}>Tính
                        </button> &nbsp; Nội dung(content): <label style={{fontWeight:'bold'}}>{this.state.content}</label>       
                        </div>
                    </div>
                    {permission.write &&
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>}
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Tài khoản ngân hàng nhận tiền</h3>
                    <div className='tile-body'>
                        {table}
                        {permission.write &&
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.createItem}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                                </button>
                            </div>}
                    </div>
                </div>

                <BankItemModal ref={e => this.modal = e} create={this.props.createBankItem} update={this.props.updateBankItem} change={this.props.changeBankItem} readOnly={readOnly} />
            </>,
            backRoute: '/user/bank',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, bank: state.framework.bank});
const mapActionsToProps = { getBank, updateBank };
export default connect(mapStateToProps, mapActionsToProps)(BankEditPage);
