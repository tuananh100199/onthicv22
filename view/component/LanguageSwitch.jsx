import React from 'react';
import { connect } from 'react-redux';
import { updateSystemState } from '../../module/_init/reduxSystem.jsx';

class LanguageSwitch extends React.Component {
    render() {
        return <img src={`/img/flag/${T.language.next()}.png`} style={{ position: 'fixed', top: '6px', right: '6px', width: '32px', zIndex: 3000, cursor: 'pointer' }}
            alt='flag' onClick={() => this.props.updateSystemState(T.language.switch())} />;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateSystemState };
export default connect(mapStateToProps, mapActionsToProps)(LanguageSwitch);
