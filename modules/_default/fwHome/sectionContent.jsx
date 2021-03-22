import React from 'react';
import { connect } from 'react-redux';
import { getContent } from './redux/reduxContent';

class sectionContent extends React.Component {
    state = { content: {} };
    componentDidMount() {
        if (this.props.contentId) {
            this.props.getContent(this.props.contentId, data => data && data.item && this.setState(data.item));
        }
    }

    render() {
        return <div style={{ marginTop: '110px' }} dangerouslySetInnerHTML={{ __html: this.state.content }} />;
    }
}

const mapStateToProps = state => ({ content: state.content });
const mapActionsToProps = { getContent };
export default connect(mapStateToProps, mapActionsToProps)(sectionContent);