import React from 'react';
import { AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';

export default class ComponentModal extends AdminModal {
    state = { viewType: '<empty>', adapter: null };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemClassname.focus()));
        this.componentTypes = Object.keys(T.component).sort().map(item => ({ id: item, text: item }));
    }

    onShow = ({ parentId, component }) => {
        const { _id, className, style, viewId, viewType } = component || { _id: null, className: '', style: '', viewId: null, viewType: '<empty>' };
        this.itemClassname.value(className);
        this.itemStyle.value(style);
        this.itemViewTyle.value(viewType || '<empty>');

        this.setState({ _id, parentId, viewId: viewId || '' }, () => viewType && this.viewTypeChanged(viewType));
    }

    viewTypeChanged = (selectedType) => {
        // 'last news', 'subscribe', 'contact', 'all news', 'all courses', 'last course', 'all course types'
        const selectedComponent = T.component[selectedType];
        if (selectedComponent && selectedComponent.adapter && selectedComponent.getItem) {
            this.setState({ adapter: selectedComponent.adapter }, () => {
                selectedComponent.getItem(this.state.viewId, data => {
                    this.itemViewItem.value(data && data.item ? { id: this.state.viewId, text: data.item.title } : null);
                });
            });
        } else {
            this.setState({ adapter: null });
        }
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

    render = () => {
        console.log('render', this.state.adapter);
        return this.renderModal({
            title: 'Thành phần giao diện',
            body: <>
                <FormTextBox ref={e => this.itemClassname = e} label='Classname' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemStyle = e} label='Style' smallText='Ví dụ: marginTop: 50px' readOnly={this.props.readOnly} />
                <FormSelect ref={e => this.itemViewTyle = e} label='Loại thành phần' data={this.componentTypes} onChange={data => this.viewTypeChanged(data.id)} readOnly={this.props.readOnly} />

                <FormSelect ref={e => this.itemViewItem = e} label='Tên thành phần' data={this.state.adapter} onChange={data => this.setState({ viewId: data.id })} readOnly={this.props.readOnly}
                    style={{ display: this.state.adapter ? 'block' : 'none' }} />
            </>,
        });
    }
}