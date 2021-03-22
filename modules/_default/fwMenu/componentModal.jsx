import React from 'react';
import { AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';

export default class ComponentModal extends AdminModal {
    state = { viewType: '<empty>', viewItemText: '<empty>', viewItems: [] };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemClassname.focus()));
        this.componentTypes = T.componentTypes.map(item => ({ id: item, text: item }));
    }

    onShow = ({ parentId, component }) => {
        const { _id, className, style, viewId, viewType } = component || { _id: null, className: '', style: '', viewId: null, viewType: '<empty>' };
        this.itemClassname.value(className);
        this.itemStyle.value(style);
        this.itemViewTyle.value(viewType || '<empty>');
        $('#comView').css('display', viewId ? 'inline-flex' : 'none');
        if (viewType) this.viewTypeChanged(viewType);

        this.setState({ _id, parentId, viewId: viewId || '' });
    }

    viewTypeChanged = (selectedType) => {
        const comView = $('#comView').css('display', 'none'),
            comLoading = $('#comLoading').css('display', 'none');

        const types = [
            '<empty>',
            'last news',
            'subscribe', 'contact',
            'all news', 'all courses', 'last course', 'all course types'
        ];

        if (types.indexOf(selectedType) == -1) {
            comView.css('display', 'inline-flex');
            comLoading.css('display', 'block');
            this.props.getComponentViews(selectedType, items => {
                comLoading.css('display', 'none');
                let viewItemText = '<empty>',
                    viewItemId = this.state.viewId,
                    found = false;
                for (let i = 0; i < items.length; i++) {
                    if (viewItemId == items[i]._id) {
                        viewItemText = items[i].text;
                        found = true;
                        break;
                    }
                }
                if (!found) this.setState({ viewId: '' });

                this.setState({ viewType: selectedType, viewItemText, viewItems: items });
            });
        }
    }

    selectPageItem = (e, pageItem) => {
        this.setState({ viewId: pageItem._id });
        this.setState({ viewItemText: pageItem.text });
        e.preventDefault();
    }

    onSubmit = () => {
        const { _id, parentId, viewId } = this.state,
            data = {
                viewType: this.itemViewTyle.value(),
                className: this.itemClassname.value().trim(),
                style: this.itemStyle.value().trim(),
            };
        if (viewId) data.viewId = viewId;

        if (_id) {
            this.props.onUpdate(_id, data, () => this.hide());
        } else {
            if (_id) data._id = _id;
            this.props.onCreate(parentId, data, () => this.hide());
        }
    }

    render = () => this.renderModal({
        title: 'Thành phần giao diện',
        body: <>
            <FormTextBox ref={e => this.itemClassname = e} label='Classname' readOnly={this.props.readOnly} />
            <FormTextBox ref={e => this.itemStyle = e} label='Style' smallText='Ví dụ: marginTop: 50px' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemViewTyle = e} label='Loại thành phần' data={this.componentTypes} onChange={data => this.viewTypeChanged(data.id)} readOnly={this.props.readOnly} />
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
                                {item.text}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </>,
    });
}