import React from 'react';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { ready: false };
        this.editor = React.createRef();
        this.ckEditor = null;
    }

    componentDidMount() {
        $(document).ready(() => {
            const config = {
                filebrowserUploadUrl: this.props.uploadUrl ?
                    this.props.uploadUrl + (this.props.uploadUrl.includes('?') ? '&' : '?') + 'Type=File' : '/upload?Type=File',
            };
            if (this.props.height) config.height = this.props.height;

            this.ckEditor = CKEDITOR.replace(this.editor.current, config);
            this.ckEditor.on('instanceReady', () => {
                if (this.state.ready == false) {
                    if (this.state.value) this.ckEditor.setData(this.state.value);
                    this.setState({ ready: true });
                }
            });
        });
    }

    html = (value) => {
        if (value || value == '') {
            this.setState({ value });
            if (this.state.ready) this.ckEditor.setData(value);
        } else {
            return this.ckEditor.getData();
        }
    }

    text = () => $(this.ckEditor.getData()).text().replace(/\r?\n|\r/gm, ' ').replace(/\s\s+/g, ' ').trim();

    render() {
        return [
            <div key={0} dangerouslySetInnerHTML={{ __html: this.props.readOnly ? this.state.value : '' }}/>,
            <div key={1} style={{ display: this.props.readOnly ? 'none' : 'block' }}>
                <textarea key={0} ref={this.editor} style={{ width: '100%' }} defaultValue={this.props.defaultValue} />
                <p style={{ width: '100%', textAlign: 'center', display: this.state.ready ? 'none' : 'block' }}>Loading...</p>
            </div>
        ];
    }
}
