import React from 'react';
import Tabla from '../Tabla';
import { Space, Button } from 'antd';
import ModalDatos from './ModalDatos';

class Clientes extends React.Component
{
    state = {
        visible: false,
        registro: null
    }

    componentDidMount() {
    }

    columnas = this.asignarColumnas();
    datos = this.asignarDatos();

    asignarColumnas() {
        return [
            {
                title: 'Nombre',
                dataIndex: 'nombre',
                sorter: true
            },
            {
                title: 'DUI',
                dataIndex: 'dui',
                sorter: true
            },
            {
                title: 'Dirección',
                dataIndex: 'direccion',
                sorter: true
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="middle">
                        {/* <a href="#" onClick={ () => { this.modalInfo(record); } }>Detalle</a> */}
                        <Button type="link" onClick={ () => { this.modalData(record); } }>Editar</Button>
                        {/* <a href="#">Dar de baja</a> */}
                    </Space>
                )
            }
        ]
    }

    asignarDatos() {
        let data = [];
        for (let i = 0; i <= 20; i++){
            data.push({
                key: i,
                nombre: "Juan Perez",
                dui: `${i}5714580-3`,
                direccion: `${i} San Salvador Mejicanos`,
            });
        }

        return data;
    }

    modalData = (record) => {
        this.setState({
            visible: true,
            registro: record
        })
    }

    handleCancel = () => {
        this.setState({
            visible: false,
            registro: null
        })
    }

    render(){
        const { visible, registro } = this.state;

        return (
            <div>
                <ModalDatos
                    visible={visible}
                    title={registro ? 'Editar información' : 'Agregar cliente'}
                    handleCancel={this.handleCancel}
                    record={registro}
                />
                <Tabla
                    titulo={
                        <>
                            <Space>
                                <strong>Lista de clientes</strong>
                                <Button size="small" type="primary" ghost onClick={() => this.modalData()}>Nuevo</Button>
                            </Space>
                        </>
                    }
                    columnas={this.columnas}
                    datos={this.datos}
                />
            </div>
        );
    }
}

export default Clientes;
