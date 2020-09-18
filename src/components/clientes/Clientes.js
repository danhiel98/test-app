import React from 'react';
import Tabla from '../Tabla';
import { Space, Modal, Button } from 'antd';

class Clientes extends React.Component
{
    state = {
        loading: false,
        visible: false
    }

    constructor(props) {
        super(props);
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
                        <a href="#" onClick={ () => { this.modalEditar(record); } }>Editar</a>
                        <a href="#" className="ant-dropdown-link">
                            More actions
                        </a>
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
                dui: `05714580-3`,
                direccion: `San Salvador ${i} Mejicanos`,
            });
        }

        return data;
    }

    modalEditar = (record) => {
        this.showModal()
    }

    showModal = () => {
        this.setState({
            visible: true
        })
    }

    handleOk = () => {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false, visible: false })
        }, 3000);
    }

    handleCancel = () => {
        this.setState( { visible: false } )
    }

    render(){
        const { visible, loading } = this.state;

        return (
            <>
                <Modal
                    visible={visible}
                    title="Título"
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={[
                        <>
                            <Button key="back" onClick={this.handleCancel}>
                                Regresar
                            </Button>
                            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
                                Enviar
                            </Button>
                        </>
                    ]}
                >
                    <h1>Hola cracks</h1>
                </Modal>
                <Tabla
                    columnas={this.columnas}
                    datos={this.datos}
                />
                {/* <Table
                    { ...this.state }
                    pagination={{ position: ['none', 'topRight'] }}
                    columns={ tableColumns }
                    dataSource={ state.data }
                /> */}
            </>
        );
    }
}

export default Clientes;
