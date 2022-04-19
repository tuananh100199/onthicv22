import React from 'react';
import { connect } from 'react-redux';
import { getBank, updateBank } from './redux';
import { AdminPage, AdminModal, FormSelect, FormTextBox, FormRichTextBox, FormCheckbox, TableCell, renderTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class AccountModal extends AdminModal {
    state = {};
    type = 'add';
    index = 0;
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemNumber.focus()));
    }

    onShow = ({ item, index }) => {
        if (item) {
            this.type = 'edit';
            this.index = index;
        } else {
            this.type = 'add';
        }
        let { number, active, holder } = Object.assign({ number: '', holder: '', active: false }, item);
        this.itemName.value(holder);
        this.itemNumber.value(number);
        this.itemActive.value(active);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const accounts = [...this.props.accounts];
        const changes = {
            holder: this.itemName.value().trim(),
            number: this.itemNumber.value().trim(),
            active: this.itemActive.value(),
        };
        if (changes.holder == '') {
            T.notify('Người sở hữu tài khoản bị trống!', 'danger');
            this.itemName.focus();
        } else if (changes.number == '') {
            T.notify('Số tài khoản bị trống!', 'danger');
            this.itemNumber.focus();
        } else {
            if (this.type == 'edit') {
                accounts.splice(this.index, 1, changes);
            } else {
                accounts.push(changes);
            }
            this.props.updateBank(this.props._id, { accounts }, (item) => {
                this.props.getBank(item._id, this.hide);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Ngân hàng',
        size: 'large',
        body: <div>
            <FormTextBox ref={e => this.itemNumber = e} label='Số tài khoản' readOnly={this.props.readOnly} />
            <FormTextBox ref={e => this.itemName = e} label='Họ và tên người sở hữu tài khoản' readOnly={this.props.readOnly} />
            <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
        </div>,
    });
}

class BankEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/bank', () => {
            const route = T.routeMatcher('/user/bank/:_id'),
                params = route.parse(window.location.pathname);
            if (params._id) {
                this.getBanks(this.getData(params._id));
            } else {
                this.props.history.push('/user/bank');
            }

        });
    }

    getBanks = (done) => {
        fetch('https://api.vietqr.io/v1/banks').then(
            (response) => response.json().then(
                (jsonData) => {
                    this.setState({ banks: jsonData.data && jsonData.data.map(({ code, name, short_name }) => ({ id: code, text: short_name + ' - ' + name })) }, () => {
                        // this.bank.value(this.state.code);
                        done && done();
                    });
                }
            )
        );
    }

    getData = (id) => {
        this.props.getBank(id, item => {
            // this.bank.value(item.code);
            this.active.value(item.active || false);
            this.contentSyntax.value(item.contentSyntax);
            this.contentSyntaxExtra.value(item.contentSyntaxExtra);
            this.moneyLine.value(item.moneyLine);
            this.moneyStr.value(item.moneyStr);
            this.contentLine.value(item.contentLine);
            this.contentStr.value(item.contentStr);
            this.setState({ code: item.code, _id: item._id });
            this.bank.value(this.state.code);
        });
    }

    onChange = ({ text }) => {
        text = text.split('-');
        this.setState({
            name: text[1],
            shortname: text[0],
        });
    }

    parseMoney = () => {
        const moneyStr = this.moneyStr.value();
        const moneyStartStr = moneyStr.split('/:money/')[0], moneyEndStr = moneyStr.split('/:money/')[1], reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
        const preRegex = str => str.replace(reEscape, '\\$&');
        const moneyRegex = new RegExp(preRegex(moneyStartStr) + '(.+)' + preRegex(moneyEndStr), 'i');
        const moneyStrEx = this.moneyStrEx.value();
        const moneyPart = moneyStrEx.match(moneyRegex);
        if (moneyPart) {
            let money = moneyPart[1].replace(/\D/g, ''); // Strip all non-numeric characters from string
            this.setState({ money });
        } else this.setState({ money: 'Chưa tính được' });
    }

    parseContent = () => {
        const contentStr = this.contentStr.value();
        const contentStartStr = contentStr.split('/:content/')[0], contentEndStr = contentStr.split('/:content/')[1], reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
        const preRegex = str => str.replace(reEscape, '\\$&');
        const contentRegex = new RegExp(preRegex(contentStartStr) + '(.+)' + preRegex(contentEndStr), 'i');
        const contentStrEx = this.contentStrEx.value();
        const contentPart = contentStrEx.match(contentRegex);
        if (contentPart) {
            let content = contentPart[1].trim();
            this.setState({ content });
        } else this.setState({ content: 'Chưa tính được' });
    }

    save = () => {
        const changes = {
            active: this.active.value(),
            contentSyntax: this.contentSyntax.value().trim(),
            contentSyntaxExtra: this.contentSyntaxExtra.value().trim(),
            moneyLine: this.moneyLine.value(),
            moneyStr: this.moneyStr.value().trim(),
            contentLine: this.contentLine.value(),
            contentStr: this.contentStr.value().trim(),
        };
        console.log('changes: ', changes);
        if (changes.contentSyntax == '') {
            T.notify('Cú pháp chuyển tiền học phí chính thức của học viên bị trống!', 'danger');
            this.contentSyntax.focus();
        } if (changes.contentSyntaxExtra == '') {
            T.notify('Cú pháp chuyển tiền học phí tăng thêm của học viên bị trống!', 'danger');
            this.contentSyntaxExtra.focus();
        } else if (changes.moneyLine == '' && changes.contentLine !== 0) {
            T.notify('Dòng biến động số dư bị trống!', 'danger');
            this.moneyLine.focus();
        } else if (changes.moneyStr == '') {
            T.notify('Chuỗi biến động số dư bị trống!', 'danger');
            this.moneyStr.focus();
        } else if (changes.contentLine == '' && changes.contentLine !== 0) {
            T.notify('Dòng nội dung giao dịch bị trống!', 'danger');
            this.contentLine.focus();
        } else if (changes.contentStr == '') {
            T.notify('Chuỗi nội dung giao dịch bị trống!', 'danger');
            this.contentStr.focus();
        } else if (changes.code == '') {
            T.notify('Ngân hàng không được trống', 'danger');
            this.bank.focus();
        } else {
            const { shortname, name, _id, code } = this.state;
            const bankCodeCurrent = this.bank.value().trim();
            if (bankCodeCurrent != code) {
                changes.code = bankCodeCurrent;
                changes.shortname = shortname.trim();
                changes.name = name.trim();
            }
            this.props.updateBank(_id, changes, (item) => {
                this.props.getBank(item._id);
                this.setState({ code: item.code });
            });
        }
    }

    showModal = (e, { item, index }) => e.preventDefault() || this.modal.show({ item, index });

    delete = (e, { index }) => e.preventDefault() || T.confirm('Xóa tài khoản ngân hàng', 'Bạn có chắc bạn muốn xóa tài khoản ngân hàng này?', true, isConfirm => {
        if (isConfirm) {
            const accounts = this.props.bank && this.props.bank.item && this.props.bank.item.accounts || [];
            accounts.splice(index, 1);
            this.props.updateBank(this.state._id, { accounts: accounts.length == 0 ? 'empty' : accounts }, (item) => this.props.getBank(item._id));
        }
    });

    render() {
        const permission = this.getUserPermission('bank');
        const readOnly = !permission.write;
        const { _id } = this.state;
        const bank = this.props.bank && this.props.bank.item || { shortname: '' }, accounts = bank && bank.accounts || [];
        const listParams = ['{cmnd}', '{ten_loai_khoa_hoc}'];
        const listParamsExtra = ['{cmnd}', '{ten_loai_khoa_hoc}, {ma_giao_dich}'];
        const table = renderTable({
            getDataSource: () => accounts,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số tài khoản</th>
                    <th style={{ width: '100%' }}>Họ và tên người sở hữu tài khoản</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.number} onClick={e => this.showModal(e, { item, index })} />
                    <TableCell content={item.holder} />
                    <TableCell type='checkbox' content={item.active} permission={permission} isSwitch={false}
                        onChanged={active => {
                            accounts[index].active = active;
                            this.props.updateBank(_id, { accounts }, () => this.props.getBank(_id));
                        }} />
                    <TableCell type='buttons' content={{ item, index }} permission={permission} onEdit={this.showModal} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Ngân hàng: ' + (bank.shortname || '...'),
            breadcrumb: [<Link key={0} to='/user/bank'>Ngân hàng</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Cấu hình SMS</h3>
                    <div className='tile-body row'>
                        <div className='col-md-4'>
                            <FormSelect ref={e => this.bank = e} label='Ngân hàng' data={this.state.banks} readOnly={readOnly} onChange={data => this.onChange(data)} />
                            <FormRichTextBox ref={e => this.contentSyntax = e} rows={1} listParams={listParams} label='Cú pháp chuyển tiền học phí chính thức ' readOnly={readOnly} />
                            <FormRichTextBox ref={e => this.contentSyntaxExtra = e} rows={1} listParams={listParamsExtra} label='Cú pháp chuyển tiền học phí tăng thêm' readOnly={readOnly} />
                            <FormCheckbox ref={e => this.active = e} label='Kích hoạt' readOnly={readOnly} />
                        </div>
                        <div className='col-md-4'>
                            <FormTextBox ref={e => this.moneyLine = e} label='Dòng biến động số dư' readOnly={readOnly} />
                            <FormTextBox ref={e => this.moneyStr = e} label='Chuỗi phần biến động số dư' readOnly={readOnly} />
                            <FormTextBox ref={e => this.moneyStrEx = e} label='Chuỗi phần biến động số dư ví dụ' readOnly={readOnly} />
                            <button className='btn btn-warning' type='button' onClick={() => this.parseMoney()}>Tính
                            </button> &nbsp; Số tiền(money): <label style={{ fontWeight: 'bold' }}>{this.state.money}</label>
                        </div>
                        <div className='col-md-4'>
                            <FormTextBox ref={e => this.contentLine = e} label='Dòng nội dung giao dịch' readOnly={readOnly} />
                            <FormTextBox ref={e => this.contentStr = e} label='Chuỗi phần nội dung giao dịch' readOnly={readOnly} />
                            <FormTextBox ref={e => this.contentStrEx = e} label='Chuỗi phần nội dung giao dịch ví dụ' readOnly={readOnly} />
                            <button className='btn btn-warning' type='button' onClick={() => this.parseContent()}>Tính
                            </button> &nbsp; Nội dung(content): <label style={{ fontWeight: 'bold' }}>{this.state.content}</label>
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
                                <button className='btn btn-success' type='button' onClick={(e) => this.showModal(e, {})}>
                                    <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                                </button>
                            </div>}
                    </div>
                </div>
                <AccountModal ref={e => this.modal = e} updateBank={this.props.updateBank} readOnly={readOnly} _id={_id} getBank={this.props.getBank} accounts={accounts} />
            </>,
            backRoute: '/user/bank',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, bank: state.framework.bank });
const mapActionsToProps = { getBank, updateBank };
export default connect(mapStateToProps, mapActionsToProps)(BankEditPage);
