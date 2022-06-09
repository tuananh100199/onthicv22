import React from 'react';
import QRCode from 'react-qr-code';

export default class QrCodeModal extends React.Component {
    state={}
    show = (item) =>{
        const {title='',link} = item||{};
        this.setState({title,link},()=>{
            $(this.modal).modal('show');
        });
    } 

    hide = () => $(this.modal).modal('hide');

    render() {
        const {link,title=''} = this.state;
        return (
            <div ref={e => this.modal = e} className='modal fade' tabIndex='-1' role='dialog' >
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className="d-flex flex-column align-items-center p-4">
                            <h4 className='text-center'>{title}</h4>
                            {link ?<>
                                <QRCode value={link} size={200}/>
                                <a href={link} without rel="noreferrer" style={{whiteSpace:'normal'}} target='_blank' className="btn btn-link">Nhấp vào đây để tải trực tiếp trên điện thoại</a>
                            </>:'Thông tin đang được cập nhật'} 
                        </div>
                    </div>
                </div>
            </div>);
    }
}