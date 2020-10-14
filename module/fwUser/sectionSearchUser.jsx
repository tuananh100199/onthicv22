import React from 'react';
import Select from 'react-select';
import { ajaxGetUserInPage, ajaxGetUser } from './redux.jsx';

export default class SectionSearchUser extends React.Component {
    state = {
        selectedUser: { value: '', label: '' },
        currentSearchValue: '',
        options: [],
    };
    
    componentDidMount() {
        T.ready(() => {
            const handleGetData = (timeOut, done) => {
                if (this.props.userId) {
                    if (this.props.multiple && Array.isArray(this.props.userId)) {
                        setTimeout(() => {
                            this.setState({
                                selectedUser: this.props.userId.map((user) => ({
                                    value: user._id,
                                    label: `${user.lastname} ${user.firstname} (${user.email})`,
                                })),
                            });
                        }, 250);
                    } else {
                        ajaxGetUser(this.props.userId, ({ _, user }) => {
                            if (user) {
                                this.setState({
                                    selectedUser: {
                                        value: user._id,
                                        label: `${user.lastname} ${user.firstname} (${user.email})`,
                                    },
                                });
                            }
                        });
                    }
                    done && done();
                } else if (timeOut >= 2000) {
                    done && done();
                } else {
                    setTimeout(() => handleGetData(timeOut + 200, done), 200);
                }
            };
            
            handleGetData(0, () => {
                if (this.props.externalUsers) {
                    const timeOutUserLength = (timeOut = 0) => {
                        if (this.props.users && this.props.users.length) {
                            const options = this.props.users.map((user) => ({
                                value: user._id,
                                label: `${user.lastname} ${user.firstname} (${user.email})`,
                            }));
                            this.setState({ options });
                        } else if (timeOut <= 3000) {
                            setTimeout(() => timeOutUserLength(timeOut + 250), 250);
                        }
                    }
                    timeOutUserLength();
                } else {
                    ajaxGetUserInPage(1, 30, this.props.condition || {}, (page) => {
                        const options = page.list.map((user) => ({
                            value: user._id,
                            label: `${user.lastname} ${user.firstname} (${user.email})`,
                        }));
                        this.setState({ options });
                    });
                }
            });
        });
    }
    
    setUsers = (users) => {
        const options = (users || []).map((user) => ({
            value: user._id,
            label: `${user.lastname} ${user.firstname} (${user.email})`,
        }));
        this.setState({ options });
    }
    
    setUser = (userId) => {
        if (this.props.multiple && Array.isArray(userId)) {
            setTimeout(() => {
                this.setState({
                    selectedUser: userId.map((user) => ({
                        value: user._id,
                        label: `${user.lastname} ${user.firstname} (${user.email})`,
                    })),
                });
            }, 250);
        } else {
            if (userId) {
                ajaxGetUser(userId, ({ _, user }) => {
                    if (user) {
                        this.setState({
                            selectedUser: { value: user._id, label: `${user.lastname} ${user.firstname} (${user.email})` },
                        });
                    }
                });
            } else {
                this.setState({ selectedUser: { value: null, label: null, }, });
            }
        }
    }
    
    handleChange = (value) => {
        if (value != this.state.currentSearchValue) {
            this.setState({ currentSearchValue: value });
            const handleTimeOut = (value) => {
                setTimeout(() => {
                    if (value == this.state.currentSearchValue) {
                        const pageCondition = Object.assign(
                            {},
                            this.props.condition || {},
                            { searchText: value }
                        );
                        
                        ajaxGetUserInPage(1, 30, pageCondition, (page) => {
                            const options = page.list.map((user) => ({
                                value: user._id,
                                label: `${user.lastname} ${user.firstname} (${user.email})`,
                            }));
                            this.setState({ options });
                        });
                    }
                }, 1000);
            };
            
            handleTimeOut(value);
        }
    }
    
    getValue = () => {
        if (this.props.multiple) {
            return (this.state.selectedUser && this.state.selectedUser.length
                    ? this.state.selectedUser
                    : []
            ).map((user) => user.value);
        } else {
            return this.state.selectedUser ? this.state.selectedUser.value : null;
        }
    }

    getName = () => {
        if (this.props.multiple) {
            return (this.state.selectedUser && this.state.selectedUser.length
                    ? this.state.selectedUser
                    : []
            ).map((user) => user.label.substring(0,user.label.indexOf('(')).trim());
        } else {
            return this.state.selectedUser ? this.state.selectedUser.label.substring(0,this.state.selectedUser.label.indexOf('(')).trim() : null;
        }
    }
    
    render() {
        const { placeholder, multiple } = this.props;
        return (
            <Select
                placeholder={placeholder || 'Lựa chọn người dùng'}
                isSearchable={true}
                isClearable={true}
                isMulti={multiple || false}
                onInputChange={this.handleChange}
                onChange={(selectedUser) => this.setState({ selectedUser })}
                value={this.state.selectedUser}
                options={this.state.options}
                styles={{
                    multiValue: (styles) => {
                        return {
                            ...styles,
                            backgroundColor: '#1488DB',
                        };
                    },
                    multiValueLabel: (styles) => ({
                        ...styles,
                        color: 'white',
                    }),
                    multiValueRemove: (styles) => ({
                        ...styles,
                        color: 'white',
                        ':hover': {
                            backgroundColor: '#1488DB',
                            color: 'white',
                        },
                    }),
                }}
            />
        );
    }
}
