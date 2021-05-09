import React from 'react';
import { connect } from 'react-redux';
import { homeGetStaffGroup } from './redux/reduxStaffGroup';

class SectionStaffGroup extends React.Component {
    state = {};
    componentDidMount() {
        this.props.viewId && this.props.homeGetStaffGroup(this.props.viewId, data => this.setState(data));
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    render() {
        return <>
            <div className='team text-center'>
                <h2>{this.state.title}</h2>
            </div>
            <div className='row'>
                {this.state.items ? this.state.items.map((staff, index) => (
                    <div key={index} className='col-md-6 col-lg-3 team_col ftco-animate' style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                        {/* // <div key={index} className={this.state.items.length == 4 ? 'col-md-6 col-lg-3 team_col ftco-animate' : 'col-md-6 col-lg-4 team_col ftco-animate'} style={{ marginLeft: 'auto', marginRight: 'auto' }}> */}
                        <div className='team_item text-center d-flex flex-column aling-items-center justify-content'>
                            <div className='team_image' style={{ height: 300 }}><img src={staff.image || staff.user.image} alt='' /></div>
                            <div className='team_content text-center'>
                                <div className='team_name' style={{ whiteSpace: 'nowrap' }}>{staff.user.lastname + ' ' + staff.user.firstname}</div>
                                <div className='team_title' style={{ height: 10 }}>{staff.user.isLecturer && 'Giáo viên' || staff.user.isStaff && 'Nhân viên'}</div>
                                <div className='team_text'>
                                    <blockquote>
                                        <p>&ldquo;{staff.description}&rdquo;</p>
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>)) : null}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { homeGetStaffGroup };
export default connect(mapStateToProps, mapActionsToProps)(SectionStaffGroup);