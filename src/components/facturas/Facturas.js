import React, { Component } from 'react';
import { Tooltip, Badge, Space, PageHeader, Input, Button } from 'antd';
import { EditOutlined, StopOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Tabla from '../Tabla';
import Factura from '../reportes/Factura';
import { pdf } from '@react-pdf/renderer';
// import ModalDatos from './ModalDatos';
// import ModalDetalle from './ModalDetalle';
// import ModalDetalleCliente from '../clientes/ModalDetalle';

const { Search } = Input;

class Contratos extends Component {
    constructor(props) {
        super(props);

        this.mainRef = app.firestore();
        this.refFacturas = this.mainRef.collection('facturas');
        // this.refContratos = app.firestore().collection('facturas');
        // this.refClientes = app.firestore().collection('clientes');
        // this.refRedes = app.firestore().collection('redes');
        this.opcFecha = { year: 'numeric', month: 'numeric', day: 'numeric' };

        this.unsubscribe = null;
        this.state = {
            loading: true,
            facturas: [],
            // facturas: [],
            // clientes: [],
            // redes: [],
            visible: false,
            registro: null,
            modalDetalle: false,
            modalDetalleCliente: false,
            codigoCliente: null
        };
    }

    formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

    obtenerFacturas = (qs) => {
        const facturas = [];
        const { busqueda } = this.state;

        qs.forEach(async (doc) => {
            let { cantidad_pagos, codigo_contrato, periodo, detalle, fecha, nombre_cliente, precio_pago, total, total_letras, ref_cliente } = doc.data();

            if
            (
                busqueda &&
                nombre_cliente.toLowerCase().indexOf(busqueda) === -1 &&
                codigo_contrato.toLowerCase().indexOf(busqueda) === -1 &&
                total_letras.toLowerCase().indexOf(busqueda) === -1 &&
                detalle.toLowerCase().indexOf(busqueda) === -1
            )
                return;

            facturas.push({
                key: doc.id,
                codigo_contrato,
                periodo,
                detalle,
                nombre_cliente,
                fecha: fecha.toDate(),
                cantidad_pagos,
                precio_pago,
                total,
                total_letras,
                ref_cliente
            });
        });
        this.setState({
            facturas,
            loading: false,
        });
    }

    obtenerRedes = qs => {
        const redes = [];

        qs.forEach(doc => {
            let { numero } = doc.data();

            redes.push({
                key: doc.id,
                numero: numero
            });
        });

        this.setState({
            redes
        });
    }

    obtenerClientes = qs => {
        const clientes = [];

        qs.forEach(doc => {
            let { dui, nombre, apellido } = doc.data();

            clientes.push({
                key: doc.id,
                dui,
                nombre,
                apellido
            });
        });

        this.setState({
            clientes
        });
    }

    componentDidMount() {
        this.unsubscribe = this.refFacturas.orderBy('fecha', 'desc').onSnapshot(this.obtenerFacturas);
        // this.refClientes.orderBy('fecha_creacion', 'desc').onSnapshot(this.obtenerClientes);
        // this.refRedes.orderBy('numero').onSnapshot(this.obtenerRedes);
    }

    buscar(valor) {
        if (valor.toLowerCase() !== this.state.busqueda) {
            this.setState({ loading: true })
            this.setState({ busqueda: valor.toLowerCase() })
            this.refFacturas
                .get()
                .then(qs => this.obtenerFacturas(qs));
        }
    }

    modalData = (record) => {
        this.setState({
            visible: true,
            registro: record
        })
    }

    handleCancel = () => {
        this.setState({
            registro: null,
            modalDetalle: false,
            modalDetalleCliente: false,
            visible: false
        })
    }

    capitalize = s => {
        if (typeof s !== 'string') return s
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    irA = ruta => {
        this.unsubscribe();
        this.props.dispatch(push(`facturas/${ruta}`));
    }

    verDetalle = record => {
        this.setState({ registro: record });
        this.setState({ modalDetalle: true });
    }

    verDetalleCliente = record => {
        this.setState({ codigoCliente: record.ref_cliente.id });
        this.setState({ modalDetalleCliente: true });
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'Cliente',
                key: 'cliente',
                render: record => (
                    <Button type="link" onClick={() => this.verDetalleCliente(record)}>
                        <strong>{ record.nombre_cliente }</strong>
                    </Button>
                )
            },
            {
                title: 'Fecha',
                dataIndex: 'fecha',
                render: fecha => (
                    <strong>
                        { fecha.toLocaleDateString('es-SV', this.opcFecha) }
                    </strong>
                )
            },
            {
                title: 'Cant. cuotas',
                dataIndex: 'cantidad_pagos',
                sorter: true,
                render: cantidad_pagos => (
                    <strong>
                        {cantidad_pagos}
                    </strong>
                )
            },
            {
                title: 'Periodo',
                dataIndex: 'periodo',
                sorter: true,
                render: periodo => (
                    <>
                        {periodo}
                    </>
                )
            },
            {
                title: 'Precio unitario',
                dataIndex: 'precio_pago',
                sorter: true,
                render: precio_pago => (
                    <strong>
                        {this.formatoDinero(precio_pago)}
                    </strong>
                )
            },
            {
                title: 'Total',
                dataIndex: 'total',
                sorter: true,
                render: total => (
                    <strong>
                        <span style={{ color: '#089D6C', fontSize: '1.2em' }}>{this.formatoDinero(total)}</span>
                    </strong>
                )
            },

            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Descargar">
                            <CloudDownloadOutlined key="download" onClick={() => this.download(record)} style={{ color: '#389e0d' }} />
                        </Tooltip>
                        <Tooltip title="Editar">
                            <EditOutlined onClick={() => this.modalData(record)} style={{ color: '#fa8c16' }} />
                        </Tooltip>
                        <Tooltip title="Cancelar">
                            <StopOutlined key="cancel" onClick={() => console.log('cancel')} style={{ color: '#f5222d' }} />
                        </Tooltip>
                    </Space>
                )
            }
        ]
    }

    download = record => {
        pdf(Factura(record)).toBlob()
        .then(file => {
            var csvURL = window.URL.createObjectURL(file);
            let tempLink = document.createElement('a');
            tempLink.href = csvURL;
            tempLink.setAttribute('download', `Factura (${record.nombre_cliente}).pdf`);
            tempLink.click();
        })
        .catch(error => {
            console.log(error);
        })
    }

    render() {
        const {
            facturas,
            loading,
            visible,
            registro,
            clientes,
            redes,
            codigoCliente,
            modalDetalle,
            modalDetalleCliente
        } = this.state;

        return (
            <div>
                {/* {
                    visible &&
                    <ModalDatos
                        visible={visible}
                        title={registro ? 'Editar información' : 'Nuevo contrato'}
                        clientes={clientes}
                        redes={redes}
                        handleCancel={this.handleCancel}
                        record={registro}
                        fireRef={this.refContratos}
                    />
                }
                {
                    modalDetalle &&
                    <ModalDetalle
                        visible={modalDetalle}
                        codigoContrato={registro.key}
                        handleCancel={this.handleCancel}
                    />
                }
                {
                    modalDetalleCliente &&
                    <ModalDetalleCliente
                        visible={modalDetalleCliente}
                        codigoCliente={codigoCliente}
                        handleCancel={this.handleCancel}
                    />
                } */}
                <PageHeader
                    className="site-page-header"
                    title="Contratos"
                    subTitle="Lista de facturas"
                    extra={
                        [
                            <Search
                                key="1"
                                placeholder="Buscar"
                                onSearch={value => this.buscar(value)}
                                style={{ width: 200 }}
                            />,
                            <Button key="2" type="primary" ghost onClick={() => this.modalData()}>
                                Nuevo
                            </Button>
                        ]
                    }
                />
                {/* {
                    !this.columnas[0].filters.length && // eslint-disable-next-line
                    redes.map(red => {
                        this.columnas[0].filters.push(
                            {
                                text: `Red ${red.numero}`,
                                value: `R${red.numero}`,
                            },
                        );
                    })
                }
                {
                    !this.columnas[2].filters.length &&
                    facturas.map(contrato => contrato.velocidad)
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .sort((a, b) => a - b) // eslint-disable-next-line
                    .map(velocidad => {
                        this.columnas[2].filters.push({
                            text: `${velocidad} Mb`,
                            value: velocidad
                        });
                    })
                } */}
                <Tabla
                    columnas={this.columnas}
                    data={facturas}
                    loading={loading}
                />
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Contratos);
