import React from 'react';
import { connect } from 'react-redux';
import { getCaptureSetting, updateCaptureSetting } from './redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

class SettingsPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready(() => {
            this.props.getCaptureSetting(data => {
                const { numberOfMinScreenCapture = 5, domainLink = '' } = data || {};
                this.numberOfMinScreenCapture.value(numberOfMinScreenCapture);
                this.domainLink.value(domainLink);
                this.setState({ numberOfMinScreenCapture, domainLink });
            });
        });
    }

    save = () => {
        this.props.updateCaptureSetting({
            numberOfMinScreenCapture: this.numberOfMinScreenCapture.value(),
            domainLink: this.domainLink.value(),
        });
    }

    capture = (e) => {
        e.preventDefault;
        // const imageSrc = this.webcam.getScreenshot();
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/public/document')
        ]).then(() => {
            // const detection = faceapi.detectAllFaces(imageSrc, 
            //     new faceapi.TinyFaceDetectorOptions());
            console.log('a');    
        });
    }

    render() {
        const permission = this.getUserPermission('settingCapture', ['read', 'write']);
        const readOnly = !permission.write;
        const videoConstraints = {
            width: 1280,
            height: 720,
            facingMode: 'user'
        };
        return this.renderPage({
            icon: 'fa fa-camera',
            title: 'Cấu hình nhận diện học viên',
            breadcrumb: ['Cấu hình nhận diện học viên'],
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <FormTextBox className='col-md-6' ref={e => this.numberOfMinScreenCapture = e} type='number' label='Số phút mỗi lần chụp ảnh' readOnly={readOnly} />
                        <FormTextBox className='col-md-6' ref={e => this.domainLink = e} label='Link domain lưu ảnh' readOnly={readOnly} />
                    </div>
                    {readOnly ? null :
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>}
                    <div className='d-flex justify-content-center'>
                        <Webcam
                            audio={false}
                            height={240}
                            ref={e => this.webcam = e}
                            screenshotFormat="image/jpeg"
                            width={240}
                            videoConstraints={videoConstraints}
                        />
                    </div>
                    <button className='btn btn-primary text-center' onClick={(e) => this.capture(e)}>Chụp ảnh</button>
                    {/* <ReactPlayer url='https://drive.google.com/file/d/1XWdDkazv6gyQvVd6jA8UD8GIE55eqBeD/preview' /> */}
                    {/* <div className='d-flex justify-content-center'>
                        <div className='embed-responsive embed-responsive-16by9' style={{ width: '70%', display: 'block' }} >
                            <iframe width="100%" height="100%" allow="fullscreen" controls="0" src="https://drive.google.com/file/d/1XWdDkazv6gyQvVd6jA8UD8GIE55eqBeD/preview"></iframe>
                        </div>
                    </div> */}
                </div>

            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getCaptureSetting, updateCaptureSetting };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);