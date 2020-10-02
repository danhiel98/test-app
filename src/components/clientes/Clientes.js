import React, { Component } from 'react';
import Tabla from '../Tabla';
import { Space, Button } from 'antd';
import ModalDatos from './ModalDatos';
// eslint-disable-next-line
import app from '../../firebaseConfig';

class Clientes extends Component
{
    constructor(props){
        super(props);

        this.ref = app.firestore().collection('clientes');
        this.unsubscribe = null;
        this.state = {
            loading: true,
            clientes: [],
            visible: false,
            registro: null
        };

    }

    obtenerClientes = (querySnapshot) => {
        const clientes = [];
        this.setState({ loading: true })

        querySnapshot.forEach((doc) => {
            const { dui, nombre, apellido, departamento, municipio, direccion } = doc.data();
            clientes.push({
                key: doc.id,
                nombre: `${nombre} ${apellido}`,
                dui: dui,
                direccion: `${direccion}, ${municipio || ''}, ${departamento || ''}`
            });
        });

        this.setState({
            clientes,
            loading: false
        });
    }

    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.obtenerClientes);
    }

    columnas = this.asignarColumnas();

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
        const { visible, registro, clientes, loading } = this.state;

        return (
            <div>
                <ModalDatos
                    visible={visible}
                    title={registro ? 'Editar información' : 'Agregar cliente'}
                    handleCancel={this.handleCancel}
                    record={registro}
                    fireRef={this.ref}
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
                    data={clientes}
                    loading={loading}
                />
            </div>
        );
    }
}

export default Clientes;
