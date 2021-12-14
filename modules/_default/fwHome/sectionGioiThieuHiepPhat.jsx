import React from 'react';
import { connect } from 'react-redux';
import './style.css';

class SectionGioiThieuHiepPhat extends React.Component {
    render() {
        return (
            <div className='intro'>
                <div className='intro_col'>
                    <div className=''>
                        <div className='warp_gioi_thieu_HP'>
                            <div className='row'>
                                <div className='col-lg-6 col-md-12'>
                                    <div className='title_gioi_thieu'>
                                        Giới thiệu
                                        <span>TRUNG TÂM HIỆP PHÁT</span>
                                    </div>
                                    <div className='description'>
                                        Trung tâm dạy nghề lái xe HIỆP PHÁT hiểu rõ nhu cầu của học viên
                                        muốn học lái xe với trung tâm đào tạo lái xe uy tín nhất, được giảng dạy tận tâm
                                        và nhiệt tình nhất như: được giảng dạy lý thuyết dễ hiểu nắm vững kiến thức Luật Giao
                                        Thông Đường Bộ, ôn luyện trắc nghiệm câu hỏi Luật trên máy tính và quan trọng nhất đối
                                        với mỗi học viên khi tham gia các lớp học lái xe của trung tâm là xe tập lái <span>Xem thêm &gt;&gt;</span>
                                    </div>
                                    <div className='social_gioi_thieu'>
                                        <ul className='social-menu'>
                                            <li><a href='https://facebook.com/'><i className='fa fa-facebook' /></a></li>
                                            <li><a href='https://instagram.com/'><i className='fa fa-instagram' /> </a></li>
                                            <li><a href='https://twitter.com/'><i className='fa fa-twitter' /></a></li>
                                            <li><a href='https://youtube.com/'><i className='fa fa-youtube' /> </a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className='col-lg-6 col-md-12'>
                                    <div>
                                        <span className='img-intro1'>Red</span>
                                    </div>
                                    <div>
                                        <span className='img-intro2'>Green</span>
                                    </div>
                                    <div>
                                        <span className='img-intro3'>Blue</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(SectionGioiThieuHiepPhat);
