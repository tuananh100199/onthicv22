import React from 'react';
import { connect } from 'react-redux';
// import { FormTextBox } from 'view/component/AdminPage';

class AdminFeedbackView extends React.Component {

    componentDidMount() {
    }

    render() {
        return (
            <div className='row'>
                <div className='col-md-3' >
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <div style={{ marginTop: 8, marginRight: 8 }}>
                            <i className='fa fa-check'></i> Đã trả lời
                        </div>
                        Danh sách trống!
                    </div>
                </div>

                <div className='col-md-9'>
                    <h3 className='tile-title'>Phản hồi</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        Danh sách trống!
                    </div>
                </div>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminFeedbackView);
