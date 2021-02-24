import React from 'react';
import { connect } from 'react-redux';

class SectionSubscribe extends React.Component {
    background = React.createRef();
    state = {};

    componentDidMount() {
        $(this.background.current).parallax();
    }

    componentWillUnmount = () => {
        $(this.background.current).parallax('destroy');
    }

    render() {
        let subscribe = this.props && this.props.system && this.props.system.subscribe ? this.props.system.subscribe : '/img/subscribe.jpg';
        return (
            <div className="newsletter">
                <div ref={this.background} className="parallax_background parallax-window" data-parallax="scroll" data-image-src={subscribe} data-speed="0.8"></div>
                <div className="container">
                    <div className="row">
                        <div className="col text-center">
                            <div className="newsletter_title">Subscribe to our newsletter</div>
                        </div>
                    </div>
                    <div className="row newsletter_row">
                        <div className="col-lg-8 offset-lg-2">
                            <div className="newsletter_form_container">
                                <form action="#" id="newsleter_form" className="newsletter_form">
                                    <input type="email" className="newsletter_input" placeholder="Your E-mail" required="required" />
                                    <button className="newsletter_button">subscribe</button>
                                </form>
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
export default connect(mapStateToProps, mapActionsToProps)(SectionSubscribe);