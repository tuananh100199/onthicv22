import React from 'react';
import Dropdown from '../../view/component/Dropdown.jsx';

export default class ComponentModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { viewType: '<empty>', viewItemText: '<empty>', viewItems: [] };

        this.modal = React.createRef();
        this.viewType = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#comClassname').focus());
        }, 250);
    }

    show = (parentId, item) => {
        const { _id, className, style, viewId, viewType } = item ? item : { _id: null, className: '', style: '', viewId: null, viewType: '<empty>' };
        $('#comClassname').val(className);
        $('#comStyle').val(style);
        $(this.btnSave.current)
            .data('parentId', parentId)
            .data('id', _id)
            .data('viewId', viewId ? viewId : '');
        this.viewType.current.setText(viewType ? viewType : '<empty>');
        $('#comView').css('display', viewId ? 'inline-flex' : 'none');
        if (viewType) {
            this.typeChanged(viewType);
        }

        $(this.modal.current).modal('show');
    }

    typeChanged = (selectedType) => {
        const comView = $('#comView').css('display', 'none'),
            comLoading = $('#comLoading').css('display', 'none');

        const types = [
            '<empty>',
            'last news',
            'subscribe', 'contact', 'all staffs',
            'all news',
        ];

        if (types.indexOf(selectedType) == -1) {
            comView.css('display', 'inline-flex');
            comLoading.css('display', 'block');
            this.props.getComponentViews(selectedType, items => {
                comLoading.css('display', 'none');
                let viewItemText = '<empty>',
                    viewItemId = $(this.btnSave.current).data('viewId'),
                    found = false;
                for (let i = 0; i < items.length; i++) {
                    if (viewItemId == items[i]._id) {
                        viewItemText = T.language.parse(items[i].text);
                        found = true;
                        break;
                    }
                }
                if (!found) $(this.btnSave.current).data('viewId', '');

                this.setState({ viewType: selectedType, viewItemText, viewItems: items });
            });
        }
    }

    selectPageItem = (e, pageItem) => {
        $(this.btnSave.current).data('viewId', pageItem._id);
        this.setState({ viewItemText: T.language.parse(pageItem.text) });
        e.preventDefault();
    }

    save = () => {
        const btnSave = $(this.btnSave.current),
            _id = btnSave.data('id'),
            parentId = btnSave.data('parentId'),
            viewId = btnSave.data('viewId'),
            data = {
                viewType: this.viewType.current.getSelectedItem(),
                className: $('#comClassname').val().trim(),
                style: $('#comStyle').val().trim(),
            };
        if (viewId) data.viewId = viewId;

        if (_id) {
            this.props.onUpdate(_id, data, () => $(this.modal.current).modal('hide'));
        } else {
            if (_id) data._id = _id;
            this.props.onCreate(parentId, data, () => $(this.modal.current).modal('hide'));
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Danh mục</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='comClassname'>Class name</label>
                                <input className='form-control' id='comClassname' type='text' placeholder='Class name' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='comStyle'>Style</label>
                                <input className='form-control' id='comStyle' type='text' placeholder='Style' />
                                <small>Ví dụ: marginTop: 50px</small>
                            </div>
                            <div className='form-group'>
                                <div style={{ display: 'inline-flex' }}>
                                    <label >Loại thành phần:</label>&nbsp;&nbsp;
                                    <Dropdown ref={this.viewType} text='<empty>' items={T.pageTypes} onSelected={this.typeChanged} />
                                </div>
                            </div>
                            <div className='form-group' id='comView' style={{ display: 'none' }}>
                                <label>Tên thành phần:</label>&nbsp;&nbsp;
                                <img id='comLoading' src='/img/loading.gif' style={{ height: '32px', width: 'auto', display: 'none' }} />
                                <div className='dropdown' style={{ whiteSpace: 'nowrap' }}>
                                    <a ref={this.element} className='dropdown-toggle' style={{ textDecoration: 'none' }} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                        {this.state.viewItemText}
                                    </a>
                                    <div className='dropdown-menu'>
                                        {this.state.viewItems.map((item, index) => (
                                            <a key={index} className='dropdown-item' href='#' onClick={e => this.selectPageItem(e, item)}>
                                                {T.language.parse(item.text ? item.text : item)}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
