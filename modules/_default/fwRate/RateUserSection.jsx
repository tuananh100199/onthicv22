import React from 'react';
import { connect } from 'react-redux';
import { createRate, getRateByUser, updateRate } from './redux';
import { FormRichTextBox } from 'view/component/AdminPage';
import './ratingStar.scss';

class RateSection extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getRateByUser(this.props.type, this.props._refId, (rate) => {
            rate && this.setState(rate);
            this.note.value(rate.note || '');
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isSubmitted != this.props.isSubmitted) {
            if (this.props.isSubmitted == true) this.onClick();
        }
    }

    saveRating = (value) => {
        this.setState({ value });
    }

    onClick = () => {
        const data = {
            _refId: this.props._refId,
            type: this.props.type,
            value: this.state.value,
            note: this.note.value(),
        };
        this.state._id ? this.props.updateRate(this.state._id, data) : this.props.createRate(data);
    }

    render() {
        // const permission = this.getUserPermission('rate');
        const { value } = this.state;
        const { visible = true, className = '', style = {}, isNote = true, title = '', isButtonHidden = false } = this.props;
        return !visible ? null : <>
            <div className={className} style={{ textAlign: 'center', ...style }}>
                <h6 >{title}</h6>
                <div className='starrating risingstar d-flex justify-content-center flex-row-reverse'>
                    {[...Array(5).keys()].map(item => <><input type='radio' id={5 - item} checked={5 - item == value ? true : false} value={5 - item}
                        onChange={() => { }} onClick={(e) => this.saveRating(e.target.value)} /><label htmlFor={5 - item} title={`${5 - item} sao`} ></label></>)}
                </div>

                {isNote && <><FormRichTextBox label='Viết đánh giá' ref={e => this.note = e} />
                    <div style={{ ...(isButtonHidden && { display: 'none' }) }}>
                        <button className='btn btn-primary' type='button' onClick={this.onClick}> Gửi </button>
                    </div></>}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, rate: state.framework.rate });
const mapActionsToProps = { createRate, getRateByUser, updateRate };
export default connect(mapStateToProps, mapActionsToProps)(RateSection);