
import React from 'react';
import { connect } from 'react-redux';
import { getAllContents } from '../fwHome/redux/reduxContent.jsx';
import { Link } from 'react-router-dom';

class SectionAllContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }

    componentDidMount() {
        this.props.getAllContents();
        this.getData();
    }
    getData = () => {
        if (this.props.content) {
            this.setState({ items: this.props.content });
            console.log('state', this.state)
        }
    }

    render() {
        const items = this.state.items ? this.state.items : [];
        if (items && items.length) {
            items.map((item, index) => {
                const link = '/content/item/' + item._id;
                return (
                    <div key={index}>
                        <div className='row ml-0'>
                            <div style={{ width: '150px', padding: '15px 15px 15px 0px' }} className={index < content.length - 1 ? 'border-bottom' : ''}>
                            </div>
                            <div style={{ width: 'calc(100% - 165px)', marginRight: '15px' }} className={index < content.length - 1 ? 'border-bottom' : ''}>
                                <div className='text'>
                                    <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                        <h2 className='heading pb-0 mb-0'>
                                            <Link to={link} className='text-black'>{T.language.parse(item.title)}</Link>
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        return (
            <div className='mt-2'>
                <h3>Danh sách bài viết</h3>
                <div>
                    {items}
                    {/*<button className='expand-btn' onClick={this.handleClickExpand}>*/}
                    {/*    {T.language.parse('{ "vi": "Xem thêm...", "en": "See more..." }')}*/}
                    {/*</button>*/}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, content: state.content });
const mapActionsToProps = { getAllContents };
export default connect(mapStateToProps, mapActionsToProps)(SectionAllContent);
