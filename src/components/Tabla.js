import React from 'react';
import { Table } from 'antd';

class Tabla extends React.Component
{
    constructor(props){
        super(props);

        this.state = {
            pagination: { position: 'bottom' },
            columns: this.props.columnas,
            data: this.props.datos,

            bordered: false,
            loading: this.props.loading,
            size: 'default',
            title: () => this.props.titulo,
            showHeader: true,
            top: 'none',
            bottom: 'bottonRight'
        }
    }

    static getDerivedStateFromProps(props, state) {
        let update = {};

        if (props.loading !== state.loading) {
            update.loading = props.loading;
        }

        if (props.data !== state.data) {
            update.data = props.data
        }

        return update;
    }

    render() {
        const { ...state } = this.state;

        const tableColumns = state.columns.map(item => ({ ...item }));

        return (
            <Table
                { ...this.state }
                pagination={{ position: ['none', 'topRight'] }}
                columns={ tableColumns }
                dataSource={ state.data }
            />
        );
    }

}

export default Tabla;
