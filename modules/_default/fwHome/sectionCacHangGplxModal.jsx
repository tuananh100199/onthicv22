import React from 'react';

export default class GplxModal extends React.Component {
    state={gplx:{}};
    show = (gplx) => {
        this.setState({gplx});
        $(this.modal).modal('show');
    };

    hide = () => $(this.modal).modal('hide');

    render() {
        let gplx = this.state.gplx;
        return (
            <div ref={e => this.modal = e} className='modal fade' tabIndex='-1' role='dialog' aria-hidden='true'style={{width:'100vw',zIndex:1200}} >
                <div className='modal-dialog'>
                    <div className='modal-content'>
                    <div className='advisory_form_container'>
                        <h4 className='intro_form_title'>{gplx.title||''}</h4>
                        {gplx.content && (gplx.content.split('\n') || []).map((subItem, index) => (
                            <p key={index}>{subItem}</p>
                        ))}
                    </div>
                    </div>
                </div>
            </div>);
    }
}