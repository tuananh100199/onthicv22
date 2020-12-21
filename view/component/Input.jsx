import React from 'react';
import './input.scss'

export class Select extends React.Component {
    state = { data: [] }
    input = React.createRef();
    
    componentDidMount() {
        if (this.props.adapter) {
            if (this.props.adapter.ajax) {
                $(this.input.current).select2({
                    tags: this.props.adapter.tags || false,
                    ajax: {
                        url: this.props.adapter.url,
                        data: this.props.adapter.data,
                        processResults: this.props.adapter.processResults,
                        delay: 500
                    },
                    dropdownParent: this.props.dropdownParent || $('.modal-body').has(this.input.current)[0] || $('.tile-body').has(this.input.current)[0],
                    placeholder: this.props.placeholder || 'Chọn ' + this.props.label.lowFirstChar(),
                });
            } else {
                // this.$input().select2({
                //     minimumResultsForSearch: this.props.hideSearchBox ? -1 : 1,
                //     tags: this.props.adapter.tags || false,
                //     dropdownParent: this.props.dropdownParent || $('.modal-body').has(this.input.current)[0] || $('.tile-body').has(this.input.current)[0],
                //     placeholder: this.props.placeholder || 'Chọn ' + this.props.label.lowFirstChar(),
                // });
                // this.#fetchAll(() => this.setVal(this.props.defaultValue));
            }
        } else {
            // this.$input().select2({
            //     minimumResultsForSearch: this.props.hideSearchBox ? -1 : 1,
            //     dropdownParent: this.props.dropdownParent || $('.modal-body').has(this.input.current)[0] || $('.tile-body').has(this.input.current)[0],
            //     placeholder: this.props.placeholder || 'Chọn ' + this.props.label.lowFirstChar(),
            // });
            // this.setState({ data: this.props.data });
        }
        // this.setVal(this.defaultValue);
    }
    
    val = (value) => {
        if (value != undefined) {
            if (value.constructor === String) {
                $(this.input.current).val(value).trigger('change');
            } else if (value.constructor === ({}).constructor) {
                const option = new Option(value.text, value.id, true, true);
                $(this.input.current).append(option).trigger('change');
            }
        } else {
            return $(this.input.current).val()
        }
    }
    
    render = () => {
        let optionsData =
            Array.isArray(this.state.data) ?
                typeof this.state.data[0] === 'string' || typeof this.state.data[0] === 'number' ?
                    this.state.data.map(item => ({ value: item, text: item })) :
                    this.state.data :
                [];
        
        return (
            <label style={{ width: '100%', marginBottom: '0' }}>
                {this.props.displayLabel && <div style={{ marginBottom: '0.5rem' }}>{this.props.label}{this.props.required && <span style={{ color: 'red' }}> *</span>}</div>}
                <select className='form-control' ref={this.input} disabled={this.props.disabled} multiple={this.props.multiple} onChange={() => { T.notify('a', 'danger')}}>
                    {this.props.multiple ? null : <option style={{ display: 'none' }} />}
                    {optionsData.map(item => <option key={item.value} value={item.value}>{item.text}</option>)}
                </select>
            </label>
        )
    }
}