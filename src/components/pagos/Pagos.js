import React, { Component } from 'react';
import Tabla from '../Tabla';
import { message, Tooltip, Space, Input, Row, Col, PageHeader } from 'antd';
import { StopOutlined, BarcodeOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';
import firebase from 'firebase';

const { Search } = Input;

class Pagos extends Component
{
    constructor(props) {
        super(props);

        this.refPagos = app.firestore().collection('pagos');
        this.refContratos = app.firestore().collection('contratos');
        this.unsubscribe = null;
        this.state = {
            busqueda: '',
            loading: true,
            pagos: [],
        };

        this.barcodeRef = React.createRef();
    }

    capitalize = s => {
        if (typeof s !== 'string') return s
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    verFecha = fecha => {
        return this.capitalize(new Date(fecha.seconds * 1000).toLocaleDateString("es-SV", {year: 'numeric', month: 'short'}))
    }

    obtenerPagos = (querySnapshot) => {
        const pagos = [];
        const { busqueda } = this.state;
        this.setState({ loading: true })

        querySnapshot.forEach((doc) => {
            let { cantidad, codigo_contrato, nombre_cliente, numero_cuota, fecha_creacion } = doc.data();

            if (fecha_creacion)
                console.log(fecha_creacion.toDate())
            fecha_creacion = "UwU";

            if (busqueda &&
                codigo_contrato.toLowerCase().indexOf(busqueda) === -1 &&
                nombre_cliente.toLowerCase().indexOf(busqueda) === -1
            )
            {
                return;
            }

            pagos.push({
                key: doc.id,
                cantidad,
                codigo_contrato,
                nombre_cliente,
                numero_cuota,
                fecha_creacion
            });
        });

        this.setState({
            pagos,
            loading: false
        });
    }

    componentDidMount() {
        this.refPagos.onSnapshot(this.obtenerPagos);
        this.barcodeRef.current.focus();
    }

    buscar(valor) {
        if (valor !== this.state.busqueda) {
            this.setState({ busqueda: valor })
            this.refPagos
            .get()
            .then(querySnapshot => this.obtenerPagos(querySnapshot));
        }
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'Contrato',
                dataIndex: 'codigo_contrato',
            },
            {
                title: 'Cliente',
                dataIndex: 'nombre_cliente'
            },
            {
                title: 'Cuota',
                dataIndex: 'numero_cuota',
            },
            {
                title: 'Fecha',
                dataIndex: 'fecha_creacion',
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Cancelar">
                            <StopOutlined key="cancel" onClick={() => console.log('cancel')} style={{ color: '#f5222d' }} />
                        </Tooltip>
                    </Space>
                )
            }
        ]
    }

    agregarPago = async codigo => {
        if (/(R[\d]{1,3})(-|')(\d{1,3})(-|')(\d{4})(-|')(\d{4})(-|')\d{2}/.test(codigo))
        {
            let exist = false;
            let codContrato = codigo.substring(0, codigo.length -3);

            await this.refPagos.doc(codigo)
            .get()
            .then(pago => {
                if (pago.exists) {
                    message.error('¡Esta cuota ya fue cancelada!');
                    exist = true;
                }
            })

            if (exist) return;

            this.refContratos.doc(codContrato)
            .get()
            .then(contrato => {
                if (contrato.exists) {
                    contrato.ref.collection('cuotas').doc(codigo.substr(-2))
                    .get()
                    .then(cuota => {
                        if (cuota.exists) {
                            let d_cuota = cuota.data();
                            let d_contrato = contrato.data();

                            this.refPagos.doc(d_cuota.codigo).set({
                                cantidad: d_cuota.cantidad,
                                codigo_contrato: contrato.id,
                                nombre_cliente: d_contrato.cliente,
                                numero_cuota: cuota.id,
                                fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                            }).then(doc => {
                                cuota.ref.update({ cancelado: true })
                                .then(() => message.success('Ok, ok, sí existe'))
                            })
                        }
                    })
                } else {
                    message.error('La cuota NO existe');
                }
            })
        } else {
            message.warn('El formato del código no es válido')
        }
    }

    render(){
        const { pagos, loading } = this.state;

        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title="Pagos"
                    subTitle="Agregar pago"
                    onBack={() => null}
                    extra={[
                        <Input
                            key="1"
                            addonBefore={<BarcodeOutlined />}
                            placeholder="Codigo de cuota"
                            style={{ width: 240 }}
                            ref={this.barcodeRef}
                            maxLength={20}
                            allowClear
                            onKeyUp={ev => {
                                if (ev.keyCode === 13) {
                                    this.agregarPago(ev.target.value);
                                }
                            }}
                        />
                    ]}
                />
                <Tabla
                    titulo={
                        <>
                            <Row justify="space-between">
                                <Col span={4}>
                                    <strong>Lista de pagos</strong>
                                </Col>
                                <Col span={4} offset={5}>
                                    <Space>
                                        <Search
                                            placeholder="Buscar"
                                            onSearch={value => this.buscar(value) }
                                            style={{ width: 180 }}
                                        />
                                    </Space>
                                </Col>
                            </Row>
                        </>
                    }
                    columnas={this.columnas}
                    data={pagos}
                    loading={loading}
                />
            </div>
        );
    }
}

export default Pagos;
