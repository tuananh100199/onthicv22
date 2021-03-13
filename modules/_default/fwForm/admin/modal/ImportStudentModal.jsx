import React from 'react';
import { connect } from 'react-redux';
import { importRegisters, clearParticipantsSession } from '../../reduxAnswer';
import FileBox from 'view/component/FileBox';

class ImportStudentModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.confirmUpload = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            T.tooltip();
            $(this.modal.current).on('shown.bs.modal', () => {
                $(this.confirmUpload.current).css('display', 'none');
            });
            $(this.modal.current).on('hidden.bs.modal', () => {
                this.props.clearParticipantsSession();
            });
        })
    }

    show = () => {
        $(this.modal.current).modal('show');
        $('#uploadNotification').html('');
        $('#uploadWarning').html('');
    };

    onSuccess = (data) => {
        $('#uploadNotification').html(data.number + ' sinh viên được tải lên thành công!');
        if (this.props.maxRegisterUsers && this.props.maxRegisterUsers !== -1 && this.props.maxRegisterUsers < data.number) {
            $('#uploadWarning').html('DANGER: Số lượng tải lên vượt quá số lượng người đăng ký tối đa!');
        } else {
            $(this.confirmUpload.current).css('display', 'block');
        }
    };

    uploadExcel = () => {
        const { questions, formId } = this.props;
        this.props.importRegisters(formId, questions, () => {
            $(this.modal.current).modal('hide');
        });
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Import danh sách người đăng ký</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <FileBox postUrl='/user/upload' uploadType='RegistrationImportData' accept='.xls, .xlsx'
                                userData='registrationImportData' style={{ width: '100%' }} success={this.onSuccess} />
                            <p className='text-center' style={{ color: 'green' }} id='uploadNotification' />
                            <p className='text-center' style={{ color: 'red' }} id='uploadWarning' />
                        </div>
                        <div className='modal-footer'>
                            <button className='btn btn-primary' type='button' ref={this.confirmUpload} style={{ display: 'none' }} onClick={this.uploadExcel}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                            <a href={'/download/TemplateUploadFile.xlsx?t=' + new Date().getTime()} className='btn btn-primary' data-toggle='tooltip' data-placement='top' title='Tải xuống file mẫu'>
                                <i className='fa fa-fw fa-lg fa-arrow-circle-down' />File mẫu
                            </a>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({});
const mapActionsToProps = { clearParticipantsSession, importRegisters };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ImportStudentModal);
