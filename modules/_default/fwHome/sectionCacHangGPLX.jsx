import React from 'react';
import { connect } from 'react-redux';
import './style.css';

class SectionCacHangGPLX extends React.Component {
    render() {
        return (
            <div className='intro_hang_GPLX'>
                <div className="intro_col">
                    <div style={{backgroundColor: '#199d76', width: '100%', paddingLeft: '33px', paddingRight: '34px', paddingBottom: '41px', paddingTop: '85px', boxShadow: '0px 25px 38px rgb(0 0 0 / 20%'}}>
                    <div style={{position: 'absolute', top: 0, height: '80px', background: '#199D76', lineHeight: '80px', textAlign: 'center', fontSize: '24px', fontWeight: 600, color: '#FFFFFF'}}>
                        Các hạng giấy phép lái xe
                    </div>
                    <div className="row" style={{backgroundColor: 'white', border: '1px solid #199D76', margin: '5px 0'}}>
                        <div className="col-md-3" style={{padding: 0, borderRight: '3px solid #199D76'}}>
                        <h3 style={{fontWeight: 'bold', textAlign: 'center', paddingTop: '15px', color: '#199D76'}}>
                            B1
                        </h3>
                        <div style={{textAlign: 'center'}}>
                            <img alt="Những sai lầm lớn khi bảo dưỡng xe ô tô 2021" src="https://truongdaotaolaixehcm.com/wp-content/uploads/2018/03/nhung-sai-lam-lon-khi-bao-duong-xe-o-to-1024x768.jpg" style={{width: '80px'}} />
                        </div>
                        </div>
                        <div className="col-md-9 content" style={{margin: 'auto', padding: '7px', color: '#199D76'}}>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Cấp cho người điều kiển ô tô tự động chở người
                            đến 09 chổ ngồi, ô tô tải chuyên dùng số tự động,
                            có trọng tải thiết kế dưới 3500Kg, không chuyên
                            nghiệp
                        </p>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Cho người có đủ sức khỏe từ 18 tuổi trở lên
                        </p>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Có thời hạn đến khi người lái xe đủ 55 tuổi đối
                            với nữ và đủ 60 tuổi đối với nam; trường hợp người
                            lái xe trên 45 tuổi đối với nữ và trên 50 tuổi đối
                            với nam giấy phép lái xe được cấp có thời hạn 10
                            năm, kể từ ngày cấp.
                        </p>
                        </div>
                    </div>
                    <div className="row" style={{backgroundColor: 'white', border: '1px solid #199D76', margin: '5px 0'}}>
                        <div className="col-md-3" style={{padding: 0, borderRight: '3px solid #199D76'}}>
                        <h3 style={{fontWeight: 'bold', textAlign: 'center', paddingTop: '15px', color: '#199D76'}}>
                            B2
                        </h3>
                        <div style={{textAlign: 'center'}}>
                            <img alt="Những sai lầm lớn khi bảo dưỡng xe ô tô 2021" src="https://truongdaotaolaixehcm.com/wp-content/uploads/2018/03/nhung-sai-lam-lon-khi-bao-duong-xe-o-to-1024x768.jpg" style={{width: '80px'}} />
                        </div>
                        </div>
                        <div className="col-md-9 content" style={{margin: 'auto', padding: '7px'}}>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Cấp cho người điều kiển ô tô chở người đến 09
                            chổ ngồi; ô tô tải, máy kéo kéo rơmooc có trọng
                            tải dưới 3500Kg và xe hạng B1
                        </p>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Cho người có đủ sức khỏe từ 18 tuổi trở lên
                        </p>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Có thời hạn 10 năm, kể từ ngày cấp.
                        </p>
                        </div>
                    </div>
                    <div className="row" style={{backgroundColor: 'white', border: '1px solid #199D76', margin: '5px 0'}}>
                        <div className="col-md-3" style={{padding: 0, borderRight: '3px solid #199D76'}}>
                        <h3 style={{fontWeight: 'bold', textAlign: 'center', paddingTop: '15px', color: '#199D76'}}>
                            C
                        </h3>
                        <div style={{textAlign: 'center'}}>
                            <img alt="Những sai lầm lớn khi bảo dưỡng xe ô tô 2021" src="http://www.otoxemay.vn/uploads/128UID1598346568/files/Xe-tai-Tera190SL-va-Tera345SL-2020-thung-bat.jpg" style={{width: '80px'}} />
                        </div>
                        </div>
                        <div className="col-md-9 content" style={{margin: 'auto', padding: '7px'}}>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Cấp cho người điều kiển ô tô tải, máy kéo kéo
                            rơmooc, có trọng tải từ 3500Kg trở lên và xe hạng
                            B1, B2
                        </p>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Cho người có đủ sức khỏe từ 21 tuổi trở lên.
                        </p>
                        <p style={{fontSize: '12px', margin: '0px', lineHeight: '1.3', color: '#199D76'}}>
                            - Có thời hạn 5 năm, kể từ ngày cấp.
                        </p>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { };
export default connect(mapStateToProps, mapActionsToProps)(SectionCacHangGPLX);
