import React from 'react';
import { connect } from 'react-redux';
import { homeGetForm } from '../redux';
import { countAnswer } from '../reduxAnswer';
import { Link } from 'react-router-dom';
import HomeRegistrationForm from './homeRegistrationForm';

class HomeRegistration extends React.Component {
    constructor(props) {
        super(props);

        this.valueList = [];
        for (let i = 0; i < 300; i++) {
            this.valueList[i] = React.createRef();
        }

        this.state = { itemId: null };
    }

    componentDidMount() {
        let params = T.routeMatcher('/form/registration/item/:id').parse(window.location.pathname);
        this.props.homeGetForm(params.id, (item) => this.props.countAnswer(item._id, total => this.setState({ total })));
    }

    render() {
        const item = this.props.form && this.props.form.form ? this.props.form.form : {};
        if (item == null) {
            return (
                <div style={{ position: 'absolute', marginTop: '-65.33px', zIndex: '2500', background: '#fff', width: '100%', height: '100%' }}>
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        textAlign: 'center', border: '1px dashed #167ce9', padding: '10px',
                        p: {
                            margin: '16px'
                        }
                    }}>
                        <h3 dangerouslySetInnerHTML={{ __html: 'Form này không tồn tại hoặc đã bị khóa!' }} />
                        <p>Nhấp vào <a href='#' onClick={() => this.props.history.goBack()}>đây</a> để trở về.</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className='bg-light' style={{ position: 'absolute', marginTop: '-65.33px', zIndex: '2500', width: '100%', minHeight: '100%' }}>
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '50%', backgroundImage: `url('${item.image}')` }} />
                    <section className='container' style={{ marginTop: '10%', marginBottom: '10%' }} data-aos='fade-up'>
                        <div className='bg-white' style={{ padding: '5em 0', border: '1px solid #dee2e6' }}>
                            <div className='row justify-content-md-center'>
                                <div className='col-12 col-md-8'>
                                    <h3>{item.title}</h3>
                                    <p dangerouslySetInnerHTML={{ __html: item.description }} />
                                </div>
                            </div>
                            <HomeRegistrationForm className='row justify-content-md-center' formId={item._id} questions={item.questions}
                                formInfo={{ startRegister: item.startRegister, stopRegister: item.stopRegister, maxRegisterUsers: item.maxRegisterUsers, numOfRegisterUsers: this.state.total }} />
                        </div>
                    </section>
                    <div style={{ position: 'fixed', left: '10px', top: '10px', height: 'fit-content' }}>
                        <a href='#' onClick={() => this.props.history.goBack()} className='btn btn-dark mr-2'><i className='icon icon-backward' /></a>
                        <Link className='btn btn-info' to='/'><i className='icon icon-home' /></Link>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({ form: state.form, system: state.system });
const mapActionsToProps = {
    homeGetForm,
    countAnswer
};
export default connect(mapStateToProps, mapActionsToProps)(HomeRegistration);
