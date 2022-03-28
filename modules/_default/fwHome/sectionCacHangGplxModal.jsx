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
            <div ref={e => this.modal = e} className='modal fade bd-example-modal-lg' tabIndex='-1' role='dialog' aria-hidden='true'style={{width:'100vw',zIndex:1200}} >
                <div className='modal-dialog modal-lg modal-dialog-centered'>
                    <div className='modal-content' style={{border:'none'}}>
                    <div className='advisory_form_container' style={{backgroundColor:'#199D76'}}>
                        <h4 className='intro_form_title' style={{backgroundColor:'white',color:'#199D76'}}>{gplx.title||''}</h4>
                        {gplx.content && (gplx.content.split('\n') || []).map((subItem, index) => (
                            <p style={{color:'white'}} key={index}>{subItem}</p>
                        ))}
                    </div>
                    </div>
                </div>
            </div>);
    }
}