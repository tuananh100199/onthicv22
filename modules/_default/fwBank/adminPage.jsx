import React from 'react';
import { connect } from 'react-redux';
import { getBankAll, createBank, updateBank, deleteBank } from './redux';
import { AdminPage, AdminModal, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class BankModal extends AdminModal {
    state = {
        banks: [],
        name: '',
        code: '',
    };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.getBanks();
        }));
    }

    getBanks = () => {
        fetch('https://api.vietqr.io/v1/banks').then(
        (response) => response.json().then(
          (jsonData) => {
               this.setState({banks: jsonData.data && jsonData.data.map(({code,name})=>({id:code,text:code+' - '+name}))});
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

    onSubmit = () => {
        const {code, name} = this.state;
        if (code == '') {
            T.notify('Ngân hàng bị trống!', 'danger');
            this.bank.focus();
        } else {
            this.props.create({code: code.trim(), name: name.trim()}, () => {
                this.props.getAll();
                this.hide();
                });
        }
    }

    render = () => this.renderModal({
        title: 'Thêm ngân hàng',
        size: 'large',
        body: <>
            <FormSelect ref={e => this.bank = e} label='Ngân hàng' data={this.state.banks} readOnly={this.props.readOnly} onChange={data => this.onChange(data)}/>
        </>,
    });
}

class BankPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/bank', () => {
            this.props.getBankAll();
        });
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa ngân hàng', 'Bạn có chắc bạn muốn xóa ngân hàng này?', true, isConfirm =>
        isConfirm && this.props.deleteBank(item._id, () => this.props.getBankAll()));

    render() {
        const permission = this.getUserPermission('bank');
        const list = this.props.bank && this.props.bank.list || [];

        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Tên viết tắt</th>
                    <th style={{ width: '100%', textAlign: 'center' }}>Tên đầy đủ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.code} url={'/user/bank/' + item._id} />
                    <TableCell content={item.name} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateBank(item._id, { active }, () => this.props.getBankAll())} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.props.history.push('/user/bank/' + item._id)} onDelete={this.delete}></TableCell>
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Ngân hàng',
            breadcrumb: ['Ngân hàng'],
            content: <>
                <div className='tile'>{table}</div>
                <BankModal ref={e => this.bankModal = e} readOnly={!permission.write}
                    getAll={this.props.getBankAll} create={this.props.createBank}/>
            </>,
            onCreate: permission.write ? () => this.bankModal.show()  : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, bank: state.framework.bank });
const mapActionsToProps = { getBankAll, createBank, updateBank, deleteBank };
export default connect(mapStateToProps, mapActionsToProps)(BankPage);