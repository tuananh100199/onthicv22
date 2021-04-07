import React from 'react';
import { connect } from 'react-redux';
import { homeGetStaffGroup } from './redux/reduxStaffGroup';

class SectionStaffGroup extends React.Component {
    state = {};
    componentDidMount() {
        if (this.props.viewId) {
            this.props.homeGetStaffGroup(this.props.viewId, data => this.setState(data));
        }
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    // renderStaff = (staff) => {
    //     // const fbLink = staff.info.facebook ? <a href={staff.info.facebook} target='_blank' style={{ fontSize: '20px' }}><span className='icon-facebook'></span></a> : '',
    //     //     websiteLink = staff.info.website ? <a href={staff.info.website} target='_blank' className='' style={{ fontSize: '20px' }}>W</a> : '',
    //     const emailLink = staff.user.email ? <a href={'mailto:' + staff.user.email} className='' style={{ fontSize: '20px' }}><span className='icon-mail_outline'></span></a> : '';

    //     return (
    //         <div className='block-2'>
    //             <div className='flipper'>
    //                 <div className='front' style={{ backgroundImage: 'url(' + staff.image || staff.user.image + ')' }}>
    //                     <div className='box'>
    //                         <h2>{staff.user.lastname + ' ' + staff.user.firstname}</h2>
    //                         {/* <p>{staff.info.academicTitle}</p> */}
    //                         {/* <p>{staff.description}</p> */}
    //                     </div>
    //                 </div>
    //                 <div className='back'>
    //                     <blockquote>
    //                         <p className='innerHTML' dangerouslySetInnerHTML={{ __html: staff.description }}></p>
    //                     </blockquote>
    //                     <div className='author d-flex'>
    //                         <div className='image mr-3 align-self-center'>
    //                             <div className='img' style={{ backgroundImage: 'url(' + staff.image || staff.user.image + ')' }}></div>
    //                         </div>
    //                         <div className='name align-self-center'>
    //                             {staff.user.lastname + ' ' + staff.user.firstname}<br />
    //                             <span className=''> {emailLink}</span>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    render() {
        // let staffs = [],
        //     numOfStaff = this.state.items ? this.state.items.length : 0;
        // if (numOfStaff == 0) {
        //     staffs = [];
        // } else {
        //     const times = Math.floor(numOfStaff / 4), remainder = numOfStaff % 4;
        //     for (let i = 0; i < times * 4; i++) {
        //         staffs.push(
        //             <div className='col-md-6 col-lg-3 ftco-animate'>
        //                 {this.renderStaff(this.state.items[i])}
        //             </div>
        //         );
        //     }
        //     if (remainder == 1) {
        //         staffs.push(
        //             <div className='col-md-6 col-lg-3 ftco-animate offset-lg-4dot5'>
        //                 {this.renderStaff(this.state.items[times * 4])}
        //             </div>
        //         );
        //     }
        //     else if (remainder == 2) {
        //         staffs.push(
        //             <div className='col-md-6 col-lg-3 ftco-animate offset-lg-3'>
        //                 {this.renderStaff(this.state.items[times * 4])}
        //             </div>
        //         );
        //         staffs.push(
        //             <div className='col-md-6 col-lg-3 ftco-animate'>
        //                 {this.renderStaff(this.state.items[times * 4 + 1])}
        //             </div>
        //         );
        //     }
        //     else if (remainder == 3) {
        //         staffs.push(
        //             <div className='col-md-6 col-lg-3 ftco-animate offset-lg-1dot5'>
        //                 {this.renderStaff(this.state.items[times * 4])}
        //             </div>
        //         );
        //         staffs.push(
        //             <div className='col-md-6 col-lg-3 ftco-animate'>
        //                 {this.renderStaff(this.state.items[times * 4 + 1])}
        //             </div>
        //         );
        //         staffs.push(
        //             <div className='col-md-6 col-lg-3 ftco-animate'>
        //                 {this.renderStaff(this.state.items[times * 4 + 2])}
        //             </div>
        //         );
        //     }
        // }

        return (<>
            <div className='service_col text-center'>
                <h2>{this.state.title}</h2>
            </div>
            <div className='row'>
                {this.state.items ? this.state.items.map((staff, index) => (
                    <div key={index} className='col-md-3 service_col' style={{ margin: 'auto' }}>
                        <div className='text-center'>
                            <img style={{}} src={staff.image || staff.user.image} height={100} alt='' />
                            <div className='service_title'>{staff.user.lastname + ' ' + staff.user.firstname}</div>
                            <div className='service_text'>
                                <p>{staff.description}</p>
                            </div>
                        </div>
                    </div>)) : null}
            </div>
            {/* <div className='row'>{staffs}</div> */}
        </>
        );
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { homeGetStaffGroup };
export default connect(mapStateToProps, mapActionsToProps)(SectionStaffGroup);