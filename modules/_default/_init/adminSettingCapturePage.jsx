import React from 'react';
import { connect } from 'react-redux';
import { getCaptureSetting, updateCaptureSetting } from './redux';
import { AdminPage, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import Webcam from 'react-webcam';
import * as faceApi from 'face-api.js';

class SettingsPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready(() => {
            this.props.getCaptureSetting(data => {
                const { numberOfMinScreenCapture = 5, domainLink = '', activeCapture = false } = data || {};
                this.numberOfMinScreenCapture.value(numberOfMinScreenCapture);
                this.domainLink.value(domainLink);
                this.activeCapture.value(activeCapture);
                this.setState({ numberOfMinScreenCapture, domainLink, activeCapture });
            });
        });
    }

    save = () => {
        this.props.updateCaptureSetting({
            numberOfMinScreenCapture: this.numberOfMinScreenCapture.value(),
            domainLink: this.domainLink.value(),
            activeCapture: this.activeCapture.value()
        });
    }

    capture = (e) => {
        e.preventDefault;
        const imageSrc = this.webcam.getScreenshot();
        this.setState({imageSrc},()=>{
            faceApi.nets.ssdMobilenetv1.load('/models/').then(()=>{
                const options = new faceApi.SsdMobilenetv1Options({
                    inputSize: 512,
                    scoreThreshold: 0.5
                });
                faceApi.detectSingleFace('img', options).then((result)=>{
                    if(result) $('#result').text('Đã phát hiện khuôn mặt');
                    else $('#result').text('Không phát hiện khuôn mặt');
                });
            });
        });   
    }

    render() {
        const permission = this.getUserPermission('settingCapture', ['read', 'write']);
        const imgSrc = this.state.imageSrc;
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
                        <FormTextBox className='col-md-5' ref={e => this.numberOfMinScreenCapture = e} type='number' label='Số phút mỗi lần chụp ảnh' readOnly={readOnly} />
                        <FormTextBox className='col-md-5' ref={e => this.domainLink = e} label='Link domain lưu ảnh' readOnly={readOnly} />
                        <FormCheckbox className='col-md-2' ref={e => this.activeCapture = e} isSwitch={true} label='Kích hoạt' readOnly={readOnly} onChange={active => this.props.updateCaptureSetting({
                            activeCapture: active,
                            numberOfMinScreenCapture: this.numberOfMinScreenCapture.value(),
                            domainLink: this.domainLink.value(),
                        })} />
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
                            screenshotFormat='image/jpeg'
                            width={240}
                            videoConstraints={videoConstraints}
                        />
                    </div>
                    <button className='btn btn-primary text-center' onClick={(e) => this.capture(e)}>Chụp ảnh</button>
                    <div>
                        {imgSrc && (<img id='img' src={imgSrc}></img>)}
                        {imgSrc && (<p id='result'></p>)}
                    </div>
                    
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