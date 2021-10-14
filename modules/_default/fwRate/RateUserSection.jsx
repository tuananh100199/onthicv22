import React from 'react';
import { connect } from 'react-redux';
import { createRate } from './redux';
import { FormRichTextBox } from 'view/component/AdminPage';
import './ratingStar.scss';

class RateSection extends React.Component {
    state = {};
    // componentDidMount() {
    //     this.props.getRateByUser(this.props.type,this.props._refId);
    // }

    saveRating = (rateNumber) => {
        this.setState({ rateNumber });
    }

    onClick= ()=>{
        const data = {
            _refId: this.props._refId,
            type: this.props.type,
            value:this.state.rateNumber,
            note:this.note.value(),
        };
        this.props.createRate(data);
    }

    render() {
        // const permission = this.getUserPermission('rate');
        // const rate =this.props.rate;
        const {  visible = true } = this.props;
        return !visible ? null : <>
            <div className='tile'>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h6 style={{ textAlign: 'center' }}>{this.props.title}</h6>
                        <div className='starrating risingstar d-flex justify-content-center flex-row-reverse'>
                            {[...Array(5).keys()].map(item => <><input type='radio' id={5 - item} name='rating' value={5 - item} onClick={(e) => this.saveRating(e.target.value)} /><label htmlFor={5 - item} title={`${5 - item} sao`} ></label></>)}
                        </div>
                        <FormRichTextBox ref={e => this.note = e} style={{ display: 'flex' }} />
                        <div style={{ textAlign: 'center' }}>
                            <button className='btn btn-primary' type='button' onClick={this.onClick}> Gửi </button>
                        </div>
                    </div>
                </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, rate: state.framework.rate });
const mapActionsToProps = { createRate };
export default connect(mapStateToProps, mapActionsToProps)(RateSection);