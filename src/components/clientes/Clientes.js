import React from 'react';
import Tabla from '../Tabla';
import { Space, Modal, Button, Form, Input } from 'antd';
import TextArea from 'antd/lib/input/TextArea';

// const form = Form;

class Clientes extends React.Component
{
    state = {
        loading: false,
        visible: false
    }

    constructor(props) {
        super(props);

        // console.log(form);
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
                        <a href="#">Dar de baja</a>
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
        // form.validateFields()
        // .then(values => {
        //     form.resetFields();
        //     console.log(values);
        // })
        // .catch(info => {
        //     console.log('Validar los datos introducidos', info);
        // })
        // setTimeout(() => {
        //     this.setState({ loading: false, visible: false })
        // }, 3000);
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
                    <Form
                        // form={form}
                    >
                        <Form.Item
                            name="nombre"
                            label="Nombre"
                            rules={[
                                {
                                    required: true,
                                    message: 'Introducir el nombre del cliente'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="dui"
                            label="No. DUI"
                            rules={[
                                {
                                    required: true,
                                    message: 'Introducir el número de DUI'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="direccion"
                            label="Dirección"
                            rules={[
                                {
                                    required: true,
                                    message: 'Introduzca la dirección del cliente'
                                }
                            ]}
                        >
                            <TextArea></TextArea>
                        </Form.Item>
                    </Form>
                </Modal>

                <Tabla
                    titulo={
                        <>
                            <Space>
                                <strong>Lista de clientes</strong>
                                <Button size="small" type="primary" ghost onClick={() => alert('Hello world')}>Nuevo</Button>
                            </Space>
                        </>
                    }
                    columnas={this.columnas}
                    datos={this.datos}
                />
            </>
        );
    }
}

export default Clientes;
